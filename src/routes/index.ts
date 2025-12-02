import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { jobSeekerRoutes } from '../app/modules/jobSeeker/jobSeeker.route';
import { employerRoutes } from '../app/modules/employer/employer.route';
import { resumeRoutes } from '../app/modules/resume/resume.route';
const router_v1 = express.Router();

const apiRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/job-seekers',
    route: jobSeekerRoutes,
  },
  {
    path: '/employers',
    route: employerRoutes,
  },
  {
    path: '/resumes',
    route: resumeRoutes,
  },
];

apiRoutes.forEach(route => router_v1.use(route.path, route.route));

export default router_v1;
