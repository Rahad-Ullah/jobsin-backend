import { IDevice } from './device.interface';
import { Device } from './device.model';

// -------------- create device --------------
const createDeviceToDB = async (
  payload: Partial<IDevice>
): Promise<IDevice> => {
  // check if the user logged in from same device
  const existingDevice = await Device.findOne({
    user: payload.user,
    model: payload.model,
    os: payload.os,
  });
  if (existingDevice) {
    return existingDevice;
  }

  const result = await Device.create(payload);
  return result;
};

// ------------- remove device -------------
const removeDeviceById = async (id: string): Promise<IDevice | null> => {
  const result = await Device.findByIdAndDelete(id);
  return result;
};

// ------------- get all devices by user id -------------
const getDevicesByUserId = async (userId: string): Promise<IDevice[]> => {
  const result = await Device.find({ user: userId });
  return result;
};

export const DeviceServices = {
  createDeviceToDB,
  removeDeviceById,
  getDevicesByUserId,
};