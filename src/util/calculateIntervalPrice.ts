import { PackageInterval } from '../app/modules/package/package.constants';

const calculateIntervalPrice = (interval: string, dailyPrice: number) => {
  if (interval === PackageInterval.DAY) {
    return dailyPrice * 1;
  } else if (interval === PackageInterval.WEEK) {
    return dailyPrice * 7;
  } else if (interval === PackageInterval.MONTH) {
    return dailyPrice * 30;
  }
};

export default calculateIntervalPrice;
