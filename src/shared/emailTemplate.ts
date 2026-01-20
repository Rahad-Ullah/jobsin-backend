import { IAppointment } from '../app/modules/appointment/appointment.interface';
import { IJob } from '../app/modules/job/job.interface';
import { IShiftPlan } from '../app/modules/shiftPlan/shiftPlan.interface';
import { ISupport } from '../app/modules/support/support.interface';
import { IUser } from '../app/modules/user/user.interface';
import { IWorker } from '../app/modules/worker/worker.interface';
import config from '../config';
import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `
      <body
          style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
          <div
              style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="https://i.postimg.cc/kMKg91ps/Screenshot-2025-11-03-170353.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">
                Hey! ${values.name}${values.name && ','} 
                Your ${config.server_name} Account Credentials
              </h2>
              <div style="text-align: center;">
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                  <span
                      style="background-color: #277E16; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">
                      ${values.otp}
                  </span>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
          <div
              style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="https://i.postimg.cc/kMKg91ps/Screenshot-2025-11-03-170353.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              <div style="text-align: center;">
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                  <span
                      style="background-color: #277E16; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">
                      ${values.otp}
                  </span>
                  <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                  <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:center">
                    If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const confirmAppointment = (values: IAppointment) => {
  const data = {
    to: values.receiver,
    subject: 'New Appointment Available!',
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 0; padding: 50px; color: #555;">
          <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="https://i.postimg.cc/kMKg91ps/Screenshot-2025-11-03-170353.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              
              <div style="text-align: center;">
                  <h2 style="color: #277E16; margin-bottom: 10px;">New Appointment Available!</h2>
                  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">An appointment is available for you. Kindly confirm it in your JobsinApp account and please come to our address at the scheduled time.</p>
                  
                  <div style="background-color: #f4fdf3; border: 1px solid #e0eee0; border-radius: 8px; padding: 20px; text-align: left; margin-bottom: 25px;">
                      <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${new Date(
                        values.scheduledAt,
                      ).toLocaleString()}</p>
                      ${
                        values.address &&
                        `<p style="margin: 5px 0;"><strong>📍 Address:</strong> ${values.address}</p>`
                      }
                      <p style="margin: 5px 0;"><strong>✉️ Message:</strong> ${
                        values.message
                      }</p>
                  </div>

                  <p style="color: #b9b4b4; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                    If you need to reschedule or cancel this appointment, please log in to your account or contact support.
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};

const supportReply = (values: ISupport & { reply: string }) => {
  const data = {
    to: values.email,
    subject: 'Support Update',
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 0; padding: 50px; color: #555;">
          <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <img src="https://i.postimg.cc/kMKg91ps/Screenshot-2025-11-03-170353.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
              
              <div style="">
                  <h2 style="color: #277E16; margin-bottom: 10px; text-align: center;">Support Update</h2>
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                      Hi <strong>${values.name || 'there'}</strong>,<br><br>
                      Thank you for reaching out to the JobsinApp support team. We have reviewed your inquiry.
                  </p>
                  
                  <div style="background-color: #f4fdf3; border: 1px solid #e0eee0; border-radius: 8px; padding: 20px; text-align: left; margin-bottom: 25px;">
                      <p style="margin: 5px 0; color: #277E16; font-weight: bold;">Our Response:</p>
                      <p style="margin: 10px 0; line-height: 1.5;">
                          ${values.reply}
                      </p>
                  </div>

                  <p style="font-size: 15px; line-height: 1.5; margin-bottom: 25px;">
                      If you have any further questions or if this doesn't fully resolve your issue, please simply reply to this email or visit our help center.
                  </p>

                  <p style="color: #b9b4b4; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                      Best regards,<br>
                      <strong>The JobsinApp Support Team</strong>
                  </p>
              </div>
          </div>
      </body>
    `,
  };
  return data;
};
// payment failed
const paymentFailed = (values: any) => {
  const data = {
    to: values.email,
    subject: values.subject,
    html: `
      <body style="font-family: 'Trebuchet MS', sans-serif; background-color: #f9f9f9; margin: 0; padding: 50px; color: #555;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <img src="https://i.postimg.cc/kMKg91ps/Screenshot-2025-11-03-170353.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
            
            <div>
                <h2 style="color: #D93025; margin-bottom: 10px; text-align: center;">Payment Failed</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Hi <strong>${values.name || 'there'}</strong>,<br><br>
                    We were unable to process the payment for your <strong>${values.packageName || 'JobsinApp Subscription'}</strong>. This can sometimes happen due to an expired card, insufficient funds, or a bank restriction.
                </p>
                
                <div style="background-color: #fff5f5; border: 1px solid #f8d7da; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px;">
                    <p style="margin: 5px 0; color: #D93025; font-weight: bold;">What happened?</p>
                    <p style="margin: 10px 0; line-height: 1.5; font-size: 15px;">
                        Our last attempt on <strong>${new Date().toLocaleDateString()}</strong> failed. To maintain your access to premium features, please update your billing information.
                    </p>
                    <a href="${values.billingUrl || '#'}" style="display: inline-block; padding: 12px 25px; background-color: #277E16; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Update Payment Method</a>
                </div>

                <p style="font-size: 15px; line-height: 1.5; margin-bottom: 25px;">
                    Don't worry, your account is still active for now. However, if the payment isn't resolved soon, your subscription may be downgraded to the free tier.
                </p>

                <p style="color: #b9b4b4; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                    Best regards,<br>
                    <strong>The JobsinApp Billing Team</strong>
                </p>
            </div>
        </div>
      </body>
    `,
  };
  return data;
};

