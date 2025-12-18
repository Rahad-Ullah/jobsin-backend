export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  INCOMPLETE = 'incomplete',
  FAILED = 'failed',
}
