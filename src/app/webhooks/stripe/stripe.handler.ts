import Stripe from 'stripe';
import { StripeWebhookServices } from './stripe.service';
import { StripeEvent } from '../../modules/stripeEvent/stripeEvent.model';

export async function stripeEventHandler(event: Stripe.Event) {
  // Idempotency guard
  const alreadyProcessed = await StripeEvent.exists({ id: event.id });
  if (alreadyProcessed) {
    return;
  }

  console.log('triggering webhook ----> ', event.type);

  // event routing
  switch (event.type) {
    case 'customer.subscription.created':
      await StripeWebhookServices.onCustomerSubscriptionCreated(event);
      break;

    case 'customer.subscription.updated':
      //   await onSubscriptionUpdated(event.data.object);
      break;

    case 'customer.subscription.deleted':
      //   await onSubscriptionDeleted(event.data.object);
      break;

    case 'invoice.paid':
      await StripeWebhookServices.onInvoicePaid(event);
      break;

    case 'invoice.payment_failed':
      await StripeWebhookServices.onInvoicePaymentFailed(event);
      break;

    case 'invoice.updated':
      await StripeWebhookServices.onInvoiceUpdate(event);
      break;

    default:
  }

  // log processed event
  try {
    await StripeEvent.create({
      id: event.id,
      type: event.type,
    });
  } catch (err: any) {
    if (err.code === 11000) return; // already processed
    throw err;
  }
}