const hiringRequestToAdmin = (job: IJob, employer: IUser, email: string) => {
  const data = {
    to: email,
    subject: `Hiring Request: ${employer.name} - ${job.category}`,
    html: `
      <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px; color: #333;">
        <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 1px solid #ddd;">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                <div style="font-size: 18px; line-height: 1.4;">
                    <h2 style="margin: 0; font-size: 20px;">Personnel Placement Agreement</h2>
                    <p style="margin: 10px 0 0 0;">
                        <strong>Client</strong><br>
                        ${employer.name}<br>
                        ${employer.address}
                    </p>
                    <p style="margin: 10px 0 0 0;">
                        <strong>Recruiter</strong><br>
                        JobsinApp<br>
                    </p>
                </div>
                <img src="https://i.postimg.cc/kMKg91ps/Screenshot-2025-11-03-170353.png" alt="Logo" style="width: 120px;" />
            </div>

            <div style="margin-bottom: 20px;">
                <h3 style="font-size: 16px; margin-bottom: 5px;">Contract Content</h3>
                <p style="font-size: 13px; line-height: 1.5; margin: 0;">The Client Commissions The Recruiter To Search For Suitable Candidates For A Position To Be Filled In Their Company. This Agreement Governs The Conditions of the Personnel Placement And The Mutual Rights And Obligations Of The Contracting Parties.</p>
            </div>

            <div style="font-size: 13px; line-height: 1.5;">
                <h4 style="margin: 15px 0 5px 0;">1 Subject Of The Agreement</h4>
                <p style="margin: 0;">The Recruiter Undertakes To Search For And Present Suitable Candidates To The Client For A Position Advertised By The Client.</p>

                <h4 style="margin: 15px 0 5px 0;">2 Recruiter's Services</h4>
                <p style="margin: 0;">1. The Recruiter Will Identify Suitable Candidates... 2. Conduct Preliminary Selection... 3. Provide List of Candidates.</p>

                <h4 style="margin: 15px 0 5px 0;">3 Client's Obligations</h4>
                <p style="margin: 0;">The Client Shall Provide All Necessary Information... Review Candidates... Conduct Interviews and Inform the Recruiter of Any Hiring Decision.</p>

                <h4 style="margin: 15px 0 5px 0;">4 Fees And Payment Terms</h4>
                <p style="margin: 0;"><strong>Placement Fee:</strong> The Client Agrees To Pay A Placement Fee Of 25% Of The Agreed Gross Annual Salary Of The Candidate. <br>
                <strong>Payment Deadline:</strong> No Later Than 14 Days After The Start Of Employment.</p>

                <h4 style="margin: 15px 0 5px 0;">5 Guarantees And Refunds</h4>
                <p style="margin: 0;">Replacement Provided Free Of Charge Within 3 Months. 50% Refund Between 3 To 6 Months.</p>

                <h4 style="margin: 15px 0 5px 0;">6 Confidentiality And Data Protection</h4>
                <p style="margin: 0;">Both Parties Agree To Treat All Personal Data In Accordance With BDSG and GDPR.</p>
            </div>

            <div style="margin-top: 30px; border: 1px solid #ccc; padding: 20px;">
                <h2 style="margin: 0 0 10px 0; font-size: 22px;">Job Details</h2>
                <p style="margin: 0; color: #666;">${employer.address}</p>
                <h3 style="margin: 10px 0 5px 0; font-size: 18px;">${job.subCategory}</h3>
                <p style="margin: 0; font-size: 14px;"><strong>${job.jobType}</strong></p>
                <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">$${job.salaryAmount}/${job.salaryType}</p>
                <p style="margin: 0; color: #888; font-size: 12px;">📅 ${new Date(job.deadline).toLocaleDateString()}</p>

                <h4 style="margin: 20px 0 5px 0;">Job Description</h4>
                <p style="margin: 0; font-size: 13px;">${job.description}</p>

                <h4 style="margin: 15px 0 5px 0;">Responsibilities</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                    ${job.responsibilities.map(res => `<li>${res}</li>`).join('')}
                </ul>

                <h4 style="margin: 15px 0 5px 0;">Qualifications</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                    ${job.qualifications.map(qual => `<li>${qual}</li>`).join('')}
                </ul>
            </div>

            <div style="margin-top: 20px; border: 1px solid #ccc; padding: 10px; display: flex; justify-content: space-between;">
                <div style="width: 45%;">
                    <p style="margin: 0; font-size: 12px; color: #888;">Place</p>
                    <p style="margin: 0; font-size: 14px;"><strong>${employer.address || 'Online'}</strong></p>
                </div>
                <div style="width: 45%;">
                    <p style="margin: 0; font-size: 12px; color: #888;">Date</p>
                    <p style="margin: 0; font-size: 14px;"><strong>${new Date().toLocaleDateString()}</strong></p>
                </div>
            </div>
            <p style="font-size: 11px; font-style: italic; margin-top: 5px;">The Contract Was Confirmed By the Client And Has Thus Come Into Effect.</p>

        </div>
      </body>
    `,
  };
  return data;
};

