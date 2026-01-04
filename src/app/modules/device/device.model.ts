import { Schema, model } from 'mongoose';
import { IDevice, DeviceModel } from './device.interface';

const deviceSchema = new Schema<IDevice, DeviceModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    model: { type: String, required: true },
    os: { type: String, required: true },
    loginAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Device = model<IDevice, DeviceModel>('Device', deviceSchema);
