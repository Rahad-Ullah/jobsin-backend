import crypto from 'crypto';

export function salaryComparisonCacheKey(payload: {
  keyword: string;
  category: string;
  subCategory: string;
  city: string;
  state: string;
  country: string;
}) {
  const normalizedPayload = {
    keyword: payload.keyword?.trim().toLowerCase() || '',
    category: payload.category?.trim().toLowerCase() || '',
    subCategory: payload.subCategory?.trim().toLowerCase() || '',
    city: payload.city?.trim().toLowerCase() || '',
    state: payload.state?.trim().toLowerCase() || '',
    country: payload.country?.trim().toLowerCase() || '',
  };

  return `salary:compare:${crypto
    .createHash('sha256')
    .update(JSON.stringify(normalizedPayload))
    .digest('hex')}`;
}