const shiftPlanToWorker = (worker: IWorker, shiftPlan: IShiftPlan) => {
  // Extract month/year for the title from the first plan date
  const firstPlanDate = shiftPlan.plans[0]?.days[0] || new Date();
  const planMonthYear = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(firstPlanDate);

  const data = {
    to: worker.email,
    subject: `Your Shift Plan for ${planMonthYear}`,
    html: `
      <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 40px; color: #333;">
        <div style="max-width: 800px; margin: 0 auto;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <div style="display: flex; align-items: center;">
               <h1 style="font-size: 24px; margin: 0; font-weight: bold;">Shift Plan View</h1>
            </div>
            <img src="https://i.postimg.cc/kMKg91ps/Screenshot-2025-11-03-170353.png" alt="JobsinApp Logo" style="width: 80px;" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 15px;">
            <div>
              <p style="margin: 5px 0;"><strong>Name</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${worker.name}</p>
              <p style="margin: 5px 0;"><strong>Address</strong> &nbsp;: ${worker.address}</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><strong>Email</strong> &nbsp;&nbsp;&nbsp;&nbsp;: ${worker.email}</p>
              <p style="margin: 5px 0;"><strong>Contact</strong> &nbsp;: ${worker.phone}</p>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 18px; margin: 0;">Plan For ${planMonthYear}</h2>
            <p style="color: #666; margin: 5px 0;">Holiday Weekend</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
            <thead>
              <tr style="color: #333;">
                <th style="padding: 10px 0; font-weight: normal; width: 20%;">Date</th>
                <th style="padding: 10px 0; font-weight: normal; width: 20%;">Day</th>
                <th style="padding: 10px 0; font-weight: normal; text-align: center; width: 30%;">From — Until</th>
                <th style="padding: 10px 0; font-weight: normal; text-align: right; width: 20%;">Timeline</th>
              </tr>
            </thead>
            <tbody>
              ${shiftPlan.plans
                .map(plan =>
                  plan.days
                    .map(date => {
                      const d = new Date(date);
                      return `
                    <tr style="border-bottom: none;">
                      <td style="padding: 12px 0;">${d.toLocaleDateString('de-DE')}</td>
                      <td style="padding: 12px 0;">${d.toLocaleDateString('en-US', { weekday: 'long' })}</td>
                      <td style="padding: 12px 0; text-align: center;">
                        <span style="display: inline-block;">${plan.startTime}</span>
                        <span style="display: inline-block; width: 40px; height: 1px; background-color: #277E16; margin: 0 10px; vertical-align: middle;"></span>
                        <span style="display: inline-block;">${plan.endTime}</span>
                      </td>
                      <td style="padding: 12px 0; text-align: right;">${plan.shift}</td>
                    </tr>
                  `;
                    })
                    .join(''),
                )
                .join('')}
            </tbody>
          </table>

          <div style="margin-top: 40px;">
            <h3 style="font-size: 18px; margin-bottom: 10px;">Remarks</h3>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              ${
                shiftPlan.plans
                  .map(p => p.remarks)
                  .filter(r => r)
                  .join('<br>') || 'No specific remarks for this period.'
              }
            </p>
          </div>

        </div>
      </body>
    `,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  confirmAppointment,
  supportReply,
  paymentFailed,
  hiringRequestToAdmin,
  shiftPlanToWorker,
};
