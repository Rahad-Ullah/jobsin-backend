import { VerificationStatus } from './verification.constants';
import { IVerification } from './verification.interface';
import { Verification } from './verification.model';

// ------------- create verification -------------
const createVerificationToDB = async (
  payload: Partial<IVerification>
): Promise<IVerification> => {
  // check if a request of this user is already pending
  const existingVerification = await Verification.exists({
    user: payload.user,
    status: VerificationStatus.PENDING,
  });
  if (existingVerification) {
    throw new Error('A request is already pending. Try again later');
  }

  const result = await Verification.create(payload);
  return result;
};

// ------------- update verification -------------
const updateVerificationToDB = async (
  id: string,
  payload: Partial<IVerification>
) => {
  // check if the verification exists
  const existingVerification = await Verification.exists({ _id: id });
  if (!existingVerification) {
    throw new Error('Verification not found');
  }

  const result = await Verification.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const VerificationServices = {
  createVerificationToDB,
  updateVerificationToDB,
};
