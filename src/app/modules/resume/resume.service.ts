import unlinkFile from '../../../shared/unlinkFile';
import { JobSeeker } from '../jobSeeker/jobSeeker.model';
import { User } from '../user/user.model';
import { IResume } from './resume.interface';
import { Resume } from './resume.model';

// --------------- create/update resume ---------------
const createUpdateResumeToDB = async (
  payload: Partial<IResume> & { image?: string }
): Promise<IResume> => {
  const existingUser = await User.findById(payload.user);
  if (!existingUser) {
    throw new Error('User not found');
  }

  // 1️⃣ get old resume BEFORE update
  const oldResume = await Resume.findOne({ user: payload.user }).select(
    'personalInfo.image'
  );

  const oldImage = oldResume?.personalInfo?.image;

  // 2️⃣ build update document
  const updateDoc: any = { ...payload };

  if (payload.image) {
    updateDoc.$set = {
      'personalInfo.image': payload.image,
    };
    delete updateDoc.image;
  }

  // 3️⃣ update / create resume
  const result = await Resume.findOneAndUpdate(
    { user: payload.user },
    updateDoc,
    {
      new: true,
      upsert: true,
    }
  );

  // 4️⃣ unlink ONLY the old image
  if (payload.image && oldImage && oldImage !== payload.image) {
    unlinkFile(oldImage);
  }

  // 5️⃣ update job seeker
  await JobSeeker.findOneAndUpdate(
    { user: existingUser._id },
    { resume: result._id },
    { new: true }
  );

  return result;
};

// --------------- get single by user id --------------
const getResumeByUserId = async (userId: string) => {
  const result = await Resume.findOne({ user: userId });
  return result;
};

export const ResumeServices = {
  createUpdateResumeToDB,
  getResumeByUserId,
};
