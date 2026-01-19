import { Request, Response, NextFunction } from 'express';
import { PolicyServices } from './policy.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create/update policy
const createUpdatePolicy = async (req: Request, res: Response) => {
  const result = await PolicyServices.createUpdatePolicyToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Policy created successfully',
    data: result,
  });
};

// get policy
const getPolicy = async (req: Request, res: Response) => {
  const result = await PolicyServices.getPolicy();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Policy retrieved successfully',
    data: result,
  });
};

export const PolicyController = {
  createUpdatePolicy,
  getPolicy,
};
