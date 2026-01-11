import { Schema, model } from 'mongoose';
import { IWorker, WorkerModel } from './worker.interface';

const workerSchema = new Schema<IWorker, WorkerModel>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
});

export const Worker = model<IWorker, WorkerModel>('Worker', workerSchema);
