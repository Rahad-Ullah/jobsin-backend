import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema, Types } from 'mongoose';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';
import { USER_ROLES, USER_STATUS } from './user.constant';

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        select: false,
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
        select: false,
      },
    },
    image: {
      type: String,
      default: '',
    },
    jobSeeker: {
      type: Schema.Types.ObjectId,
      ref: 'JobSeeker',
    },
    employer: {
      type: Schema.Types.ObjectId,
      ref: 'Employer',
    },
    adminPermissions: {
      type: [String],
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: {
      type: String,
      default: null,
      select: 0,
    },
    googleUserId: {
      type: String,
      default: null,
      select: 0,
    },
    appleUserId: {
      type: String,
      default: null,
      select: 0,
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        is2FAEmailActive: {
          type: Boolean,
          default: false,
        },
        is2FAProcessing: {
          type: Boolean,
          default: null,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
  },
  { timestamps: true }
);
// location index
userSchema.index({ location: '2dsphere' });

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.exists({ _id: id });
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.exists({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

// check if user profile is fulfilled
userSchema.statics.isProfileFulfilled = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId);
  const arr = [user?.name, user?.image];
  for (let item of arr) {
    if (!item) {
      return false;
    }
  }
  return true;
};

//check user
userSchema.pre('save', async function (next) {
  //check user
  const isExist = await User.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already exist!');
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);
