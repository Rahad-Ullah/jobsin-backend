import { ISubscription } from './subscription.interface';
import { StatusCodes } from 'http-status-codes';
import { stripe } from '../../../config/stripe';
import { Package } from '../package/package.model';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import config from '../../../config';
import { Subscription } from './subscription.model';
import { PaymentStatus, SubscriptionStatus } from './subscription.constants';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../user/user.constant';
import { calculateExpireDate } from '../../../util/calculateExpireDate';
import mongoose from 'mongoose';

// create subscription
const createSubscription = async (payload: Partial<ISubscription>) => {
  // check if the user exists
  const existingUser = await User.findById(payload.user);
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // create new Stripe customer if not exist
  if (!existingUser.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: existingUser.email || '',
      name: existingUser.name,
      metadata: { userId: existingUser._id.toString() },
    });

    existingUser.stripeCustomerId = customer.id;
    await User.findByIdAndUpdate(existingUser._id, {
      stripeCustomerId: customer.id,
    });

    if (!existingUser?.stripeCustomerId) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create Stripe customer',
      );
    }
  }

  // check if the package exists
  const pkg = await Package.findOne({
    _id: payload.package,
    isDeleted: false,
  });
  if (!pkg) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  // check if the user already has an active subscription
  const hasActiveSubscription = await Subscription.findOne({
    user: payload.user,
    package: payload.package,
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
  });

  if (hasActiveSubscription) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User already has an active subscription for this package',
    );
  }

  // Create Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: existingUser.stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
    success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/payment/cancel`,
    client_reference_id: existingUser._id.toString(),
    metadata: {
      userId: existingUser._id.toString(),
      packageId: pkg._id.toString(),
    },
    subscription_data: {
      metadata: {
        userId: existingUser._id.toString(),
        packageId: pkg._id.toString(),
      },
    },
    // automatic tax
    // automatic_tax: { enabled: true },
  });

  return checkoutSession.url;
};

// gift subscription
const giftSubscription = async (payload: Partial<ISubscription>) => {
  // check if the user exists
  const existingUser = await User.findById(payload.user);
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // create new Stripe customer if not exist
  if (!existingUser.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: existingUser.email || '',
      name: existingUser.name,
      metadata: { userId: existingUser._id.toString() },
    });

    existingUser.stripeCustomerId = customer.id;
    await User.findByIdAndUpdate(existingUser._id, {
      stripeCustomerId: customer.id,
    });

    if (!existingUser?.stripeCustomerId) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create Stripe customer',
      );
    }
  }

  // check if the package exists
  const pkg = await Package.findOne({
    _id: payload.package,
    isDeleted: false,
  });
  if (!pkg) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  // check if the user already has an active subscription
  const hasActiveSubscription = await Subscription.exists({
    user: payload.user,
    package: payload.package,
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
  });

  if (hasActiveSubscription) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User already has an active subscription for this package',
    );
  }

  // DB write: create subscription
  const expiryDate = calculateExpireDate(pkg.interval, pkg.intervalCount);
  payload = {
    ...payload,
    price: 0,
    currentPeriodStart: new Date(),
    currentPeriodEnd: expiryDate,
    cancelAtPeriodEnd: true,
    status: SubscriptionStatus.TRIALING,
    paymentStatus: PaymentStatus.UNPAID,
  };

  const result = await Subscription.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription creation failed');
  }

  // update user subscription
  await User.findByIdAndUpdate(existingUser._id, {
    subscription: result._id,
  });

  return result;
};

// cancel subscription
const cancelSubscription = async (subscriptionId: string) => {
  // 1. Start the Mongoose Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const subscription =
      await Subscription.findById(subscriptionId).session(session);
    if (!subscription) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subscription not found');
    }

    if (subscription.cancelAtPeriodEnd) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Subscription is already set to cancel',
      );
    }

    // 2. Stripe API Call (if it's failed, we won't proceed with DB changes)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // 3. DB Write: Update subscription status
    await Subscription.findByIdAndUpdate(
      subscriptionId,
      { cancelAtPeriodEnd: true, status: SubscriptionStatus.CANCELED },
      { session },
    );

    // 4. DB Write: Remove subscription link from user
    await User.findByIdAndUpdate(
      subscription.user,
      { subscription: null },
      { session },
    );

    // 5. Commit the changes
    await session.commitTransaction();
    return subscription;
  } catch (error) {
    // 6. If anything fails, abort the DB changes
    await session.abortTransaction();
    throw error;
  } finally {
    // 7. End the session
    session.endSession();
  }
};

// get my subscriptions
const getMySubscriptions = async (userId: string) => {
  // check if the user exists
  const existingUser = await User.findById(userId).select('_id subscription');
  if (!existingUser?.subscription) {
    return null;
  }

  const result = await Subscription.findById(
    existingUser.subscription,
  ).populate({
    path: 'package',
    select:
      'name interval dailyPrice intervalPrice intervalCount description benefits',
  });

  return result;
};

// get subscribers
const getAllSubscribers = async (query: Record<string, unknown>) => {
  const status = typeof query.status === 'string' ? query.status : undefined;

  // Pre-filter subscriptions
  const subscriptionIds = await Subscription.find(
    status ? { status } : {},
  ).select('_id');

  const subscribersQuery = new QueryBuilder(
    User.find({
      role: USER_ROLES.EMPLOYER,
      subscription: { $in: subscriptionIds.map(s => s._id) },
    }).populate({
      path: 'subscription',
      select:
        'package price status paymentStatus currentPeriodStart currentPeriodEnd',
      populate: {
        path: 'package',
        select:
          'name interval dailyPrice intervalPrice intervalCount description benefits',
      },
    }),
    query,
  )
    .paginate()
    .sort()
    .fields();

  const [data, pagination] = await Promise.all([
    subscribersQuery.modelQuery.lean(),
    subscribersQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const SubscriptionServices = {
  createSubscription,
  giftSubscription,
  cancelSubscription,
  getMySubscriptions,
  getAllSubscribers,
};
