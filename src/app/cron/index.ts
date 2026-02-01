import {
  startJobAlertCron,
  startJobSeekerAlertCron,
} from '../modules/job/job.cron';

export function startCrons() {
  startJobSeekerAlertCron();
  startJobAlertCron();
}
