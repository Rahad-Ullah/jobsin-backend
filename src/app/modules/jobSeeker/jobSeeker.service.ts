import unlinkFile from '../../../shared/unlinkFile';
import { Application } from '../application/application.model';
import { Job } from '../job/job.model';
import { IJobSeeker } from './jobSeeker.interface';
import { JobSeeker } from './jobSeeker.model';

// ------------- update job seeker by user id -------------
const updateJobSeekerByUserId = async (
  userId: string,
  payload: Partial<IJobSeeker> & { removedImages?: string[] }
) => {
  // check if job seeker exists
  const existingJobSeeker = await JobSeeker.findOne({ user: userId });
  if (!existingJobSeeker) {
    throw new Error('Job seeker not found');
  }

  // removed attachments handling
  let oldAttachments = existingJobSeeker.attachments;
  if (payload.removedImages && payload.removedImages.length > 0) {
    oldAttachments = existingJobSeeker.attachments.filter(
      image => !payload.removedImages!.includes(image)
    );
  }

  // new attachments handling
  if (payload.attachments && payload.attachments.length > 0) {
    payload.attachments = [...oldAttachments, ...payload.attachments];
  } else {
    payload.attachments = oldAttachments; // keep old attachments if no new attachments
  }

  // check attachment limit
  if (payload.attachments.length > 8) {
    throw new Error('You can upload maximum 8 attachments');
  }

  // update job seeker
  const result = await JobSeeker.findOneAndUpdate({ user: userId }, payload, {
    new: true,
  });

  if (!result) {
    throw new Error('Failed to update job seeker');
  }

  // unlink previous resume if new resume are uploaded
  if (payload.resumeUrl && existingJobSeeker.resumeUrl) {
    unlinkFile(existingJobSeeker.resumeUrl);
  }
  // unlink removed attachments
  if (payload.removedImages && payload.removedImages.length > 0) {
    payload.removedImages.forEach(image => unlinkFile(image));
  }

  return result;
};

// ------------- get job seeker by user id -------------
const getJobSeekerByUserId = async (userId: string) => {
  const result = await JobSeeker.findOne({ user: userId }).populate(
    'user',
    'name email role phone address image'
  );
  return result;
};

// ------------ get job seeker with privacy -------------
const getJobSeekerWithPrivacy = async (
  jobSeekerId: string,
  employerId: string
) => {
  const result = await JobSeeker.findOne({ user: jobSeekerId })
    .populate('user', 'name email role phone address image')
    .lean();

  if (result?.isProfileVisible === false) {
    const employerJobs = await Job.find({ author: employerId })
      .select('_id')
      .lean();

    const applications = await Application.countDocuments({
      user: jobSeekerId,
      _id: { $in: employerJobs.map(job => job._id) },
      isDeleted: false,
    });

    return { ...result, isProfileVisible: applications > 0 };
  }

  return result;
};

export const JobSeekerServices = {
  updateJobSeekerByUserId,
  getJobSeekerByUserId,
  getJobSeekerWithPrivacy,
};