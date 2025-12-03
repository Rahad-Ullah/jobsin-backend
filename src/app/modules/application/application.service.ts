import QueryBuilder from '../../builder/QueryBuilder';
import { Job } from '../job/job.model';
import { Resume } from '../resume/resume.model';
import { IApplication } from './application.interface';
import { Application } from './application.model';

// ------------- create application -------------
const createApplicationToDB = async (
  payload: Partial<IApplication> & { isResume: boolean }
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
  if (payload.isResume) {
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
  payload: Partial<IApplication>
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

// ------------- get applications by job id ------------
const getApplicationsByJobId = async (
  id: string,
  query: Record<string, any>
) => {
  const applicationQuery = new QueryBuilder(
    Application.find({ job: id, isDeleted: false }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .populate(['user'], { user: 'name email phone address image' })
    .fields();

  const [data, pagination] = await Promise.all([
    applicationQuery.modelQuery.lean(),
    applicationQuery.getPaginationInfo(),
  ]);
  return { data, pagination };
};



export const ApplicationServices = {
  createApplicationToDB,
  updateApplicationToDB,
  getApplicationsByJobId,
};
