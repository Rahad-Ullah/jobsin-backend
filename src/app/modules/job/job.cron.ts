import nodeCron from 'node-cron';
import { redisClient } from '../../../config/redis';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Types } from 'mongoose';
import { User } from '../user/user.model';
import { Employer } from '../employer/employer.model';
import { RepeatType } from '../employer/employer.constant';
import { sleep } from '../../../util/sleep';
import { LimitationServices } from '../limitation/limitation.service';

// ----------- CONFIG -----------
const EMPLOYER_DELAY_MS = 3000; // delay between employers
const PER_NOTIFICATION_DELAY_MS = 400; // delay between notifications

// ----------- CRON STARTER -------------
export function startJobSeekerAlertCron() {
  nodeCron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Job seeker alert started');

    try {
      const employers = await redisClient.smembers('job_search:employers');
      const now = new Date();

      for (const employerUserId of employers) {
        // 1️⃣ Load employer + notification settings
        const employer = await Employer.findOne({
          user: employerUserId,
        }).select('notificationSettings');

        if (!employer || !employer.notificationSettings) continue;

        const { repeat, lastSentAt } = employer.notificationSettings;

        // 2️⃣ MONTHLY LIMIT CHECK (BASIC users only)
        const isLimited =
          await LimitationServices.onJobSeekerMatchNotification(
            employerUserId,
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
          `job_search:${employerUserId}`,
        );

        if (rawEvents.length === 0) continue;

        const events = rawEvents.map(e => JSON.parse(e));

        // 5️⃣ Send notifications
        await sendEmployerNotification(employerUserId, events);

        // 6️⃣ Update lastSentAt after success
        await Employer.updateOne(
          { user: employerUserId },
          { 'notificationSettings.lastSentAt': now },
        );

        // 7️⃣ Cleanup Redis
        await cleanupEmployer(employerUserId);

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

// ------------- NOTIFICATION LOGIC -------------
async function sendEmployerNotification(employerId: string, events: any[]) {
  // 1️⃣ collect unique jobSeekerIds
  const jobSeekerIds = [...new Set(events.map(e => e.jobSeekerId))];

  // 2️⃣ batch fetch users
  const users = await User.find({
    _id: { $in: jobSeekerIds },
  })
    .select('name jobSeeker')
    .populate('jobSeeker', 'experiences');

  // 3️⃣ map for O(1) access
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  // 4️⃣ send notifications
  for (const event of events) {
    const user: any = userMap.get(event.jobSeekerId);
    if (!user) continue;

    const jobSeeker = user.jobSeeker;
    const category = jobSeeker?.experiences?.[0]?.subCategory ?? '';

    await sendNotifications({
      type: 'JOB_SEEKER_ALERT',
      receiver: new Types.ObjectId(employerId),
      title: `${user.name} ${category}`,
      message: `${user.name} is looking for ${category}`,
      referenceId: event.jobSeekerId,
    });

    // 💤 throttle per notification
    await sleep(PER_NOTIFICATION_DELAY_MS);
  }
}

// ------------- REDIS CLEANUP -----------------
async function cleanupEmployer(employerId: string) {
  await redisClient.del(`job_search:${employerId}`);
  await redisClient.del(`job_search:dedup:${employerId}`);
  await redisClient.srem('job_search:employers', employerId);
}
