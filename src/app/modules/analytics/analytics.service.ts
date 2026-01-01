import { Subscription } from '../subscription/subscription.model';
import { USER_ROLES } from '../user/user.constant';
import { User } from '../user/user.model';

// -------------- get overview --------------
const getOverview = async () => {
  const jobSeekers = User.countDocuments({ role: USER_ROLES.JOB_SEEKER });
  const employers = User.countDocuments({ role: USER_ROLES.EMPLOYER });
  const subscribers = Subscription.countDocuments();
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

// ------------- get yearly user growth -------------
const getYearlyUserGrowth = async (query: Record<string, any>) => {
  const year = Number(query.year || new Date().getFullYear());

  const result = await User.aggregate([
    {
      $facet: {
        totalUserCount: [{ $count: 'count' }],
        monthlyData: [
          {
            $match: {
              createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1),
              },
            },
          },
          {
            $group: {
              _id: { $month: '$createdAt' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const totalUsers = result[0].totalUserCount[0]?.count || 0;
  const rawMonthlyStats = result[0].monthlyData;

  // --- Fill empty months with zero ---
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const monthNumber = i + 1; // Months are 1-12 in MongoDB
    const monthData = rawMonthlyStats.find(
      (item: any) => item._id === monthNumber
    );

    return {
      month: monthNames[i],
      count: monthData ? monthData.count : 0,
    };
  });

  // Calculate total new users for THIS specific year from the filled data
  const totalNewUsersThisYear = monthlyStats.reduce(
    (acc: number, curr: any) => acc + curr.count,
    0
  );

  const growthPercentage =
    totalUsers > 0 ? (totalNewUsersThisYear / totalUsers) * 100 : 0;

  return {
    year,
    totalNewUsersThisYear,
    totalUsers,
    growthPercentage: Number(growthPercentage.toFixed(2)),
    monthlyStats,
  };
};

// get monthly subscribers growth
const getMonthlySubscribersGrowth = async (query: Record<string, any>) => {
  const year = Number(query.year || new Date().getFullYear());

  const result = await Subscription.aggregate([
    {
      $facet: {
        totalSubscribers: [{ $count: 'count' }],
        monthlyData: [
          {
            $match: {
              createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1),
              },
            },
          },
          {
            $group: {
              _id: { $month: '$createdAt' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const totalSubscribers = result[0].totalSubscribers[0]?.count || 0;
  const rawMonthlyStats = result[0].monthlyData;

  // --- Fill empty months with zero ---
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const monthNumber = i + 1; // Months are 1-12 in MongoDB
    const monthData = rawMonthlyStats.find(
      (item: any) => item._id === monthNumber
    );

    return {
      month: monthNames[i],
      count: monthData ? monthData.count : 0,
    };
  });

  // Calculate total new users for THIS specific year from the filled data
  const totalNewSubscribersThisYear = monthlyStats.reduce(
    (acc: number, curr: any) => acc + curr.count,
    0
  );

  const growthPercentage =
    totalSubscribers > 0
      ? (totalNewSubscribersThisYear / totalSubscribers) * 100
      : 0;

  return {
    year,
    totalNewSubscribersThisYear,
    totalSubscribers,
    growthPercentage: Number(growthPercentage.toFixed(2)),
    monthlyStats,
  };
};

export const AnalyticsServices = {
  getOverview,
  getYearlyUserGrowth,
  getMonthlySubscribersGrowth,
};
