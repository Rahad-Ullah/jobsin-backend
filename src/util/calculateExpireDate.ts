import { PackageInterval } from '../app/modules/package/package.constants';

export const calculateExpireDate = (
  interval: PackageInterval,
  intervalCount: number
): Date => {
  if (!Number.isInteger(intervalCount) || intervalCount <= 0) {
    throw new Error('intervalCount must be a positive integer');
  }

  const baseDate = new Date();
  const result = new Date(baseDate.getTime()); // clone

  switch (interval) {
    case PackageInterval.DAY:
      result.setDate(result.getDate() + intervalCount);
      return result;

    case PackageInterval.WEEK:
      result.setDate(result.getDate() + intervalCount * 7);
      return result;

    case PackageInterval.MONTH:
      result.setMonth(result.getMonth() + intervalCount);
      return result;

    default:
      throw new Error(`Unsupported package interval: ${interval}`);
  }
};
