import cron from 'node-cron';
import { Subscription } from './subscription.model';
import { User } from '../user/user.model';
import { SubscriptionStatus } from './subscription.constants';

export const startSubscriptionExpirationCron = () => {
  // runs every hour
  cron.schedule('0 * * * *', async () => {
    console.log(`[CRON] Subscription expiration started`);
    try {
      const now = new Date();

      const expiredSubscriptions = await Subscription.find({
        status: {
          $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        },
        cancelAtPeriodEnd: true,
        currentPeriodEnd: { $lte: now },
      }).select('_id user');

      if (!expiredSubscriptions.length) return;

      const subscriptionIds = expiredSubscriptions.map(s => s._id);
      const userIds = expiredSubscriptions.map(s => s.user);

      // 1️⃣ Expire subscriptions
      await Subscription.updateMany(
        { _id: { $in: subscriptionIds } },
        { status: SubscriptionStatus.PAST_DUE },
      );

      // 2️⃣ Remove subscription reference from users
      await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { subscription: null } },
      );

      console.log(`[CRON] Expired ${subscriptionIds.length} subscriptions`);
    } catch (error) {
      console.error('[CRON] Subscription expiration failed', error);
    }
  });
};
