import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import { USER_ROLES, USER_STATUS } from '../user/user.constant';
import { JobSeeker } from '../jobSeeker/jobSeeker.model';
import { Employer } from '../employer/employer.model';

//------------------ login service ------------------
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;
  const isExistUser = await User.findOne({ email }).select(
    '+password +authentication +totpSecret',
  );
  if (!isExistUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      config.node_env === 'development'
        ? "User doesn't exist!"
        : 'Invalid email or password',
    );
  }

  // check if user is deleted
  if (isExistUser.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been deleted or deactivated.',
    );
  }

  //check if user is verified
  if (!isExistUser.isVerified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account, then try to login again',
    );
  }

  //check user status
  if (isExistUser.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been suspended or deactivated.',
    );
  }

  //check match password
  if (!(await User.isMatchPassword(password, isExistUser.password))) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      config.node_env === 'development'
        ? 'Password is incorrect!'
        : 'Invalid email or password',
    );
  }

  // check if user profile is fulfilled
  let isProfileFulfilled = true;
  if (isExistUser.role === USER_ROLES.JOB_SEEKER) {
    isProfileFulfilled = await JobSeeker.isProfileFulfilled(isExistUser._id);
  } else if (isExistUser.role === USER_ROLES.EMPLOYER) {
    isProfileFulfilled = await Employer.isProfileFulfilled(isExistUser._id);
  }

  let data, message;

  // if 2fa is active, send otp
  if (
    (isExistUser.authentication?.is2FAEmailActive && isExistUser.email) ||
    isExistUser?.totpSecret
  ) {
    const otp = generateOTP(6);
    const values = {
      name: isExistUser.name,
      otp,
      email: isExistUser.email!,
    };
    const createAccountTemplate = emailTemplate.createAccount(values);
    emailHelper.sendEmail(createAccountTemplate);

    // Save authentication info
    const authentication = {
      'authentication.is2FAProcessing': true,
      'authentication.oneTimeCode': otp,
      'authentication.expireAt': new Date(Date.now() + 3 * 60000),
    };
    await User.findOneAndUpdate({ email }, { $set: authentication });

    data = {
      role: isExistUser.role,
      userId: isExistUser._id,
      is2FAEmail: isExistUser.authentication?.is2FAEmailActive,
      is2FAAuthenticator: !!isExistUser?.totpSecret,
      isProfileFulfilled:
        isProfileFulfilled && (await User.isProfileFulfilled(isExistUser._id)),
    };
    message = 'Please check your email and enter otp to login';
  } else {
    // otherwise create access token
    const accessToken = jwtHelper.createToken(
      { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string,
    );

    data = {
      accessToken,
      role: isExistUser.role,
      isProfileFulfilled:
        isProfileFulfilled && (await User.isProfileFulfilled(isExistUser._id)),
    };
    message = 'Login successfully!';
  }

  return { data, message };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.findOne({ email });
  if (!isExistUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      config.node_env === 'development'
        ? "User doesn't exist!"
        : 'Invalid email'
    );
  }

  // check if user is deleted
  if (isExistUser.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been deleted or deactivated.'
    );
  }

  //check user status
  if (isExistUser.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been suspended or deactivated.'
    );
  }

  //send mail
  const otp = generateOTP(6);
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    'authentication.oneTimeCode': otp,
    'authentication.expireAt': new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: authentication });
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser = await User.findOne({ email }).select('+authentication');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code'
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again'
    );
  }

  let message;
  let data;

  if (!isExistUser.isVerified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        $set: {
          isVerified: true,
          'authentication.oneTimeCode': null,
          'authentication.expireAt': null,
        },
      }
    );
    message = 'Email verify successfully';
  } else if (isExistUser.authentication?.is2FAProcessing) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        $set: {
          'authentication.oneTimeCode': null,
          'authentication.expireAt': null,
        },
      }
    );

    const accessToken = jwtHelper.createToken(
      { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string
    );
    data = accessToken;
    message = 'Login Successful';
  } else {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        $set: {
          'authentication.isResetPassword': true,
          'authentication.oneTimeCode': null,
          'authentication.expireAt': null,
        },
      }
    );

    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    message =
      'Verification Successful: Please securely store and utilize this code for reset password';
    data = createToken;
  }
  return { data, message };
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication'
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password'
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    $set: {
      password: hashPassword,
      'authentication.isResetPassword': false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

const changeAdminPasswordRequest = async (userId: string) => {
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "User doesn't exist, Please try again"
    );
  }

  // check if user is deleted
  if (isExistUser.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been deleted or deactivated.'
    );
  }

  //check user status
  if (isExistUser.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been suspended or deactivated.'
    );
  }

  //send mail
  const otp = generateOTP(6);
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    'authentication.oneTimeCode': otp,
    'authentication.expireAt': new Date(Date.now() + 3 * 60000),
  };
  await User.findByIdAndUpdate(userId, { $set: authentication });
};

// admin password change
const changeAdminPasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword & { oneTimeCode: number }
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const existingUser = await User.findById(user.id).select(
    '+password +authentication'
  );
  if (!existingUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, existingUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  // one time code check
  if (payload.oneTimeCode !== existingUser.authentication?.oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP code is incorrect');
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  changeAdminPasswordRequest,
  changeAdminPasswordToDB,
};
