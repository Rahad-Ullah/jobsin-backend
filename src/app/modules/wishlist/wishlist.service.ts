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

// ----------------- delete wishlist -----------------
const deleteWishlist = async (id: string) => {
  // check if the wishlist exists
  const existingWishlist = await Wishlist.exists({ _id: id });
  if (!existingWishlist) {
    throw new Error('Wishlist not found');
  }

  const result = await Wishlist.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

// ----------------- get wishlist by user id -----------------
const getWishlistByUserId = async (userId: string) => {
  const result = await Wishlist.find({ user: userId, isDeleted: false }).populate({
    path: 'job',
    select: 'category subCategory jobType experience salaryType salaryAmount author',
    populate: {
      path: 'author',
      select: 'name email phone address image',
    }
  });
  return result;
};

export const WishlistServices = {
  createWishlist,
  deleteWishlist,
  getWishlistByUserId,
};
