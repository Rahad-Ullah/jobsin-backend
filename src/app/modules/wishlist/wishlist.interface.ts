import { Model, Types } from 'mongoose';

export interface IWishlist {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  job: Types.ObjectId;
  isDeleted: boolean;
}

export type WishlistModel = Model<IWishlist>;
