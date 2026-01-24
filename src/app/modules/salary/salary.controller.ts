import { Request, Response } from 'express';
import { SalaryServices } from './salary.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { redisClient } from '../../../config/redis';
import { salaryComparisonCacheKey } from '../../../cache/salaryComparison.cache';

// Salary comparison controller (AI + Redis cache)
const salaryComparison = catchAsync(async (req: Request, res: Response) => {
  const { mySalary, ...payload } = req.body;

  const cacheKey = salaryComparisonCacheKey(payload);
  const lockKey = `${cacheKey}:lock`;

  // 1. Check Redis cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Salary comparison fetched successfully (cache)',
      data: { ...JSON.parse(cached), mySalary },
    });
  }

  // 2. Acquire lock
  const locked = await redisClient.set(lockKey, '1', 'EX', 15, 'NX');
  if (!locked) {
    // Someone else is generating → wait & retry
    await new Promise(r => setTimeout(r, 500));

    const retry = await redisClient.get(cacheKey);
    if (retry) {
      return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Salary comparison fetched successfully (cache)',
        data: { ...JSON.parse(retry), mySalary },
      });
    }
  }

  // 3. Call DeepSeek AI service
  const result = await SalaryServices.salaryComparisonByAI(payload);

  // 4. Cache result (90 days)
  await redisClient.set(
    cacheKey,
    JSON.stringify(result),
    'EX',
    60 * 60 * 24 * 90,
  );

  // 5. Release lock
  await redisClient.del(lockKey);

  // 6. Send response
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Salary comparison fetched successfully',
    data: { ...result, mySalary },
  });
});

export const SalaryController = {
  salaryComparison,
};
