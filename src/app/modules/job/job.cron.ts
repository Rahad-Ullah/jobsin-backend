import nodeCron from 'node-cron';
import { redisClient } from '../../../config/redis';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Types } from 'mongoose';
import { User } from '../user/user.model';
import { Employer } from '../employer/employer.model';
import { RepeatType } from '../employer/employer.constant';
import { sleep } from '../../../util/sleep';
import { LimitationServices } from '../limitation/limitation.service';
import { Job } from './job.model';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { USER_ROLES, USER_STATUS } from '../user/user.constant';
import { IUser } from '../user/user.interface';
import { IEmployer } from '../employer/employer.interface';
import { JobSeeker } from '../jobSeeker/jobSeeker.model';
import { PackageName } from '../package/package.constants';
import { JobStatus } from './job.constants';
import { translateHelper } from '../../../helpers/translateHelper';

// ############# CRON JOB FOR JOB SEEKER ALERT #############
// ----------- CONFIG -----------
const EMPLOYER_DELAY_MS = 3000; // delay between employers
const PER_NOTIFICATION_DELAY_MS = 400; // delay between notifications

// ----------- CRON STARTER -------------
export function startJobSeekerAlertCron() {
  nodeCron.schedule('*/10 * * * *', async () => {
    console.log('[CRON] Job seeker alert started');

    try {
      const activeJobs = await Job.find({
        isDeleted: false,
        deadline: { $gt: new Date() },
      }).select('author category');

      // Initialize the Map
      const employerMap = new Map();

      activeJobs.forEach(job => {
        const employerUserId = job.author.toString();

        if (!employerMap.has(employerUserId)) {
          employerMap.set(employerUserId, {
            employerUserId,
            categories: new Set(),
          });
        }
        // Add the specific job's category to the employer's set
        employerMap.get(employerUserId).categories.add(job.category);
      });

      if (employerMap.size === 0) return;

      const employers = await User.find({
        _id: { $in: Array.from(employerMap.keys()) },
        role: USER_ROLES.EMPLOYER,
      })
        .select('_id name email location employer')
        .populate('employer', 'notificationSettings');

      const now = new Date();

      for (const employerUser of employers) {
        // 1️⃣ Load employer + notification settings
        const employer = employerUser.employer as any as IEmployer;

        if (!employer || !employer.notificationSettings) continue;

        const {
          repeat,
          lastSentAt,
          pushNotification,
          emailNotification,
          email,
        } = employer.notificationSettings;

        // 2️⃣ MONTHLY LIMIT CHECK (BASIC users only)
        const { isLimited, plan } =
          await LimitationServices.onJobSeekerMatchNotification(
            employerUser._id.toString(),
            lastSentAt,
          );

        if (isLimited) {
          continue; // ⛔ already received notification in this month
        }

        // 3️⃣ DAILY / WEEKLY CHECK
        if (!shouldSendNotification(repeat, lastSentAt, now)) {
          continue;
        }

        // 4️⃣ format categories set
        const categories = Array.from(
          employerMap.get(employerUser._id.toString()).categories,
        );
        if (categories.length === 0) continue;

        // 5️⃣ Send notifications
        await sendEmployerNotification(
          employerUser,
          categories as string[],
          pushNotification,
          emailNotification,
          email,
          plan,
        );

        // 6️⃣ Update lastSentAt after success
        await Employer.updateOne(
          { user: employerUser._id },
          { 'notificationSettings.lastSentAt': now },
        );

        // 💤 throttle between employers
        await sleep(EMPLOYER_DELAY_MS);
      }

      console.log(
        `[CRON] Job seeker alert completed for ${employers.length} employers`,
      );
    } catch (err) {
      console.error('[CRON] Job seeker alert failed', err);
    }
  });
}

