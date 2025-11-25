import { Model, Types } from 'mongoose';

export interface IPersonalInfo {
  name: string;
  email: string;
  phone: string;
  dob: Date;
  image: string;
  presentAddress: string;
  permanentAddress: string;
  license: ILicense;
  aboutMe: string;
}

export interface IEducation {
  degree: string;
  institute: string;
  grade: string;
  year: number;
}

export interface IExperience {
  designation: string;
  company: string;
  isCurrentlyWorking: boolean;
  startDate: Date;
  endDate?: Date;
  workDetails: string;
  portfolioUrls: string[];
}

export interface ILicense {
  carsAndMotorcycles: string[];
  busesAndAgriculture: string[];
  trucks: string[];
}

export interface IResume {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  personalInfo: IPersonalInfo;
  educations: IEducation[];
  experiences: IExperience[];
  license: ILicense;
  skills: string[];
  extraActivities: string[];
  hobbies: string[];
}

export type ResumeModel = Model<IResume>;
