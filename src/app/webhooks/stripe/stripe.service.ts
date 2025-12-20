import Stripe from 'stripe';
import { User } from '../../modules/user/user.model';
import { stripe } from '../../../config/stripe';
import { Subscription } from '../../modules/subscription/subscription.model';

const onSubscriptionCreated = async (event: Stripe.Event) => {
  const session = event.data.object as Stripe.Checkout.Session;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // find user by stripeCustomerId
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (user) {
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

    // await Subscription.create({
    //   user: user._id,
    //   stripeSubscriptionId: stripeSub.id,
    //   stripeCustomerId: customerId,
    //   stripePriceId: stripeSub.items.data[0].price.id,
    //   price: stripeSub.items.data[0].price.unit_amount! / 100,
    //   currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
    //   currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    //   cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    //   status: stripeSub.status,
    //   paymentStatus:
    //     (stripeSub.latest_invoice as any)?.payment_intent?.status ??
    //     'incomplete',
    //   isDeleted: false,
    // });
  }
};

export const StripeServices = {};
