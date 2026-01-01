import { Subscription } from '../subscription/subscription.model';
import { USER_ROLES } from '../user/user.constant';
import { User } from '../user/user.model';

// -------------- get overview --------------
const getOverview = async () => {
  const jobSeekers = User.countDocuments({ role: USER_ROLES.JOB_SEEKER });
  const employers = User.countDocuments({ role: USER_ROLES.EMPLOYER });
  const subscribers = User.countDocuments({
    subscription: { $exists: true, $ne: null },
  });
  const revenue = Subscription.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$price' },
      },
    },
  ]);

  const [totalJobSeekers, totalEmployers, totalSubscribers, totalRevenue] =
    await Promise.all([jobSeekers, employers, subscribers, revenue]);

  return {
    totalJobSeekers,
    totalEmployers,
    totalSubscribers,
    totalRevenue: totalRevenue[0]?.totalRevenue || 0,
  };
};

export const AnalyticsServices = {
  getOverview,
};
