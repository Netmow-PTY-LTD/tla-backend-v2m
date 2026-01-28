/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import { TErrorSources } from '../interface/error';
import { AppError, error } from '../errors/error';
import logger from '../utils/logger';
import errorTrackingService from '../services/errorTracking.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next): any => {
  //setting default values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = error.handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = error.handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'CastError') {
    const simplifiedError = error.handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = error.handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  // Detailed error logging with context
  interface AuthRequest {
    user?: {
      userId?: string;
      _id?: string;
      email?: string;
    };
  }
  const userInfo = (req as AuthRequest).user;
  errorTrackingService.logError({
    timestamp: new Date().toISOString(),
    method: req.method,
    endpoint: req.originalUrl,
    statusCode,
    errorMessage: message,
    errorStack: err.stack,
    userId: userInfo?.userId || userInfo?._id,
    userEmail: userInfo?.email,
    requestBody: req.body,
    requestParams: req.params,
    requestQuery: req.query,
  });

  // Basic logging
  logger.error(
    `Method: ${req.method} | URL: ${req.originalUrl} | Message: ${message} | Stack: ${err.stack}`
  );

  //ultimate return
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    stack: config.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
