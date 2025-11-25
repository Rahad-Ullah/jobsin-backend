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

export const EmployerServices = {
  updateEmployerByUserId,
};