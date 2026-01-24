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
import { USER_ROLES } from '../user/user.constant';
import { IUser } from '../user/user.interface';
import { IEmployer } from '../employer/employer.interface';

// ############# CRON JOB FOR JOB SEEKER ALERT #############
// ----------- CONFIG -----------
const EMPLOYER_DELAY_MS = 3000; // delay between employers
const PER_NOTIFICATION_DELAY_MS = 400; // delay between notifications

// ----------- CRON STARTER -------------
export function startJobSeekerAlertCron() {
  nodeCron.schedule('*/10 * * * *', async () => {
    console.log('[CRON] Job seeker alert started');

    try {
      const employerIds = await redisClient.smembers('job_search:employers');
      if (employerIds.length === 0) return;
      const employers = await User.find({
        _id: { $in: employerIds },
        role: USER_ROLES.EMPLOYER,
      })
        .select('_id name email employer')
        .populate('employer', 'notificationSettings');

      const now = new Date();

      for (const employerUser of employers) {
        // 1️⃣ Load employer + notification settings
        const employer = employerUser.employer as any as IEmployer;

        if (!employer || !employer.notificationSettings) continue;

        const { repeat, lastSentAt, pushNotification, emailNotification } =
          employer.notificationSettings;

        // 2️⃣ MONTHLY LIMIT CHECK (BASIC users only)
        const isLimited = await LimitationServices.onJobSeekerMatchNotification(
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

        // 4️⃣ Load Redis search events
        const rawEvents = await redisClient.smembers(
          `job_search:${employerUser._id.toString()}`,
        );

        if (rawEvents.length === 0) continue;

        const events = rawEvents.map(e => JSON.parse(e));

        // 5️⃣ Send notifications
        await sendEmployerNotification(
          employerUser,
          events,
          pushNotification,
          emailNotification,
        );

        // 6️⃣ Update lastSentAt after success
        await Employer.updateOne(
          { user: employerUser._id },
          { 'notificationSettings.lastSentAt': now },
        );

        // 7️⃣ Cleanup Redis
        await cleanupEmployer(employerUser._id.toString());

        // 💤 throttle between employers
        await sleep(EMPLOYER_DELAY_MS);
      }

      console.log('[CRON] Job seeker alert completed');
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
  events: any[],
  pushNotification: boolean,
  emailNotification: boolean,
) {
  // 1️⃣ collect unique jobSeekerIds
  const jobSeekerUserIds = [...new Set(events.map(e => e.jobSeekerId))];

  // 2️⃣ batch fetch jobSeeker users
  const jobSeekerUsers = await User.find({
    _id: { $in: jobSeekerUserIds },
  })
    .select('name jobSeeker')
    .populate('jobSeeker', 'experiences');

  // 3️⃣ map for O(1) access
  const userMap = new Map(jobSeekerUsers.map(u => [u._id.toString(), u]));

  // 4️⃣ send notifications
  if (pushNotification) {
    for (const event of events) {
      const user: any = userMap.get(event.jobSeekerId);
      if (!user) continue;

      const jobSeeker = user.jobSeeker;
      const category = jobSeeker?.experiences?.[0]?.subCategory ?? '';

      await sendNotifications({
        type: 'JOB_SEEKER_ALERT',
        receiver: employerUser._id,
        title: `${user.name} - ${category}`,
        message: `${user.name} is looking for ${category}`,
        referenceId: event.jobSeekerId,
      });

      // 💤 throttle per notification
      await sleep(PER_NOTIFICATION_DELAY_MS);
    }
  }

  // 5️⃣ send email notification
  if (emailNotification && employerUser.email) {
    const template = emailTemplate.jobSeekerAlert(
      employerUser,
      jobSeekerUsers as any[],
    );
    await emailHelper.sendEmail({
      to: employerUser.email,
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
export function startJobSeekerJobAlertCron() {
  nodeCron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Job seeker job alert started');

    try {
      const now = new Date();

      // 1️⃣ Load all job seekers with notification settings
      const jobSeekers = await User.find({
        role: 'JOB_SEEKER',
      })
        .select('jobSeeker name email location')
        .populate('jobSeeker', 'experiences notificationSettings');

      for (const user of jobSeekers) {
        const settings = (user as any).jobSeeker?.notificationSettings;
        if (!settings) continue;

        const { pushNotification, emailNotification, repeat, lastSentAt } =
          settings;

        // if both settings are off, skip
        if (!pushNotification && !emailNotification) {
          continue;
        }

        // 2️⃣ Check DAILY / WEEKLY timing
        if (!shouldSendJobAlert(repeat, lastSentAt, now)) {
          continue;
        }

        // 3️⃣ Find new matching jobs
        const jobs = await findMatchingJobs(user, lastSentAt);

        if (jobs.length === 0) {
          continue; // ⛔ no jobs → no notification, don't update lastSentAt
        }

        // 4️⃣ Send push notification
        if (pushNotification) {
          for (const job of jobs) {
            await sendNotifications({
              type: 'JOB_ALERT',
              receiver: new Types.ObjectId(user._id),
              title: `New job available: ${job.subCategory}`,
              message: `New job available for you: ${job.subCategory}`,
              referenceId: job._id.toString(),
            });
          }
        }

        // 4️⃣ Send email notification
        if (emailNotification && user.email) {
          const template = emailTemplate.jobAlert(user, jobs);
          await emailHelper.sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html,
          });
        }

        // 5️⃣ Update lastSentAt after success
        await User.updateOne(
          { _id: user._id },
          { 'notificationSettings.lastSentAt': now },
        );

        // 💤 throttle between users
        await sleep(PER_USER_DELAY_MS);
      }

      console.log('[CRON] Job seeker job alert completed');
    } catch (err) {
      console.error('[CRON] Job seeker job alert failed', err);
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

async function findMatchingJobs(user: any, lastSentAt: Date | null) {
  const experiences = user.jobSeeker?.experiences ?? [];

  const query: any = {
    status: 'ACTIVE',
  };

  // Preference matching on nearby location
  if (user?.location?.coordinates?.length === 2) {
    const lat = parseFloat(user.location.coordinates[1] as string);
    const long = parseFloat(user.location.coordinates[0] as string);
    const radiusKm = 200; // radius in kilometers

    if (
      !isNaN(radiusKm) &&
      radiusKm > 0 &&
      lat !== undefined &&
      long !== undefined
    ) {
      const EARTH_RADIUS = 6378.1; // km
      const radiusInRadians = radiusKm / EARTH_RADIUS;

      query.location = {
        $geoWithin: {
          $centerSphere: [[long, lat], radiusInRadians],
        },
      };
    }
  }

  // Preference matching on recent jobs
  if (lastSentAt) {
    query.createdAt = { $gt: lastSentAt };
  }

  //  preference matching on category
  if (experiences.length > 0) {
    query.category = { $in: experiences.map((exp: any) => exp.category) };
  }

  return Job.find(query)
    .select('_id category subCategory jobType location')
    .limit(20);
}
