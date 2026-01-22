export enum InvoiceStatus {
  PAID = 'Paid',
  RETRYING = 'Retrying',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
}

export enum RefundReason {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  REQUESTED_BY_CUSTOMER = 'requested_by_customer',
}