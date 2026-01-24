import OpenAI from 'openai';
import config from '.';

export const deepseekClient = new OpenAI({
  apiKey: config.deepseek.api_key,
  baseURL: 'https://api.deepseek.com',
});
