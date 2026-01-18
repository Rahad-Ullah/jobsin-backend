// modules/subscription/feature.guard.ts
import { Feature } from './features.enum';
import { NextFunction, Request, Response } from 'express';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { EntitlementServices } from './entitlement.service';

export const requireFeature =
  (feature: Feature) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const allowed = await EntitlementServices.canUse(
      req.user.id,
      feature,
      req.params.id,
    );

    if (!allowed) {
      throw new ApiError(
        StatusCodes.PAYMENT_REQUIRED,
        'You have to upgrade your plan to use this feature',
      );
    }

    next();
  };