// ------------- FREQUENCY CHECK -------------
function shouldSendNotification(
  repeat: RepeatType,
  lastSentAt: Date | null,
  now: Date,
): boolean {
  if (!lastSentAt) return true; // first-time send

  const diffMs = now.getTime() - new Date(lastSentAt).getTime();

  if (repeat === RepeatType.DAILY) {
    return diffMs >= 24 * 60 * 60 * 1000;
  }

  if (repeat === RepeatType.WEEKLY) {
    return diffMs >= 7 * 24 * 60 * 60 * 1000;
  }

  return false;
}

// ------------- NOTIFICATION LOGIC FOR EMPLOYER -------------
async function sendEmployerNotification(
  employerUser: Partial<IUser>,
  categories: string[],
  pushNotification: boolean,
  emailNotification: boolean,
  email: string,
  plan: string,
) {
  // fetch jobSeeker ids by filtering experiences category
  const jobSeekers = await JobSeeker.find({
    'experiences.category': { $in: categories },
  }).select('_id user');

  // batch fetch jobSeeker users
  const jobSeekerUsers = await User.find({
    role: USER_ROLES.JOB_SEEKER,
    _id: { $in: jobSeekers.map(jobSeeker => jobSeeker.user) },
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: employerUser.location!.coordinates,
        },
        $maxDistance: 200 * 1000, // 200km
      },
    },
  })
    .select('name jobSeeker')
    .populate('jobSeeker', 'experiences');
  // no job seekers found
  if (jobSeekerUsers.length === 0) return;

  // select first 30 job seekers
  if (jobSeekerUsers.length > 30) jobSeekerUsers.splice(30);

  // send notifications
  if (pushNotification) {
    for (const user of jobSeekerUsers) {
      if (!user) continue;

      const jobSeeker = user.jobSeeker as any;
      const category = jobSeeker?.experiences?.[0]?.subCategory ?? '';

      await sendNotifications({
        type: 'JOB_SEEKER_ALERT',
        receiver: employerUser._id,
        title: `Job alert for ${category}`,
        message: `Job alert for ${category}`,
        referenceId: user._id.toString(),
      });

      // monthly limit: 1 notification per month for BASIC users
      if (plan === PackageName.BASIC) {
        break; // stop after sending 1 notification
      }

      // 💤 throttle per notification
      await sleep(PER_NOTIFICATION_DELAY_MS);
    }
  }

  // send email notification
  if (emailNotification && email) {
    const template = emailTemplate.jobSeekerAlert(
      employerUser,
      jobSeekerUsers as any[],
    );
    await emailHelper.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });
  }
}

// ------------- REDIS CLEANUP -----------------
async function cleanupEmployer(employerId: string) {
  await redisClient.del(`job_search:${employerId}`);
  await redisClient.del(`job_search:dedup:${employerId}`);
  await redisClient.srem('job_search:employers', employerId);
}

// ############ JOB ALERT CRON FOR JOB SEEKER ############
// ----------- CONFIG -----------
const PER_USER_DELAY_MS = 300; // throttle between users

