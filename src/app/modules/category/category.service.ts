import QueryBuilder from '../../builder/QueryBuilder';
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

// --------------- update category ---------------
const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  // check if the category exists
  const existingCategory = await Category.exists({ _id: id });
  if (!existingCategory) {
    throw new Error('Category not found');
  }

  // check if the updated name already taken
  if (payload.name) {
    const existingCategory = await Category.exists({
      name: payload.name,
      _id: { $ne: id },
    });
    if (existingCategory) {
      throw new Error('Category name already taken');
    }
  }

  // update category
  const result = await Category.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// --------------- delete category ---------------
const deleteCategory = async (id: string) => {
  // check if the category exists
  const existingCategory = await Category.exists({ _id: id });
  if (!existingCategory) {
    throw new Error('Category not found');
  }

  const result = await Category.findByIdAndDelete(id);
  return result;
};

// --------------- get all categories ---------------
const getAllCategories = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(Category.find(), query)
    .search(['name'])
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    categoryQuery.modelQuery.lean(),
    categoryQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

// --------------- export ---------------
export const CategoryServices = {
  createCategoryToDB,
  updateCategory,
  deleteCategory,
  getAllCategories,
};
