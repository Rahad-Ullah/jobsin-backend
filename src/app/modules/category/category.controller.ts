import { Request, Response, NextFunction } from 'express';
import { CategoryServices } from './category.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create category
const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.createCategoryToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category created successfully',
    data: result,
  });
});

export const CategoryController = {
  createCategory,
};