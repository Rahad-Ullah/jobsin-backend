import mongoose from 'mongoose';
import { ISubscription } from './subscription.interface';
import { StatusCodes } from 'http-status-codes';
import { stripe } from '../../../config/stripe';
import { Package } from '../package/package.model';
import ApiError from '../../../errors/ApiError';
import { Subscription } from './subscription.model';
import Stripe from 'stripe';
import { User } from '../user/user.model';
import config from '../../../config';

export const createSubscription = async (payload: Partial<ISubscription>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  // check if the user exists
  const existingUser = await User.findById(payload.user).session(session);
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (!existingUser.stripeCustomerId) {
    // create new Stripe customer if not exist
    const customer = await stripe.customers.create({
      email: existingUser.email || '',
      name: existingUser.name,
      metadata: { userId: existingUser._id.toString() },
    });

    existingUser.stripeCustomerId = customer.id;
    await User.findByIdAndUpdate(existingUser._id, {
      stripeCustomerId: customer.id,
    });
  }

  // check if the package exists
  const pkg = await Package.findOne({
    _id: payload.package,
    isDeleted: false,
  }).session(session);
  if (!pkg) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
  }

  let stripeSub: Stripe.Subscription | null = null;

  try {
    // stripe write: create subscription
    try {
      stripeSub = await stripe.subscriptions.create({
        customer: existingUser.stripeCustomerId,
        items: [{ price: pkg.stripePriceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (stripeErr: any) {
      await session.abortTransaction();
      session.endSession();
      console.error(`Stripe error: ${stripeErr.message}`);
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create stripe subscription'
      );
    }

    // DB write: create subscription
    const stripePrice = stripeSub.items.data[0].price;
    const unitAmount = stripePrice.unit_amount! / 100;
    const intervalCount = stripePrice.recurring?.interval_count ?? 1;

    const subPayload = {
      ...payload,
      stripeSubscriptionId: stripeSub.id,
      stripeCustomerId: existingUser.stripeCustomerId,
      stripePriceId: stripePrice.id,
      price: unitAmount * intervalCount,
      currentPeriodStart: (stripeSub as any).current_period_start
        ? new Date((stripeSub as any).current_period_start * 1000)
        : null,
      currentPeriodEnd: (stripeSub as any).current_period_start
        ? new Date((stripeSub as any).current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: (stripeSub as any).cancel_at_period_end,
      status: stripeSub.status,
      paymentStatus:
        (typeof stripeSub.latest_invoice === 'object' &&
          (stripeSub.latest_invoice as any)?.payment_intent?.status) ??
        'incomplete',
    };

    const subscription = await Subscription.create([subPayload], { session });

    // throw error if DB failed
    if (!subscription[0]) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create subscription'
      );
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: existingUser.stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
      success_url: `${config.frontend_url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontend_url}/cancel`,
    });

    await session.commitTransaction();
    return checkoutSession.url;
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();

    // Compensation: cancel Stripe subscription if DB failed after Stripe succeeded
    if (stripeSub?.id) {
      await stripe.subscriptions.cancel(stripeSub.id).catch(() => null);
    }

    throw err;
  } finally {
    session.endSession();
  }
};

export const SubscriptionServices = {
  createSubscription,
};
