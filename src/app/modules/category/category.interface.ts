import { Model, Types } from 'mongoose';

export type ICategory = {
  _id: Types.ObjectId;
  name: string;
  subCategories: string[];
};

export type CategoryModel = Model<ICategory>;
