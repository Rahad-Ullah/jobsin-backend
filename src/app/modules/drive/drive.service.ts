import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IDrive } from './drive.interface';
import { Drive } from './drive.model';
import QueryBuilder from '../../builder/QueryBuilder';

// --------------- create drive ---------------
const createDriveToDB = async (payload: Partial<IDrive>): Promise<IDrive> => {
  // check if drive already exists
  const existingDrive = await Drive.exists({ name: payload.name });
  if (existingDrive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'File name already exists');
  }

  const result = await Drive.create(payload);
  return result;
};

// -------------- update drive --------------
const updateDriveToDB = async (id: string, payload: Partial<IDrive>) => {
  // check if the drive exists
  const existingDrive = await Drive.exists({ _id: id });
  if (!existingDrive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Drive not found');
  }

  const result = await Drive.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// ------------- get all drive files by user id --------------
const getDrivesByUserId = async (
  userId: string,
  query: Record<string, any>
) => {
  const driveQuery = new QueryBuilder(Drive.find({ user: userId }), query)
    .search(['name'])
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    driveQuery.modelQuery.lean(),
    driveQuery.getPaginationInfo(),
  ]);

  return {
    data,
    pagination,
  };
};

export const DriveServices = {
  createDriveToDB,
  updateDriveToDB,
  getDrivesByUserId,
};
