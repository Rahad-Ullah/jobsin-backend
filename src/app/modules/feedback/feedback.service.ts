import { User } from '../user/user.model';
import { IFeedback } from './feedback.interface';
import { Feedback } from './feedback.model';

// --------------- create feedback ---------------
const createFeedbackToDB = async (
  payload: Partial<IFeedback>
): Promise<IFeedback> => {
  // check if the user exists
  const existingUser = await User.exists({ _id: payload.user });
  if (!existingUser) {
    throw new Error('User not found');
  }

  const result = await Feedback.create(payload);
  return result;
};

// --------------- update feedback ---------------
const updateFeedback = async (id: string, payload: Partial<IFeedback>) => {
  // check if the feedback exists
  const existingFeedback = await Feedback.exists({ _id: id });
  if (!existingFeedback) {
    throw new Error('Feedback not found');
  }

  const result = await Feedback.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

export const FeedbackServices = {
  createFeedbackToDB,
  updateFeedback,
};
