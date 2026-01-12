import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IEmployer } from './employer.interface';
import { Employer } from './employer.model';
import { IUser } from '../user/user.interface';

// -------------- update employer service by user id --------------
export const updateEmployerByUserId = async (
  userId: string,
  payload: Partial<IEmployer>
): Promise<IEmployer | null> => {
  // check if employer exists
  const existingEmployer = await Employer.findOne({ user: userId });
  if (!existingEmployer) {
    throw new Error('Employer not found');
  }

  const result = await Employer.findByIdAndUpdate(
    existingEmployer._id,
    payload,
    { new: true }
  );

  return result;
};

// -------------- update employer user profile --------------
const updateEmployerUserProfile = async (
  userId: string,
  payload: Partial<IEmployer> & Partial<IUser>
): Promise<IEmployer | null> => {
  // check if the user exists
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const { name, phone, address, ...employerData } = payload;

  await User.findByIdAndUpdate(userId, { name, phone, address });

  const result = await Employer.findOneAndUpdate(
    { user: userId },
    employerData,
    {
      new: true,
    }
  );
  return result;
};

// -------------- get employer by user id --------------
const getEmployerByUserId = async (
  userId: string
): Promise<IEmployer | null> => {
  const employer = await Employer.findOne({ user: userId }).populate(
    'user',
    'name email role image phone address subscription status'
  );
  return employer;
};

export const EmployerServices = {
  updateEmployerByUserId,
  updateEmployerUserProfile,
  getEmployerByUserId,
};
