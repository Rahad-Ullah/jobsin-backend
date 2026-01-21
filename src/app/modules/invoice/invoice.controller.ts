import { Request, Response, NextFunction } from 'express';
import { InvoiceServices } from './invoice.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// refund invoice
const refundInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await InvoiceServices.refundInvoiceFromDB(req.body.invoiceId, req.body.reason);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Invoice refunded successfully',
    data: result,
  });
});

// get invoices by user id
const getMyInvoices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await InvoiceServices.getInvoicesByUserIdFromDB(
      req.user.id,
      req.query
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Invoices fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }
);

// get all invoices
const getAllInvoices = catchAsync(async (req: Request, res: Response) => {
  const result = await InvoiceServices.getAllInvoicesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Invoices fetched successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const InvoiceController = {
  refundInvoice,
  getMyInvoices,
  getAllInvoices,
};