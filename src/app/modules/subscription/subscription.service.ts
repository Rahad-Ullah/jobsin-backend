import { ISubscription } from './subscription.interface';
import { StatusCodes } from 'http-status-codes';
import { stripe } from '../../../config/stripe';
import { Package } from '../package/package.model';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import config from '../../../config';
import { Subscription } from './subscription.model';
import { SubscriptionStatus } from './subscription.constants';

export const createSubscription = async (payload: Partial<ISubscription>) => {
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
        'Failed to create Stripe customer'
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
      'User already has an active subscription for this package'
    );
  }

  // Create Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: existingUser.stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
    success_url: `${config.frontend_url}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/cancel`,
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
  });

  return checkoutSession.url;
};

export const SubscriptionServices = {
  createSubscription,
};
