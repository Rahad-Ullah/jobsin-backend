import { deepseekClient } from '../../../config/deepseek';

export interface ISalaryComparisonInput {
  keyword: string;
  category: string;
  subCategory: string;
  city: string;
  state: string;
  country: string;
}

export interface ISalaryComparisonResult {
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
}

// salary comparison
export const salaryComparisonByAI = async (
  payload: Partial<ISalaryComparisonInput>,
): Promise<ISalaryComparisonResult> => {
  const {
    keyword = '',
    category = '',
    subCategory = '',
    city = '',
    state = '',
    country = '',
  } = payload;

  const response = await deepseekClient.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `
          You are a salary market analysis assistant.

          Rules:
          - Estimate salaries based on role, category, and location.
          - Respond ONLY in JSON.
          - All values must be numbers.
          - Salaries must be monthly gross amounts in USD currency.
          - minSalary <= averageSalary <= maxSalary.
          - Do NOT include explanations or text.
          `,
      },
      {
        role: 'user',
        content: `
          Job title / keyword: ${keyword}
          Category: ${category}
          Sub-category: ${subCategory}
          City: ${city}
          State: ${state}
          Country: ${country}

          Return:
          {
            "minSalary": number,
            "avgSalary": number,
            "maxSalary": number
          }
          `,
      },
    ],
    temperature: 0.3,
  });

  const rawText = response.choices?.[0]?.message?.content || '{}';

  // Safety check: sometimes models wrap JSON in markdown blocks
  const cleanJson = rawText.replace(/```json|```/g, '').trim();

  if (!cleanJson) {
    return {
      minSalary: 0,
      avgSalary: 0,
      maxSalary: 0,
    };
  }

  return JSON.parse(cleanJson) as ISalaryComparisonResult;
};

export const SalaryServices = {
  salaryComparisonByAI,
};
