import { Schema, model } from 'mongoose';
import { IEmployer, EmployerModel } from './employer.interface';

const employerSchema = new Schema<IEmployer, EmployerModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessCategory: { type: String, default: '' },
    legalForm: { type: String, default: '' },
    taxNo: { type: String, default: '' },
    deNo: { type: String, default: '' },
    whatsApp: { type: String, default: '' },
    about: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Employer = model<IEmployer, EmployerModel>(
  'Employer',
  employerSchema
);
