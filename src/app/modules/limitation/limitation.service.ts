import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { SubscriptionStatus } from '../subscription/subscription.constants';
import { Job } from '../job/job.model';

// get user subscription
const getUserSubscription = async (userId: string) => {
  const user = await User.findById(userId)
    .populate({
      path: 'subscription',
      select: 'package status',
      populate: { path: 'package', select: 'name' },
    })
    .lean();

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User does not exist!');
  }

  const sub = user.subscription as any;

  if (sub && sub?.status === SubscriptionStatus.ACTIVE && sub?.package?.name) {
    return sub.package.name;
  }

  return 'BASIC';
};

// on create job
const onCreateJob = async (userId: string) => {
  const plan = await getUserSubscription(userId);

  // check job limit for basic plan - 5 jobs per month
  if (plan === 'BASIC') {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const jobCount = await Job.countDocuments({
      author: userId,
      createdAt: { $gte: startOfMonth },
    });

    if (jobCount >= 5) {
      throw new ApiError(
        StatusCodes.PAYMENT_REQUIRED,
        'Monthly limit reached. Please upgrade your plan.',
      );
    }
  }
};

export const LimitationServices = {
  onCreateJob,
};
