import { IDevice } from './device.interface';
import { Device } from './device.model';

// -------------- create device --------------
const createDeviceToDB = async (
  payload: Partial<IDevice>,
): Promise<IDevice> => {
  // create or update device based on user, model and os
  const result = await Device.findOneAndUpdate(
    { user: payload.user, model: payload.model, os: payload.os },
    { ...payload, loginAt: new Date() },
    { new: true, upsert: true },
  );

  return result;
};

// ------------- remove device -------------
const removeDeviceById = async (id: string): Promise<IDevice | null> => {
  const result = await Device.findByIdAndDelete(id);
  return result;
};

// ------------- get all devices by user id -------------
const getDevicesByUserId = async (userId: string): Promise<IDevice[]> => {
  const result = await Device.find({ user: userId }).sort({ loginAt: -1 });
  return result;
};

export const DeviceServices = {
  createDeviceToDB,
  removeDeviceById,
  getDevicesByUserId,
};