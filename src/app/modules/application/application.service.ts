import QueryBuilder from '../../builder/QueryBuilder';
import { Job } from '../job/job.model';
import { Resume } from '../resume/resume.model';
import { IApplication } from './application.interface';
import { Application } from './application.model';

// ------------- create application -------------
const createApplicationToDB = async (
  payload: Partial<IApplication> & { isResume: boolean | string },
): Promise<IApplication> => {
  // check if the job exists
  const existingJob = await Job.exists({ _id: payload.job });
  if (!existingJob) {
    throw new Error('Job not found');
  }

  // check if the user already applied for the job
  const existingApplication = await Application.exists({
    job: payload.job,
    user: payload.user,
  });
  if (existingApplication) {
    throw new Error('You have already applied for this job');
  }

  // find and set resume url
  if (payload.isResume === 'true' || payload.isResume === true) {
    console.log('I am from resume block');
    const resume = await Resume.findOne({ user: payload.user });
    if (resume) {
      payload.resume = resume._id;
    }
  }

  const result = await Application.create(payload);
  return result;
};

// ------------- update application ------------
const updateApplicationToDB = async (
  id: string,
  payload: Partial<IApplication>,
) => {
  // check if the application exists
  const existingApplication = await Application.exists({ _id: id });
  if (!existingApplication) {
    throw new Error('Application not found');
  }

  const result = await Application.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

// ------------- delete application ------------
const deleteApplicationToDB = async (id: string) => {
  // check if the application exists
  const existingApplication = await Application.exists({ _id: id });
  if (!existingApplication) {
    throw new Error('Application not found');
  }

  const result = await Application.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
    },
  );
  return result;
};

// ------------- get applications by job id ------------
const getApplicationsByJobId = async (
  id: string,
  query: Record<string, any>,
) => {
  const applicationQuery = new QueryBuilder(
    Application.find({ job: id, isDeleted: false }).populate([
      {
        path: 'user',
        select: 'name email phone address image jobSeeker',
        populate: {
          path: 'jobSeeker',
        },
      },
      {
        path: 'job',
        select:
          'category subCategory jobType experience salaryType salaryAmount',
      },
      {
        path: 'resume',
      },
    ]),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    applicationQuery.modelQuery.lean(),
    applicationQuery.getPaginationInfo(),
  ]);
  return { data, pagination };
};

// ------------- get my applications ------------
const getApplicationsByUserId = async (
  id: string,
  query: Record<string, any>,
) => {
  const applicationQuery = new QueryBuilder(
    Application.find({ user: id, isDeleted: false }).populate({
      path: 'job',
      select: 'category subCategory jobType experience salaryType salaryAmount',
      populate: {
        path: 'author',
        select: 'name email phone address image',
      },
    }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    applicationQuery.modelQuery.lean(),
    applicationQuery.getPaginationInfo(),
  ]);
  return { data, pagination };
};

// ------------- get single application by id ------------
const getSingleApplicationById = async (id: string) => {
  const result = await Application.findById(id).populate([
    {
      path: 'job',
      populate: {
        path: 'author',
        select: 'name email phone address image',
      },
    },
    {
      path: 'user',
      select: 'name email phone address image jobSeeker',
    },
    {
      path: 'resume',
      select: 'educations',
    },
  ]);
  return result;
};

export const ApplicationServices = {
  createApplicationToDB,
  updateApplicationToDB,
  deleteApplicationToDB,
  getApplicationsByJobId,
  getApplicationsByUserId,
  getSingleApplicationById,
};
