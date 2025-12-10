import QueryBuilder from '../../builder/QueryBuilder';
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

  const result = await Job.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

// --------------- get single job by id --------------
const getSingleJobById = async (id: string) => {
  const result = await Job.findById(id).populate({
    path: 'author',
    select: 'name email phone address image employer',
    populate: {
      path: 'employer',
      select: 'businessCategory legalForm taxNo deNo about',
    },
  });
  return result;
};

// -------------- get jobs by employer id --------------
const getJobsByEmployerId = async (id: string) => {
  const result = await Job.find({ author: id, isDeleted: false });
  return result;
};

// -------------- get all jobs with pagination --------------
const getAllJobs = async (query: Record<string, unknown>) => {
  const jobQuery = new QueryBuilder(Job.find({ isDeleted: false }), query)
    .search(['location', 'category', 'subCategory'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(['author'], { author: 'name email phone address image' });

  const [data, pagination] = await Promise.all([
    jobQuery.modelQuery.lean(),
    jobQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const JobServices = {
  createJob,
  updateJob,
  deleteJob,
  getSingleJobById,
  getJobsByEmployerId,
  getAllJobs,
};