// ----------- CRON STARTER -------------
export function startJobAlertCron() {
  nodeCron.schedule('*/10 * * * *', async () => {
    console.log('[CRON] Job alert started');

    try {
      const now = new Date();

      // 1️⃣ Load all job seekers with notification settings
      const jobSeekers = await User.find({
        role: USER_ROLES.JOB_SEEKER,
        isDeleted: false,
        status: USER_STATUS.ACTIVE,
      })
        .select('jobSeeker name email location')
        .populate('jobSeeker', 'experiences notificationSettings');

      for (const user of jobSeekers) {
        const settings = (user as any).jobSeeker?.notificationSettings;
        if (!settings) continue;
        const {
          pushNotification,
          emailNotification,
          email,
          repeat,
          lastSentAt,
        } = settings;

        // if both settings are off, skip
        if (!pushNotification && !emailNotification) {
          continue;
        }

        // 2️⃣ Check DAILY / WEEKLY timing
        if (!shouldSendJobAlert(repeat, lastSentAt, now)) {
          continue;
        }

        // 3️⃣ Find new matching jobs
        const jobs = await findMatchingJobs(user);

        if (jobs.length === 0) {
          continue; // ⛔ no jobs → no notification, don't update lastSentAt
        }

        // 4️⃣ Send push notification
        if (pushNotification) {
          for (const job of jobs) {
            await sendNotifications({
              type: 'JOB_ALERT',
              receiver: new Types.ObjectId(user._id),
              title: `New job available for ${job.subCategory}`,
              message: `New job available for you: ${job.subCategory}`,
              referenceId: job._id.toString(),
            });
          }
        }

        // 4️⃣ Send email notification
        if (emailNotification && email) {
          const template = emailTemplate.jobAlert(user, jobs);
          const translatedSubject = await translateHelper.translateHTML(
            template.subject,
            'de',
          );
          const translatedHtml = await translateHelper.translateHTML(
            template.html,
            'de',
          );
          await emailHelper.sendEmail({
            to: email,
            subject: translatedSubject,
            html: translatedHtml,
          });
        }

        // 5️⃣ Update lastSentAt after success
        await JobSeeker.updateOne(
          { user: user._id },
          { 'notificationSettings.lastSentAt': now },
        );

        // 💤 throttle between users
        await sleep(PER_USER_DELAY_MS);
      }

      console.log(
        `[CRON] Job alert completed for ${jobSeekers.length} job seekers`,
      );
    } catch (err) {
      console.error('[CRON] Job alert failed', err);
    }
  });
}

function shouldSendJobAlert(
  repeat: RepeatType,
  lastSentAt: Date | null,
  now: Date,
): boolean {
  if (!lastSentAt) return true;

  const diffMs = now.getTime() - new Date(lastSentAt).getTime();

  if (repeat === RepeatType.DAILY) {
    return diffMs >= 24 * 60 * 60 * 1000;
  }

  if (repeat === RepeatType.WEEKLY) {
    return diffMs >= 7 * 24 * 60 * 60 * 1000;
  }

  return false;
}

async function findMatchingJobs(user: any) {
  const experiences = user.jobSeeker?.experiences ?? [];
  // if user has no experience, return empty to avoid sending irrelevant job alerts
  if (experiences.length === 0) return [];
  // if user has no location, return empty to avoid sending irrelevant job alerts
  if (user.location?.coordinates?.length !== 2) return [];

  return Job.find({
    isDeleted: false,
    status: JobStatus.OPEN,
    deadline: { $gt: new Date() },
    category: { $in: experiences.map((exp: any) => exp.category) },
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: user.location.coordinates,
        },
        $maxDistance: 200 * 1000, // 200km in meters
      },
    },
  })
    .select(
      '_id category subCategory jobType experience salaryType salaryAmount deadline location',
    )
    .limit(20);
}

// ############## CRON FOR PRIORITIZE JOB LIST ############
export function startPrioritizedJobListCron() {
  // runs every day at 1:00 AM
  nodeCron.schedule('0 1 * * *', async () => {
    console.log('[CRON] Prioritizing job list started');
    try {
      // get all employer users who have premium subscription
      const usersWithSubscription = await User.find({
        isDeleted: false,
        role: USER_ROLES.EMPLOYER,
        subscription: { $ne: null },
      })
        .populate({
          path: 'subscription',
          select: 'package currentPeriodEnd status',
          populate: { path: 'package', select: 'name' },
        })
        .lean();

      const premiumEmployerIds = usersWithSubscription
        .filter(user => {
          const sub = (user as any).subscription;
          return (
            sub &&
            new Date(sub?.currentPeriodEnd) > new Date() &&
            (sub?.package?.name === PackageName.STANDARD ||
              sub?.package?.name === PackageName.BOOSTER)
          );
        })
        .map(user => user._id.toString());

      // update all jobs that have been updated in 7 days ago to prioritize
      const result = await Job.updateMany(
        {
          author: { $in: premiumEmployerIds },
          deadline: { $gt: new Date() },
          updatedAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        {},
      );
      console.log(
        `[CRON] Prioritized ${result.modifiedCount} jobs for premium employers`,
      );
    } catch (err) {
      console.error('[CRON] Prioritized job list update failed', err);
    }
  });
}
