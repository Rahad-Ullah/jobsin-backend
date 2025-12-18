import { Model, Types } from 'mongoose';
import { USER_ROLES, USER_STATUS } from './user.constant';

export type IUser = {
  _id: Types.ObjectId;
  name: string;
  role: USER_ROLES;
  email: string;
  password: string;
  phone: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: number[];
  };
  image?: string;
  jobSeeker?: Types.ObjectId;
  employer?: Types.ObjectId;
  adminPermissions?: string[];
  subscription: Types.ObjectId;
  status: USER_STATUS;
  isVerified: boolean;
  isAccountVerified: boolean;
  isDeleted: boolean;
  stripeCustomerId?: string;
  googleUserId?: string;
  appleUserId?: string;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
