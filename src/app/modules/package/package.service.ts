import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import config from '../../../config';

const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: '2025-12-15.clover',
});

// --------------- create package service ---------------
export const createPackageToDB = async (
  payload: Partial<IPackage>
): Promise<IPackage> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if package exists
    const existingPackage = await Package.exists({
      name: payload.name,
    }).session(session);
    if (existingPackage) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Package already exists');
    }

    // Stripe product + price creation
    let product, price;
    try {
      product = await stripe.products.create({
        name: payload.name!,
        description: payload.description ?? '',
      });

      price = await stripe.prices.create({
        unit_amount: Math.round((payload.intervalPrice ?? 0) * 100),
        currency: 'usd',
        recurring: {
          interval: payload.interval!,
          interval_count: payload.intervalCount ?? 1,
        },
        product: product.id,
      });
    } catch (stripeErr: any) {
      // Stripe failed → abort before DB write
      await session.abortTransaction();
      session.endSession();
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Stripe error: ${stripeErr.message}`
      );
    }

    // Attach Stripe IDs
    payload.stripeProductId = product.id;
    payload.stripePriceId = price.id;

    // Calculate price
    payload.price = (price.unit_amount! / 100) * payload.intervalCount!;

    // Save package in DB
    const result = await Package.create([payload], { session });

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const PackageServices = {
  createPackageToDB,
};
