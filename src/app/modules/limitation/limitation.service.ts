import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { SubscriptionStatus } from '../subscription/subscription.constants';
import { Job } from '../job/job.model';
import { isSameCalendarMonth } from '../../../util/isSameCalendarMonth';

// get user subscription
const getUserPlan = async (userId: string) => {
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
  const plan = await getUserPlan(userId);

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

// on get candidate applications
const onGetCandidateApplications = async (userId: string) => {
  const plan = await getUserPlan(userId);
  const hasLimitation = plan === 'BASIC';
  return hasLimitation;
};

// on candidate match alert

export const onJobSeekerMatchNotification = async (
  userId: string,
  lastSentAt: Date | null,
): Promise<boolean> => {
  const plan = await getUserPlan(userId);

  // Premium users → no limitation
  if (plan !== 'BASIC') {
    return false;
  }

  // BASIC users → 1 per calendar month
  if (!lastSentAt) {
    return false; // never sent before → allow
  }

  const now = new Date();
  return isSameCalendarMonth(lastSentAt, now);
};

export const LimitationServices = {
  onCreateJob,
  onGetCandidateApplications,
  onJobSeekerMatchNotification,
};