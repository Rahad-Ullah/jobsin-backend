import {
  startJobAlertCron,
  startJobSeekerAlertCron,
} from '../modules/job/job.cron';
import { startSubscriptionExpirationCron } from '../modules/subscription/subscription.cron';

export function startCrons() {
  startJobSeekerAlertCron();
  startJobAlertCron();
  startSubscriptionExpirationCron();
}
