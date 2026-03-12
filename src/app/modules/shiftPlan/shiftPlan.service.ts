import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IShiftPlan } from './shiftPlan.interface';
import { ShiftPlan } from './shiftPlan.model';
import { Worker } from '../worker/worker.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { IWorker } from '../worker/worker.interface';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { generatePdfFromHtml } from '../../../util/htmlToPdf';
import config from '../../../config';
import { translateHelper } from '../../../helpers/translateHelper';

// ------------ create shift plan --------------
const createShiftPlanToDB = async (
  payload: IShiftPlan,
): Promise<IShiftPlan> => {
  // check if the worker exists
  const existingWorker = await Worker.exists({ _id: payload.worker });
  if (!existingWorker) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee not found');
  }

  const result = await ShiftPlan.create(payload);
  return result;
};

// ------------ update shift plan --------------
const updateShiftPlan = async (
  id: string,
  payload: Partial<IShiftPlan>,
  author: string,
) => {
  // check if the shift plan exists
  const existingShiftPlan = await ShiftPlan.exists({ _id: id });
  if (!existingShiftPlan) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Shift plan not found');
  }

  // check if the worker exists
  const existingWorker = await Worker.exists({ _id: payload.worker });
  if (!existingWorker) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee not found');
  }

  const result = await ShiftPlan.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// ------------- delete shift plan --------------
const deleteShiftPlan = async (id: string): Promise<IShiftPlan | null> => {
  // check if the shift plan exists
  const existingShiftPlan = await ShiftPlan.exists({ _id: id });
  if (!existingShiftPlan) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Shift plan not found');
  }

  const result = await ShiftPlan.findByIdAndDelete(id);
  return result;
};

// ------------- send shift plan to worker --------------
const sendShiftPlanToWorker = async (
  shiftPlanId: string,
  language?: string,
) => {
  // check if plan exists
  const existingPlan =
    await ShiftPlan.findById(shiftPlanId).populate('author worker');
  if (!existingPlan) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Shift plan not found');
  }

  const worker = existingPlan.worker as any as IWorker;

  // send mail
  if (worker.email) {
    const template = emailTemplate.shiftPlanToWorker(worker, existingPlan);
    const translatedHtml = await translateHelper.translateHTML(
      template.html,
      language || 'de',
    );
    const translatedSubject = await translateHelper.translateHTML(
      template.subject,
      language || 'de',
    );
    const fileName = `shift-plan-${existingPlan._id}-${Date.now()}`;
    await generatePdfFromHtml(translatedHtml, fileName);

    // Public URL (served via express static)
    const pdfUrl = `${config.backend_url}/documents/${fileName}.pdf`;

    await emailHelper.sendEmail({
      to: worker.email,
      subject: translatedSubject,
      html: `
              <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 20px; padding: 20px; color: #555;">
                <p>Sie haben einen neuen Schichtplan.</p>
                <a href="${pdfUrl}" target="_blank">Download PDF</a>

                <div style="padding: 10px 0; margin-top: 50px; text-align: left;">
                  <p style="font-size: 14px;">
                    <span style="margin-right: 8px;">✉</span> <strong>Email:</strong> info@jobsinapp.de
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 14px;">
                    <span style="margin-right: 8px;">🔗</span> <strong>Website:</strong> jobsinapp.de
                  </p>

                  <p style="margin: 0 0 15px 0; font-weight: bold; font-size: 18px;">
                    <span style="margin-right: 5px;">⬇</span> Laden Sie unsere mobile App herunter
                  </p>

                  <table border="0" cellspacing="0" cellpadding="0" style="text-align: left;">
                    <tr>
                      <td style="font-size: 15px; font-weight: bold;">
                        <a href="https://jobsinapp.de" style="color: inherit; text-decoration: none;">
                          <img src="https://cdn-icons-png.flaticon.com/128/5977/5977575.png" alt="Apple" style="width: 18px; margin-right: 5px; vertical-align: middle;" />
                          <span style="vertical-align: middle;">App Store</span>
                        </a>
                      </td>
                      <td style="padding: 0 15px; font-size: 18px; opacity: 0.5;">|</td>
                      <td style="font-size: 15px; font-weight: bold;">
                        <a href="https://jobsinapp.de" style="color: inherit; text-decoration: none;">
                          <img src="https://cdn-icons-png.flaticon.com/128/16076/16076057.png" alt="Google" style="width: 18px; margin-right: 5px; vertical-align: middle;" />
                          <span style="vertical-align: middle;">Google Play</span>
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>
              </body>
            `,
    });
  }
};

// ------------- get shift plan by author id -------------
const getShiftPlanByAuthorId = async (
  authorId: string,
  query: Record<string, unknown>,
) => {
  const filter: Record<string, any> = { author: authorId };

  const elemMatchConditions: Record<string, any> = {};

  if (query.startDate || query.endDate) {
    const dateQuery: Record<string, any> = {};
    
    if (query.startDate) {
      const start = new Date(query.startDate as string);
      start.setUTCHours(0, 0, 0, 0);
      dateQuery.$gte = start;
    }

    if (query.endDate) {
      const end = new Date(query.endDate as string);
      end.setUTCHours(23, 59, 59, 999);
      dateQuery.$lte = end;
    }

    elemMatchConditions.days = dateQuery;
  }

  if (query.shift) {
    elemMatchConditions.shift = query.shift;
  }

  if (Object.keys(elemMatchConditions).length > 0) {
    filter.plans = { $elemMatch: elemMatchConditions };
  }

  const planQuery = new QueryBuilder(
    ShiftPlan.find(filter).populate('worker'),
    query,
  )
    .filter(['startDate', 'endDate', 'shift'])
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    planQuery.modelQuery.lean(),
    planQuery.getPaginationInfo(),
  ]);
  
  return { data, pagination };
};

export const getShiftPlanById = async (
  id: string,
): Promise<IShiftPlan | null> => {
  const result = await ShiftPlan.findById(id).populate('worker');
  return result;
};

export const ShiftPlanServices = {
  createShiftPlanToDB,
  updateShiftPlan,
  deleteShiftPlan,
  sendShiftPlanToWorker,
  getShiftPlanByAuthorId,
  getShiftPlanById,
};
