import { sendNotifications } from '../../../helpers/notificationHelper';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../user/user.constant';
import { User } from '../user/user.model';
import { VerificationStatus } from './verification.constants';
import { IVerification } from './verification.interface';
import { Verification } from './verification.model';

// ------------- create verification -------------
const createVerificationToDB = async (
  payload: Partial<IVerification>,
): Promise<IVerification> => {
  // check if a request of this user is already pending
  const existingVerification = await Verification.exists({
    user: payload.user,
    status: VerificationStatus.PENDING,
  });
  if (existingVerification) {
    throw new Error('A request is already pending. Try again later');
  }

  const result = await Verification.create(payload);

  // send notification to admins
  const admins = await User.find({
    role: { $in: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] },
  });

  const notificationPromises = admins.map(admin => {
    return sendNotifications({
      type: 'VERIFICATION_REQUEST',
      title: 'New Verification Request',
      message: `A new verification request is submitted.`,
      receiver: admin._id,
      referenceId: result._id.toString(),
    });
  });

  await Promise.all(notificationPromises);

  return result;
};

// ------------- update verification -------------
const updateVerificationToDB = async (
  id: string,
  payload: Partial<IVerification>,
) => {
  // check if the verification exists
  const existingVerification = await Verification.exists({ _id: id });
  if (!existingVerification) {
    throw new Error('Verification not found');
  }

  const result = await Verification.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

// get verification by user id
const getVerificationByUserId = async (userId: string) => {
  const result = await Verification.find({ user: userId, isDeleted: false });
  return result;
};

// get all verifications
const getAllVerifications = async (query: Record<string, any>) => {
  const filter = { isDeleted: false } as any;
  if (query.searchTerm?.trim()) {
    // 1. Find users matching the search term
    const users = await User.find({
      $or: [
        { name: { $regex: query.searchTerm, $options: 'i' } },
        { email: { $regex: query.searchTerm, $options: 'i' } },
      ],
    }).select('_id');

    const userIds = users.map(u => u._id);

    // 2. Filter verifications where the user field matches these IDs
    filter.user = { $in: userIds };
  }

  const verificationQuery = new QueryBuilder(Verification.find(filter), query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(['user'], { user: 'name email phone address image' });

  const [data, pagination] = await Promise.all([
    verificationQuery.modelQuery.lean(),
    verificationQuery.getPaginationInfo(),
  ]);
  return { data, pagination };
};

export const VerificationServices = {
  createVerificationToDB,
  updateVerificationToDB,
  getVerificationByUserId,
  getAllVerifications,
};
