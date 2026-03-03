import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { Job } from '../job/job.model';
import { isSameCalendarMonth } from '../../../util/isSameCalendarMonth';
import { Appointment } from '../appointment/appointment.model';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../user/user.constant';
import { Employer } from '../employer/employer.model';
import { PackageName } from '../package/package.constants';

// complete profile
const completeProfile = async (user: JwtPayload) => {
  const isCompleteUserProfile = await User.isProfileFulfilled(user.id);

  if (!isCompleteUserProfile) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Please complete your profile.');
  }

  if (user.role === USER_ROLES.EMPLOYER) {
    const isComplete = await Employer.isProfileFulfilled(user.id);
    if (!isComplete) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Please complete your profile.',
      );
    }
  }
};

// get user subscription
const getUserPlan = async (userId: string) => {
  const user = await User.findById(userId)
    .populate({
      path: 'subscription',
      select: 'package currentPeriodEnd status',
      populate: { path: 'package', select: 'name' },
    })
    .lean();

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User does not exist!');
  }

  const sub = user.subscription as any;

  if (
    sub &&
    new Date(sub?.currentPeriodEnd) > new Date() &&
    sub?.package?.name
  ) {
    return sub.package.name;
  }

  return PackageName.BASIC;
};

// on create job
const onCreateJob = async (userId: string) => {
  const plan = await getUserPlan(userId);

  // check job limit for basic plan - 5 jobs per month
  if (plan === PackageName.BASIC) {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const jobCount = await Job.countDocuments({
      author: userId,
      isHiringRequest: false,
      createdAt: { $gte: startOfMonth },
    });
    console.log(`plan: ${plan} --> jobCount: ${jobCount} --> user: ${userId}`);
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
  const hasLimitation = plan === PackageName.BASIC;
  return hasLimitation;
};

// on candidate match alert
export const onJobSeekerMatchNotification = async (
  userId: string,
  lastSentAt: Date | null,
): Promise<{ isLimited: boolean; plan: string }> => {
  const plan = await getUserPlan(userId);

  // Premium users → no limitation
  if (plan !== PackageName.BASIC) {
    return { isLimited: false, plan };
  }

  // BASIC users → 1 per calendar month
  if (!lastSentAt) {
    return { isLimited: false, plan }; // never sent before → allow
  }

  const now = new Date();
  const isLimited = isSameCalendarMonth(lastSentAt, now);
  return { isLimited, plan };
};

// on create appointment
export const onCreateAppointment = async (
  userId: string,
  jobId: string,
  candidateId: string,
) => {
  const plan = await getUserPlan(userId);

  if (plan !== PackageName.BASIC) {
    return;
  }

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  // check if max appointment limit is 5 on the month
  const appointmentCount = await Appointment.countDocuments({
    sender: userId,
    createdAt: { $gte: startOfMonth },
  });

  if (appointmentCount >= 5) {
    throw new ApiError(
      StatusCodes.PAYMENT_REQUIRED,
      'Monthly limit reached. Please upgrade your plan.',
    );
  }

  // check if max appointment limit is 1 on the month for this job
  const jobAppointmentCount = await Appointment.countDocuments({
    sender: userId,
    job: jobId,
    createdAt: { $gte: startOfMonth },
  });

  if (jobAppointmentCount >= 1) {
    throw new ApiError(
      StatusCodes.PAYMENT_REQUIRED,
      'Monthly limit reached. Please upgrade your plan.',
    );
  }

  // check if already 1 appointment is created for this candidate on the month
  const candidateAppointmentCount = await Appointment.countDocuments({
    sender: userId,
    receiver: candidateId,
    createdAt: { $gte: startOfMonth },
  });

  if (candidateAppointmentCount >= 1) {
    throw new ApiError(
      StatusCodes.PAYMENT_REQUIRED,
      'Monthly limit reached. Please upgrade your plan.',
    );
  }
};

export const LimitationServices = {
  onCreateJob,
  onGetCandidateApplications,
  onJobSeekerMatchNotification,
  onCreateAppointment,
  completeProfile,
};