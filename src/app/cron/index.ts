import { startJobSeekerAlertCron } from '../modules/job/job.cron';

export function startCrons() {
  startJobSeekerAlertCron();
}
