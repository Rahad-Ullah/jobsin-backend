import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { USER_ROLES } from './user.constant';
import mongoose from 'mongoose';
import { JobSeeker } from '../jobSeeker/jobSeeker.model';

export const createUserIntoDB = async (
  payload: Partial<IUser>
): Promise<string> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create User
    const createUser = await User.create([payload], { session });
    if (!createUser || !createUser[0]) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    const user = createUser[0];

    // 2. Create role-specific entity
    if (payload.role === USER_ROLES.JOB_SEEKER) {
      const jobSeeker = await JobSeeker.create(
        [
          {
            user: user._id,
          },
        ],
        { session }
      );
      // update user with jobSeeker id
      await User.findByIdAndUpdate(
        user._id,
        { $set: { jobSeeker: jobSeeker[0]._id } },
        { session }
      );
    }
    // else if (payload.role === USER_ROLES.EMPLOYER) {
    //   const employer = await Employer.create(
    //     [
    //       {
    //         user: user._id,
    //       },
    //     ],
    //     { session }
    //   );
    //   roleEntityId = employer[0]._id;
    //   user.employer = roleEntityId;
    // }

    // 4. Send email with OTP
    const otp = generateOTP(6);
    const values = {
      name: user.name,
      otp,
      email: user.email!,
    };
    const createAccountTemplate = emailTemplate.createAccount(values);
    emailHelper.sendEmail(createAccountTemplate);

    // 5. Save authentication info
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    };
    await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { authentication } },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return 'Please verify your email address to complete the registration process.';
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const createAdminToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  // set role as admin and verified true
  payload.role = USER_ROLES.ADMIN;
  payload.isVerified = true;

  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin');
  }

  return null as any;
};

const getSingleUserFromDB = async (id: string): Promise<Partial<IUser>> => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateUserByIdIntoDB = async (
  id: string,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });

  //unlink file here
  if (payload.image && isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  return updateDoc;
};

export const UserService = {
  createUserIntoDB,
  createAdminToDB,
  getSingleUserFromDB,
  updateProfileToDB: updateUserByIdIntoDB,
};
