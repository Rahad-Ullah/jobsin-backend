import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { USER_ROLES, USER_STATUS } from './user.constant';
import mongoose from 'mongoose';
import { JobSeeker } from '../jobSeeker/jobSeeker.model';
import { Employer } from '../employer/employer.model';
import QueryBuilder from '../../builder/QueryBuilder';

// ------------- create user -------------
export const createUserIntoDB = async (
  payload: Partial<IUser>,
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
        { session },
      );
      // update user with jobSeeker id
      await User.findByIdAndUpdate(
        user._id,
        { $set: { jobSeeker: jobSeeker[0]._id } },
        { session },
      );
    } else if (payload.role === USER_ROLES.EMPLOYER) {
      const employer = await Employer.create(
        [
          {
            user: user._id,
          },
        ],
        { session },
      );
      // update user with employer id
      await User.findByIdAndUpdate(
        user._id,
        { $set: { employer: employer[0]._id } },
        { session },
      );
    }

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
      { session },
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

// ------------- create admin -------------
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

// ------------- update user by id -------------
const updateUserByIdIntoDB = async (
  id: string,
  payload: Partial<IUser> & any,
) => {
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (payload.is2FAEmailActive !== undefined) {
    if (!isExistUser.email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Please add an email first to enable 2FA!',
      );
    }
    payload['authentication.is2FAEmailActive'] = payload.is2FAEmailActive;
    delete payload.is2FAEmailActive;
  }

  if (payload.is2FAAuthenticatorActive === false) {
    payload['totpSecret'] = null;
    delete payload.is2FAAuthenticatorActive;
  }

  const updateDoc = await User.findByIdAndUpdate(id, payload, {
    new: true,
  }).lean();

  //unlink file here
  if (payload.image && isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  return updateDoc;
};

// ------------- update user status by id -------------
const toggleUserStatusById = async (
  id: string,
): Promise<Partial<IUser | null>> => {
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await User.findByIdAndUpdate(
    id,
    {
      status:
        isExistUser.status === USER_STATUS.ACTIVE
          ? USER_STATUS.INACTIVE
          : USER_STATUS.ACTIVE,
    },
    {
      new: true,
    },
  );

  return updateDoc;
};

// ------------- delete user by id -------------
const deleteUserByIdFromDB = async (id: string) => {
  const isExistUser = await User.exists({ _id: id });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const result = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  return result;
};

// ------------- get user by id -------------
const getUserByIdFromDB = async (id: string): Promise<Partial<IUser>> => {
  const result = await User.findById(id)
    .populate('jobSeeker')
    .populate('employer');
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return result;
};

// ------------- get user profile -------------
const getUserProfileFromDB = async (id: string) => {
  const result = await User.findById(id)
    .select('+authentication +totpSecret')
    .lean();
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return {
    ...result,
    authentication: {
      is2FAEmailActive: result.authentication?.is2FAEmailActive,
      is2FAAuthenticatorActive: !!result.totpSecret,
    },
    totpSecret: null,
  };
};

// ------------- get all users -------------
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find({ isDeleted: false }), query)
    .search(['name', 'email', 'phone'])
    .filter()
    .sort()
    .paginate()
    .fields();
  // .populate(['jobSeeker', 'employer'], {});

  const [data, pagination] = await Promise.all([
    userQuery.modelQuery.lean(),
    userQuery.getPaginationInfo(),
  ]);
  return { data, pagination };
};

export const UserService = {
  createUserIntoDB,
  createAdminToDB,
  updateUserByIdIntoDB,
  toggleUserStatusById,
  deleteUserByIdFromDB,
  getUserByIdFromDB,
  getUserProfileFromDB,
  getAllUsersFromDB,
};
