import nodeCron from 'node-cron';
import { redisClient } from '../../../config/redis';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { Types } from 'mongoose';
import { User } from '../user/user.model';

// ----------- CONFIG -----------
const EMPLOYER_DELAY_MS = 3000; // delay between employers
const PER_NOTIFICATION_DELAY_MS = 400; // delay between notifications

// ----------- CRON STARTER -------------

export function startJobSeekerAlertCron() {
  nodeCron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Job seeker alert started');

    try {
      const employers = await redisClient.smembers('job_search:employers');

      for (const employerId of employers) {
        const rawEvents = await redisClient.smembers(
          `job_search:${employerId}`,
        );

        if (rawEvents.length === 0) continue;

        const events = rawEvents.map(e => JSON.parse(e));

        await sendEmployerNotification(employerId, events);

        await cleanupEmployer(employerId);

        // 💤 throttle between employers
        await sleep(EMPLOYER_DELAY_MS);
      }

      console.log('[CRON] Job seeker alert completed');
    } catch (err) {
      console.error('[CRON] Job seeker alert failed', err);
    }
  });
}

// ------------- NOTIFICATION LOGIC -------------
async function sendEmployerNotification(employerId: string, events: any[]) {
  // 1️. collect unique jobSeekerIds
  const jobSeekerIds = [...new Set(events.map(e => e.jobSeekerId))];

  // 2️. batch fetch users
  const users = await User.find({
    _id: { $in: jobSeekerIds },
  })
    .select('name jobSeeker')
    .populate('jobSeeker', 'experiences');

  // 3️. map for O(1) access
  const userMap = new Map(users.map(u => [u._id.toString(), u]));

  // 4️. send notifications
  for (const event of events) {
    const user: any = userMap.get(event.jobSeekerId);
    if (!user) continue;

    const jobSeeker = user.jobSeeker;

    await sendNotifications({
      type: 'JOB_SEEKER_ALERT',
      receiver: new Types.ObjectId(employerId),
      title: `${user.name} ${jobSeeker?.experiences?.[0]?.subCategory ?? ''}`,
      message: `${user.name} is looking for ${jobSeeker?.experiences?.[0]?.subCategory ?? ''}`,
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
