import { ICategory } from './category.interface';
import { Category } from './category.model';

// --------------- create category service ---------------
const createCategoryToDB = async (
  payload: Partial<ICategory>
): Promise<ICategory> => {
  // check if category exists
  const existingCategory = await Category.exists({ name: payload.name });
  if (existingCategory) {
    throw new Error('Category already exists');
  }

  const result = await Category.create(payload);
  return result;
};

export const CategoryServices = {
  createCategoryToDB,
};