import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ISupport } from './support.interface';
import { Support } from './support.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { User } from '../user/user.model';
import { SupportStatus } from './support.constants';

// -------------- create support --------------
const createSupportToDB = async (payload: ISupport): Promise<ISupport> => {
  // check if the user submitted a support within 6 hours
  const existingSupports = await Support.countDocuments({
    email: payload.email,
    status: SupportStatus.PENDING,
    createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
  });
  if (existingSupports >= 3) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'We are processing your another requests. Please try again later.'
    );
  }

  const result = await Support.create(payload);
  return result;
};

// -------------- create support for logged in user --------------
const createSupportForLoggedInUser = async (
  userId: string,
  payload: ISupport
): Promise<ISupport> => {
  // check if the user exists
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  payload.name = existingUser.name;
  payload.email = existingUser.email;
  payload.phone = existingUser.phone;
  payload.address = existingUser.address;

  // check if the user submitted a support within 6 hours
  const existingSupports = await Support.countDocuments({
    email: existingUser.email,
    status: SupportStatus.PENDING,
    createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
  });
  if (existingSupports >= 3) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'We are processing your another requests. Please try again later.'
    );
  }

  const result = await Support.create(payload);
  return result;
};

// -------------- update support --------------
const updateSupportToDB = async (
  id: string,
  payload: Partial<ISupport> & { reply?: string }
) => {
  // check if the support exists
  const existingSupport = await Support.findById(id).lean();
  if (!existingSupport) {
    throw new Error('Support not found');
  }

  const result = await Support.findByIdAndUpdate(id, payload, { new: true });

  // send reply mail
  if (payload.reply) {
    const template = emailTemplate.supportReply({
      ...existingSupport,
      reply: payload.reply,
    });

    await emailHelper.sendEmail({
      to: existingSupport.email,
      subject: template.subject,
      html: template.html,
    });
  }

  return result;
};

// -------------- get by id --------------
const getSupportByIdFromDB = async (id: string) => {
  const result = await Support.findById(id);
  return result;
};

// ------------- get all supports --------------
const getAllSupportsFromDB = async (query: Record<string, unknown>) => {
  const supportQuery = new QueryBuilder(Support.find(), query)
    .search(['name', 'email', 'phone'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    supportQuery.modelQuery.lean(),
    supportQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const SupportServices = {
  createSupportToDB,
  createSupportForLoggedInUser,
  updateSupportToDB,
  getSupportByIdFromDB,
  getAllSupportsFromDB,
};
