import { USER_ROLES } from '../user/user.constant';
import { User } from '../user/user.model';
import { IContact } from './contact.interface';
import { Contact } from './contact.model';

// ------------- create/update contact -------------
const createUpdateContactToDB = async (
  payload: Partial<IContact>,
): Promise<IContact> => {
  // create or update contact
  const result = await Contact.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
  });
  return result;
};

// ------------- get contact -------------
const getContactFromDB = async () => {
  const admin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN }).select(
    '_id',
  );
  const result = await Contact.findOne({});
  return { ...result?.toObject(), adminId: admin?._id };
};

export const ContactServices = {
  createUpdateContactToDB,
  getContactFromDB,
};
