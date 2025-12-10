import express from 'express';
import { JobController } from './job.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { JobValidations } from './job.validation';

const router = express.Router();

// create job post
router.post(
  '/create',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(JobValidations.createJobValidation),
  JobController.createJob
);

// update job post
router.patch(
  '/update/:id',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(JobValidations.updateJobValidation),
  JobController.updateJob
);

// delete job post
router.delete(
  '/delete/:id',
  auth(USER_ROLES.EMPLOYER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  JobController.deleteJob
);

// get single job by id
router.get('/single/:id', JobController.getSingleJobById);

// get jobs by employer id
router.get('/employer/:id', auth(), JobController.getJobsByEmployerId);

// get my jobs
router.get('/me', auth(USER_ROLES.EMPLOYER), JobController.getMyJobs);

// get all jobs
router.get('/', JobController.getAllJobs);

export const jobRoutes = router;