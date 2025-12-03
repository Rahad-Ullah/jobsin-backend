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

export const ApplicationServices = {
  createApplicationToDB,
};
