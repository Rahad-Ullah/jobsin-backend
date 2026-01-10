import { Model, Types } from 'mongoose';
import { AppointmentStatus } from './appointment.constants';

export interface IAppointment {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  job: Types.ObjectId;
  scheduledAt: Date;
  address: string;
  message: string;
  cancelReason: string;
  status: AppointmentStatus;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AppointmentModel = Model<IAppointment>;
