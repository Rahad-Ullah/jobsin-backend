import express from 'express';
import { AppointmentController } from './appointment.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { AppointmentValidations } from './appointment.validation';

const router = express.Router();

// create appointment
router.post(
  '/create',
  auth(USER_ROLES.EMPLOYER, USER_ROLES.JOB_SEEKER),
  validateRequest(AppointmentValidations.createAppointmentZodSchema),
  AppointmentController.createAppointment
);

// update appointment
router.patch(
  '/update/:id',
  auth(USER_ROLES.EMPLOYER, USER_ROLES.JOB_SEEKER),
  validateRequest(AppointmentValidations.updateAppointmentZodSchema),
  AppointmentController.updateAppointment
);

// get my appointments
router.get(
  '/me',
  auth(USER_ROLES.EMPLOYER, USER_ROLES.JOB_SEEKER),
  AppointmentController.getMyAppointments
);

// get my appointment requests
router.get(
  '/requests/me',
  auth(USER_ROLES.EMPLOYER, USER_ROLES.JOB_SEEKER),
  AppointmentController.getMyAppointmentRequests
);

export const appointmentRoutes = router;
