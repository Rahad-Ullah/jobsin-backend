import { PLAN_CONFIG } from './plan.config';
import { Feature } from './features.enum';
import { FeatureUsage } from './featureUsage.model';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

export async function canUse(
  userId: string,
  feature: Feature,
  contextId?: string,
): Promise<boolean> {
  const user = await User.findById(userId).populate({
    path: 'subscription',
    select: 'package status',
    populate: { path: 'package', select: 'name' },
  });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User does not exist!');
  const plan = user.subscription
    ? (user.subscription as any).package.name
    : 'BASIC';
  const config = PLAN_CONFIG[plan];

  if (config.features === 'ALL') return true;

  const rule = config.features[feature];
  if (!rule) return false;
  if (rule === true) return true;

  // Check usage
  const usage = await FeatureUsage.findOne({
    user: user._id,
    feature,
    contextId,
  });

  if (!usage) return true;
  return usage.count < (rule.total || rule.perJob || rule.perCandidate);
}

export async function increaseUsage(
  userId: string,
  feature: Feature,
  contextId?: string,
) {
  await FeatureUsage.findOneAndUpdate(
    { user: userId, feature, contextId },
    { $inc: { count: 1 } },
    { upsert: true },
  );
}

export const EntitlementServices = { canUse, increaseUsage };
