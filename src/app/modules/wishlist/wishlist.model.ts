import { Schema, model } from 'mongoose';
import { IWishlist, WishlistModel } from './wishlist.interface';

const wishlistSchema = new Schema<IWishlist, WishlistModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Wishlist = model<IWishlist, WishlistModel>(
  'Wishlist',
  wishlistSchema
);
