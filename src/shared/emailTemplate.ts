import { IAppointment } from '../app/modules/appointment/appointment.interface';
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
                        values.scheduledAt
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
          <div style="text-align: center; margin-top: 20px; color: #aaa; font-size: 12px;">
              © 2026 JobsinApp. All rights reserved.
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
};
