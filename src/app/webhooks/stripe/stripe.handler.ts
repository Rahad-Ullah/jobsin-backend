import Stripe from 'stripe';
import { StripeWebhookServices } from './stripe.service';

export async function stripeEventHandler(event: Stripe.Event) {
  // Idempotency guard
  //   const alreadyProcessed = await StripeEvent.findOne({ eventId: event.id });
  //   if (alreadyProcessed) {
  //     return;
  //   }

  //   try {
  //   await StripeEvent.create({
  //     eventId: event.id,
  //     type: event.type,
  //     processedAt: new Date(),
  //   });
  //   } catch (err: any) {
  //     if (err.code === 11000) return; // already processed
  //     throw err;
  //   }

  // event routing
  switch (event.type) {
    case 'checkout.session.completed':
      await StripeWebhookServices.onCheckoutSessionCompleted(event);
      break;

    case 'customer.subscription.updated':
      //   await onSubscriptionUpdated(event.data.object);
      break;

    case 'customer.subscription.deleted':
      //   await onSubscriptionDeleted(event.data.object);
      break;

    case 'invoice.paid':
      //   await onInvoicePaid(event.data.object);
      break;

    case 'invoice.payment_failed':
      //   await onInvoicePaymentFailed(event.data.object);
      break;

    default:
      console.log(`Unhandled event: ${event.type}`);
  }
}
