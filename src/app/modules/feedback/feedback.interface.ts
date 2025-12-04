import { Model, Types } from 'mongoose';

export interface IFeedback {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  reviewer: Types.ObjectId;
  rating: number;
  message: string;
}

export type FeedbackModel = Model<IFeedback>;
