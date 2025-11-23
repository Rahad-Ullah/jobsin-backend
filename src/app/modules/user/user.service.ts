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

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP(6);
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return 'Please verify your email address to complete the registration process.' as any;
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
  createUserToDB,
  createAdminToDB,
  getSingleUserFromDB,
  updateProfileToDB: updateUserByIdIntoDB,
};
