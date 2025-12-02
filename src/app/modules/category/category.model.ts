import { Schema, model } from 'mongoose';
import { ICategory, CategoryModel } from './category.interface';

const categorySchema = new Schema<ICategory, CategoryModel>({
  name: { type: String, required: true },
  subCategories: [{ type: String, default: [] }],
});

export const Category = model<ICategory, CategoryModel>(
  'Category',
  categorySchema
);
