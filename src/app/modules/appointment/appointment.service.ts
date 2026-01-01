import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Job } from '../job/job.model';
import { IAppointment } from './appointment.interface';
import { Appointment } from './appointment.model';
import { User } from '../user/user.model';
import { AppointmentStatus } from './appointment.constants';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { USER_ROLES } from '../user/user.constant';

// ------------- create appointment -------------
const createAppointmentToDB = async (
  payload: Partial<IAppointment>
): Promise<IAppointment> => {
  // check if sender and receiver are same
  if (payload.sender!.toString() === payload.receiver!.toString()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot book an appointment with yourself'
    );
  }

  // if job is provided, check if job exists
  if (payload.job) {
    const existingJob = await Job.exists({ _id: payload.job });
    if (!existingJob) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Job not found');
    }
  }
  // if receiver is provided, check if user exists
  const receiver = await User.findById(payload.receiver);
  if (!receiver) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Receiver not found');
  }

  // check if already an appoint is booked at same date
  if (payload.scheduledAt) {
    const startOfDay = new Date(payload.scheduledAt);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(payload.scheduledAt);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.exists({
      sender: payload.sender,
      receiver: payload.receiver,
      status: { $ne: AppointmentStatus.CANCELLED }, // Don't block if previous was cancelled
      scheduledAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingAppointment) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'An appointment is already booked for this day'
      );
    }
  }

  const result = await Appointment.create(payload);

  // send email to receiver
  if (receiver.role === USER_ROLES.JOB_SEEKER) {
    const emailContent = emailTemplate.confirmAppointment(result);
    await emailHelper.sendEmail({
      to: result.receiver.toString(),
      subject: emailContent.subject,
      html: emailContent.html,
    });
  }

  return result;
};

export const AppointmentServices = {
  createAppointmentToDB,
};
