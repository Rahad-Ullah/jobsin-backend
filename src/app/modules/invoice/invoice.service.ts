import QueryBuilder from '../../builder/QueryBuilder';
import { Invoice } from './invoice.model';

// ------------- get invoices by user id -------------
const getInvoicesByUserIdFromDB = async (
  userId: string,
  query: Record<string, any>
) => {
  const invoiceQuery = new QueryBuilder(
    Invoice.find({ user: userId }).populate([
      {
        path: 'user',
        select: 'name email phone address image',
      },
      {
        path: 'subscription',
        select: 'package price status paymentStatus',
        populate: {
          path: 'package',
          select: 'name interval intervalPrice intervalCount price',
        },
      },
    ]),
    query
  )
    .search(['invoiceNumber', 'user.email', 'user.phone'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    invoiceQuery.modelQuery.lean(),
    invoiceQuery.getPaginationInfo(),
  ]);
  return { data, pagination };
};

export const InvoiceServices = {
  getInvoicesByUserIdFromDB,
};
