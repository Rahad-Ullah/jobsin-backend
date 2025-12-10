import { User } from '../user/user.model';
import { IResume } from './resume.interface';
import { Resume } from './resume.model';

// --------------- create/update resume ---------------
const createUpdateResumeToDB = async (
  payload: Partial<IResume>
): Promise<IResume> => {
  // check if the user exists
  const existingUser = await User.findById(payload.user);
  if (!existingUser) {
    throw new Error('User not found');
  }

  // create or update resume
  const result = await Resume.findOneAndUpdate(
    { user: payload.user },
    payload,
    {
      new: true,
      upsert: true,
    }
  );

  return result;
};

// --------------- get single by user id --------------
const getResumeByUserId = async (userId: string) => {
  const result = await Resume.findOne({ user: userId });
  return result;
}

export const ResumeServices = {
  createUpdateResumeToDB,
  getResumeByUserId,
};
