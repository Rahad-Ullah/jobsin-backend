import { Schema, Types, model } from 'mongoose';
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

// check if employer profile is fulfilled
employerSchema.statics.isProfileFulfilled = async (userId: Types.ObjectId) => {
  const employer = await Employer.findOne({ user: userId });
  const arr = [
    employer?.businessCategory,
    employer?.legalForm,
    employer?.taxNo,
    employer?.deNo,
    employer?.whatsApp,
    employer?.about,
  ];
  for (let item of arr) {
    if (!item) {
      return false;
    }
  }
  return true;
};

export const Employer = model<IEmployer, EmployerModel>(
  'Employer',
  employerSchema
);
