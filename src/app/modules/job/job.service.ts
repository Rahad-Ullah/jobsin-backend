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

// --------------- update job post --------------
const updateJob = async (id: string, payload: Partial<IJob>) => {
  // check if the job exists
  const existingJob = await Job.exists({ _id: id });
  if (!existingJob) {
    throw new Error('Job not found');
  }
  
  const result = await Job.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// --------------- delete job post --------------
const deleteJob = async (id: string) => {
  // check if the job exists
  const existingJob = await Job.exists({ _id: id });
  if (!existingJob) {
    throw new Error('Job not found');
  }

  const result = await Job.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  return result;
}

export const JobServices = {
  createJob,
  updateJob,
  deleteJob,
};
