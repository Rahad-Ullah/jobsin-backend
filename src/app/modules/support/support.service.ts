import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ISupport } from './support.interface';
import { Support } from './support.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';

// -------------- create support --------------
const createSupportToDB = async (payload: ISupport): Promise<ISupport> => {
  // check if the user submitted a support within 6 hours
  const existingSupport = await Support.findOne({
    email: payload.email,
    createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
  });
  if (existingSupport) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Already processing your another request. Please try again later.'
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
  updateSupportToDB,
  getSupportByIdFromDB,
  getAllSupportsFromDB,
};
