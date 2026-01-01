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
import { notificationRoutes } from '../app/modules/notification/notification.route';
import { feedbackRoutes } from '../app/modules/feedback/feedback.route';
import { verificationRoutes } from '../app/modules/verification/verification.route';
import { disclaimerRoutes } from '../app/modules/disclaimer/disclaimer.route';
import { contactRoutes } from '../app/modules/contact/contact.route';
import { supportRoutes } from '../app/modules/support/support.route';
import { packageRoutes } from '../app/modules/package/package.route';
import { subscriptionRoutes } from '../app/modules/subscription/subscription.route';
import { ChatRoutes } from '../app/modules/chat/chat.route';
import { MessageRoutes } from '../app/modules/message/message.route';
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
  {
    path: '/chats',
    route: ChatRoutes,
  },
  {
    path: '/messages',
    route: MessageRoutes,
  },
  {
    path: '/packages',
    route: packageRoutes,
  },
  {
    path: '/subscriptions',
    route: subscriptionRoutes,
  },
  {
    path: '/feedbacks',
    route: feedbackRoutes,
  },
  {
    path: '/verifications',
    route: verificationRoutes,
  },
  {
    path: '/notifications',
    route: notificationRoutes,
  },
  {
    path: '/disclaimers',
    route: disclaimerRoutes,
  },
  {
    path: '/supports',
    route: supportRoutes,
  },
  {
    path: '/contact',
    route: contactRoutes,
  },
];

apiRoutes.forEach(route => router_v1.use(route.path, route.route));

export default router_v1;
