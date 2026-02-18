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
import { logger } from '../../../shared/logger';

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

  // Create Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: existingUser.stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
    success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/payment/cancel`,
    payment_method_collection: 'always', // Ensures Stripe collects the necessary info for PayPal/Klarna mandates
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
  // 1. Start Session
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingUser = await User.findById(payload.user).session(session);
    if (!existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (!existingUser.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: existingUser.email || '',
        name: existingUser.name,
        metadata: { userId: existingUser._id.toString() },
      });

      // Update user with stripe ID within session
      await User.findByIdAndUpdate(
        existingUser._id,
        { stripeCustomerId: customer.id },
        { session },
      );
      existingUser.stripeCustomerId = customer.id;
    }

    const pkg = await Package.findOne({
      _id: payload.package,
      isDeleted: false,
    }).session(session);
    if (!pkg) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
    }

    const hasActiveSubscription = await Subscription.exists({
      user: payload.user,
      package: payload.package,
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
    }).session(session);

    if (hasActiveSubscription) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'User already has an active subscription for this plan',
      );
    }

    const expiryDate = calculateExpireDate(pkg.interval, pkg.intervalCount);

    const hasUsedThePlanBefore = await Subscription.exists({
      user: payload.user,
      package: payload.package,
    }).session(session);
    // add 15 days trial period for the first time
    if (!hasUsedThePlanBefore) {
      expiryDate.setUTCDate(expiryDate.getUTCDate() + 15);
    }

    const subscriptionData = {
      ...payload,
      price: 0,
      currentPeriodStart: new Date(),
      currentPeriodEnd: expiryDate,
      cancelAtPeriodEnd: true,
      status: SubscriptionStatus.ACTIVE,
      paymentStatus: PaymentStatus.UNPAID,
    };

    // 2. Create Subscription within session
    const [result] = await Subscription.create([subscriptionData], { session });

    // 3. Update User within session
    await User.findByIdAndUpdate(
      existingUser._id,
      { subscription: result._id },
      { session },
    );

    // 4. Cleanup old subscriptions
    await SubscriptionServices.cleanupOldSubscriptions(
      existingUser.stripeCustomerId,
      existingUser._id.toString(),
      result.stripeSubscriptionId,
      result._id.toString(),
    );

    await session.commitTransaction();
    return result;
  } catch (error) {
    // 5. Abort on error
    await session.abortTransaction();
    throw error;
  } finally {
    // 6. End session
    await session.endSession();
  }
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

    if (subscription.status === SubscriptionStatus.CANCELED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Subscription is already canceled',
      );
    }

    // 2. Stripe API Call (if it's failed, we won't proceed with DB changes)
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // 3. DB Write: Update subscription status
    await Subscription.findByIdAndUpdate(
      subscriptionId,
      { cancelAtPeriodEnd: true, status: SubscriptionStatus.CANCELED },
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

// cleanup old subscriptions
const cleanupOldSubscriptions = async (
  stripeCustomerId: string,
  userId: string,
  currentStripeSubId: string,
  currentSubId: string,
) => {
  const allStripeSubs = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'active',
  });

  // 1. Stripe cancellations by all promises
  const stripePromises = allStripeSubs.data
    .filter(sub => sub.id !== currentStripeSubId)
    .map(sub => stripe.subscriptions.cancel(sub.id, { prorate: true })); // prorate the remaining period

  await Promise.all([...stripePromises]);

  // 2. DB cancellations
  const result = await Subscription.updateMany(
    {
      user: userId,
      _id: { $ne: currentSubId },
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
    },
    { $set: { status: SubscriptionStatus.CANCELED, cancelAtPeriodEnd: true } },
  );

  logger.info(
    `[Stripe] Cleaned up ${stripePromises.length} old subscriptions.`,
  );
  logger.info(
    `[Subscription] Cleaned up ${result.modifiedCount} old subscriptions.`,
  );
};

// get subscription by user id
const getSubscriptionByUserId = async (userId: string) => {
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
  const filter = {
    isDeleted: false,
    role: USER_ROLES.EMPLOYER,
    subscription: { $ne: null },
  } as Record<string, unknown>;
  const status = typeof query.status === 'string' ? query.status : undefined;
  // Pre-filter subscriptions
  if (status) {
    const subscriptionIds = await Subscription.find({ status }).select('_id');

    if (subscriptionIds.length) {
      filter.subscription = { $in: subscriptionIds.map(s => s._id) };
    }
  }

  const subscribersQuery = new QueryBuilder(
    User.find(filter).populate({
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
    .search(['name', 'email'])
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
  cleanupOldSubscriptions,
  getSubscriptionByUserId,
  getAllSubscribers,
};
