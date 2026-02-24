import {
  startJobAlertCron,
  startJobSeekerAlertCron,
  startPrioritizedJobListCron,
} from '../modules/job/job.cron';
import { startSubscriptionExpirationCron } from '../modules/subscription/subscription.cron';

export function startCrons() {
  startJobSeekerAlertCron();
  startJobAlertCron();
  startSubscriptionExpirationCron();
  startPrioritizedJobListCron();
}
