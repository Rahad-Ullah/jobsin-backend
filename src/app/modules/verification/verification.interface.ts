import { Model, Types } from 'mongoose';
import { VerificationStatus } from './verification.constants';

export interface IVerification {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  documents: string[];
  status: VerificationStatus;
  isDeleted: boolean;
}

export type VerificationModel = Model<IVerification>;
