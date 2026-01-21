import { Request, Response } from 'express';
import { AppointmentServices } from './appointment.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '../user/user.constant';
import { LimitationServices } from '../limitation/limitation.service';

// create appointment
const createAppointment = catchAsync(async (req: Request, res: Response) => {
  if (req.user.role === USER_ROLES.EMPLOYER){
    await LimitationServices.onCreateAppointment(req.user.id, req.body.receiver);
  }
  
  const result = await AppointmentServices.createAppointmentToDB({
    ...req.body,
    sender: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Appointment created successfully',
    data: result,
  });
});

// update appointment
const updateAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentServices.updateAppointmentToDB(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Appointment updated successfully',
    data: result,
  });
});

// get my appointments
const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentServices.getAppointmentsByUserId(
    req.user.id,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Appointments retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

// get my appointment requests
const getMyAppointmentRequests = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AppointmentServices.getAppointmentRequestByUserId(
      req.user.id,
      req.query
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Appointments retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }
);

export const AppointmentController = {
  createAppointment,
  updateAppointment,
  getMyAppointments,
  getMyAppointmentRequests,
};
