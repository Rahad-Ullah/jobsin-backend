import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { jobSeekerRoutes } from '../app/modules/jobSeeker/jobSeeker.route';
import { employerRoutes } from '../app/modules/employer/employer.route';
import { resumeRoutes } from '../app/modules/resume/resume.route';
import { categoryRoutes } from '../app/modules/category/category.route';
import { jobRoutes } from '../app/modules/job/job.route';
import { applicationRoutes } from '../app/modules/application/application.route';
import { wishlistRoutes } from '../app/modules/wishlist/wishlist.route';
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
  {
    path: '/categories',
    route: categoryRoutes,
  },
  {
    path: '/jobs',
    route: jobRoutes,
  },
  {
    path: '/applications',
    route: applicationRoutes,
  },
  {
    path: '/wishlists',
    route: wishlistRoutes,
  },
];

apiRoutes.forEach(route => router_v1.use(route.path, route.route));

export default router_v1;
