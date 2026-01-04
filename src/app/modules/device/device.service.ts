import { IDevice } from './device.interface';
import { Device } from './device.model';

// -------------- create device --------------
const createDeviceToDB = async (
  payload: Partial<IDevice>
): Promise<IDevice> => {
  const result = await Device.create(payload);
  return result;
};

// ------------- get all devices by user id -------------
const getDevicesByUserId = async (userId: string): Promise<IDevice[]> => {
  const result = await Device.find({ user: userId });
  return result;
};

export const DeviceServices = {
  createDeviceToDB,
  getDevicesByUserId,
};