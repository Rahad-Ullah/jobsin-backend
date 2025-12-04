import { Job } from '../job/job.model';
import { IWishlist } from './wishlist.interface';
import { Wishlist } from './wishlist.model';

// ----------------- create wishlist -----------------
const createWishlist = async (payload: IWishlist): Promise<IWishlist> => {
  // check if the job exists
  const existingJob = await Job.exists({ _id: payload.job });
  if (!existingJob) {
    throw new Error('Job not found');
  }

  // check if the user already saved the job
  const existingWishlist = await Wishlist.exists({
    job: payload.job,
    user: payload.user,
    isDeleted: false,
  });
  if (existingWishlist) {
    throw new Error('Already added to your wishlist');
  }

  const result = await Wishlist.create(payload);
  return result;
};

export const WishlistServices = {
  createWishlist,
};
