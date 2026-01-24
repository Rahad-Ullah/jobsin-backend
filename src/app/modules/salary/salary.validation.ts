import { z } from 'zod';

// salary comparison input schema
export const SalaryComparisonInputSchema = z.object({
  body: z.object({
    keyword: z.string().min(1, 'Keyword is required'),
    category: z.string().min(1, 'Category is required'),
    subCategory: z.string().min(1, 'Sub-category is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    mySalary: z.number().min(0, 'Salary must be a positive number'),
  }),
});

export const SalaryValidations = {
  SalaryComparisonInputSchema,
};
