import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ISupport } from './support.interface';
import { Support } from './support.model';

// -------------- create support --------------
const createSupportToDB = async (payload: ISupport): Promise<ISupport> => {
  // check if the user submitted a support within 6 hours
  const existingSupport = await Support.findOne({
    email: payload.email,
    createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
  });
  if (existingSupport) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Already processing your another request. Please try again later.'
    );
  }

  const result = await Support.create(payload);
  return result;
};

// -------------- update support --------------
const updateSupportToDB = async (id: string, payload: Partial<ISupport>) => {
  // check if the support exists
  const existingSupport = await Support.exists({ _id: id });
  if (!existingSupport) {
    throw new Error('Support not found');
  }

  const result = await Support.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

export const SupportServices = {
  createSupportToDB,
  updateSupportToDB,
};
