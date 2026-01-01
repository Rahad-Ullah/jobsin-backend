import { Model, ObjectId } from 'mongoose';

export type IMessage = {
  _id?: ObjectId;
  chat: ObjectId;
  sender: ObjectId;
  text?: string;
  image?: string;
  seenBy: ObjectId[];
};

export type MessageModel = Model<IMessage>;
