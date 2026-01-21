import { StatusCodes } from 'http-status-codes';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import QueryBuilder from '../../builder/QueryBuilder';
import { Application } from '../application/application.model';
import { Category } from '../category/category.model';
import { USER_ROLES } from '../user/user.constant';
import { User } from '../user/user.model';
import { IJob } from './job.interface';
import { Job } from './job.model';
import { redisClient } from '../../../config/redis';
import { JwtPayload } from 'jsonwebtoken';

// --------------- create job post --------------
const createJob = async (payload: IJob): Promise<IJob> => {
  // check if author exists
  const existingUser = await User.findById(payload.author).select('location');
  if (!existingUser) {
    throw new Error('User not found');
  }

  // check if category is valid
  const existingCategory = await Category.findOne({ name: payload.category });
  if (!existingCategory) {
    throw new Error('Invalid category');
  }
  // check sub category is valid
  if (!existingCategory?.subCategories.includes(payload.subCategory)) {
    throw new Error('Invalid sub category');
  }

  // inherit location from author
  payload.location = existingUser.location;

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
    { new: true },
  );
  return result;
};

// --------------- send hiring post to admin --------------
const sendHiringPostToAdmin = async (jobId: string) => {
  // check if job exists
  const existingJob = await Job.findById(jobId).populate('author');
  if (!existingJob) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Job not found');
  }
  // get admin email with fallback to super admin
  let adminEmail = config.super_admin.email;
  if (!adminEmail) {
    const admin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN }).select(
      'email',
    );
    adminEmail = admin?.email;
  }

  // send mail
  if (adminEmail) {
    const template = emailTemplate.hiringRequestToAdmin(
      existingJob,
      existingJob.author as any,
      adminEmail,
    );
    await emailHelper.sendEmail({
      to: adminEmail,
      subject: template.subject,
      html: template.html,
    });
  }
};

// --------------- get single job by id --------------
const getSingleJobById = async (id: string) => {
  const [job, applicationCount] = await Promise.all([
    Job.findById(id)
      .populate({
        path: 'author',
        select: 'name email phone address image employer',
        populate: {
          path: 'employer',
          select: 'businessCategory legalForm taxNo deNo about',
        },
      })
      .lean(),
    Application.countDocuments({ job: id }),
  ]);

  if (!job) return null;

  return {
    ...job,
    totalApplications: applicationCount,
  };
};

// -------------- get jobs by employer id --------------
const getJobsByEmployerId = async (
  id: string,
  query: Record<string, unknown>,
) => {
  const jobQuery = new QueryBuilder(
    Job.find({ author: id, isDeleted: false }),
    query,
  )
    .filter()
    .paginate()
    .sort()
    .fields()
    .populate(['author'], { author: 'name email phone address image' });

  const [data, pagination] = await Promise.all([
    jobQuery.modelQuery.lean(),
    jobQuery.getPaginationInfo(),
  ]);

  // get application count and attach with each job
  const jobsWithApplicationCount = await Promise.all(
    data.map(async (job: any) => {
      const applicationCount = await Application.countDocuments({
        job: job._id,
      });
      return {
        ...job,
        totalApplications: applicationCount,
      };
    }),
  );

  return { data: jobsWithApplicationCount, pagination };
};

// -------------- get all jobs with pagination --------------
const getAllJobs = async (query: Record<string, unknown>, user: JwtPayload) => {
  const filter: Record<string, any> = { isDeleted: false };
  // Nearby search (lat, lng, radius)
  if (query.radius && query.lat && query.lng) {
    const lat = parseFloat(query.lat as string);
    const long = parseFloat(query.lng as string);
    const radiusKm = parseFloat(query.radius as string); // radius in kilometers

    if (
      !isNaN(radiusKm) &&
      radiusKm > 0 &&
      lat !== undefined &&
      long !== undefined
    ) {
      const EARTH_RADIUS = 6378.1; // km
      const radiusInRadians = radiusKm / EARTH_RADIUS;

      filter.location = {
        $geoWithin: {
          $centerSphere: [[long, lat], radiusInRadians],
        },
      };
    }
  }

  if (query.salaryAmount) {
    filter.salaryAmount = { $lte: Number(query.salaryAmount) };
  }

  const jobQuery = new QueryBuilder(Job.find(filter), query)
    .search(['category', 'subCategory'])
    .filter(['salaryAmount', 'location', 'lat', 'lng', 'radius'])
    .sort()
    .paginate()
    .fields()
    .populate(['author'], { author: 'name email phone address image' });

  const [data, pagination] = await Promise.all([
    jobQuery.modelQuery,
    jobQuery.getPaginationInfo(),
  ]);

  // save this jobs to redis for job seeker alerts
  if (user.role === USER_ROLES.JOB_SEEKER) {
    const TTL_8_DAYS = 60 * 60 * 24 * 8;

    for (const job of data) {
      const jobSeekerId = user._id.toString();
      const employerId = job.author?._id?.toString();
      if (!employerId) continue;

      const jobId = job._id.toString();
      const dedupKey = `${jobSeekerId}:${jobId}`;

      // 1️. Check dedup
      const isNew = await redisClient.sadd(
        `job_search:dedup:${employerId}`,
        dedupKey,
      );

      // sadd returns 0 if already exists
      if (isNew === 0) continue;

      // 2️. Save event
      await redisClient.sadd(
        `job_search:${employerId}`,
        JSON.stringify({
          jobId,
          jobSeekerId,
          employerId,
          searchedAt: Date.now(),
        }),
      );

      // 3️. TTL
      await redisClient.expire(`job_search:${employerId}`, TTL_8_DAYS);
      await redisClient.expire(`job_search:dedup:${employerId}`, TTL_8_DAYS);

      // 4️. Track employer
      await redisClient.sadd('job_search:employers', employerId);
    }
  }

  return { data, pagination };
};

export const JobServices = {
  createJob,
  updateJob,
  deleteJob,
  sendHiringPostToAdmin,
  getSingleJobById,
  getJobsByEmployerId,
  getAllJobs,
};
