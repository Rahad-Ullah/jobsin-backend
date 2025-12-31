import { IEmployer } from './employer.interface';
import { Employer } from './employer.model';

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
  getEmployerByUserId,
};