import { Category } from '../category/category.model';
import { IJob } from './job.interface';
import { Job } from './job.model';

// --------------- create job post --------------
const createJob = async (payload: IJob): Promise<IJob> => {
  // check if category is valid
  const existingCategory = await Category.findOne({ name: payload.category });
  if (!existingCategory) {
    throw new Error('Invalid category');
  }
  // check sub category is valid
  if (!existingCategory?.subCategories.includes(payload.subCategory)) {
    throw new Error('Invalid sub category');
  }

  const result = await Job.create(payload);
  return result;
};

export const JobServices = {
  createJob,
};
