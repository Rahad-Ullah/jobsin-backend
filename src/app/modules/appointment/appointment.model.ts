import { Schema, model } from 'mongoose';
import { IAppointment, AppointmentModel } from './appointment.interface';
import { AppointmentStatus } from './appointment.constants';

const appointmentSchema = new Schema<IAppointment, AppointmentModel>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment = model<IAppointment, AppointmentModel>(
  'Appointment',
  appointmentSchema
);
