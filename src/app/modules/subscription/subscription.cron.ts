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

      const subscriptions = await Subscription.find({
        status: {
          $in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.CANCELED,
          ],
        },
        cancelAtPeriodEnd: true,
        currentPeriodEnd: { $lte: now },
      }).select('_id user');

      if (!subscriptions.length) return;

      const expiredSubscriptionIds = subscriptions
        .filter(s => s.status !== SubscriptionStatus.CANCELED)
        .map(s => s._id);
      const userIds = subscriptions.map(s => s.user);

      // 1️⃣ Expire subscriptions
      await Subscription.updateMany(
        { _id: { $in: expiredSubscriptionIds } },
        { status: SubscriptionStatus.PAST_DUE },
      );

      // 2️⃣ Remove subscription reference from users
      await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { subscription: null } },
      );

      console.log(
        `[CRON] Expired ${expiredSubscriptionIds.length} subscriptions`,
      );
    } catch (error) {
      console.error('[CRON] Subscription expiration failed', error);
    }
  });
};
