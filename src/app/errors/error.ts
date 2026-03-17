/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { TErrorSources, TGenericErrorResponse } from '../interface/error';
import { ZodError, ZodIssue } from 'zod';

export class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string, stack = '') {
    super(message);
    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const handleCastError = (
  err: mongoose.Error.CastError,
): TGenericErrorResponse => {
  const errorSources: TErrorSources = [
    {
      path: err.path,
      message: err.message,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: `Invalid ID: The value '${err.value}' is not a valid ${err.kind} for the field '${err.path}'.`,
    errorSources,
  };
};



const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const statusCode = 409; // 409 Conflict is more semantically correct for duplicate key errors
  // Get the duplicate key name and value
  const duplicateKey = Object.keys(err.keyValue || {})[0] || 'Unknown field';
  const duplicateValue = err.keyValue?.[duplicateKey] || 'Unknown value';


  const errorSources: TErrorSources = [
    {
      path: duplicateKey,
      message: `A record with this ${duplicateKey} (${duplicateValue}) already exists.Please use a different value.`,
    },
  ];

  return {
    statusCode,
    message: `Duplicate entry detected: ${duplicateKey} with the value (${duplicateValue}) already exists.`,
    errorSources,
  };
};

const handleValidationError = (
  err: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
  const errorSources: TErrorSources = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val?.path,
        message: val?.message,
      };
    },
  );

  const statusCode = 400;
  const fieldPaths = errorSources.map((e) => e.path).join(', ');

  return {
    statusCode,
    message: `Mongoose Validation failed for (${fieldPaths}). Detail: ${errorSources[0]?.message || 'Invalid input detected.'}`,
    errorSources,
  };
};

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path.join('.'),
      message: issue.message,
    };
  });

  const statusCode = 400;
  const fieldPaths = errorSources.map((e) => e.path).join(', ');

  return {
    statusCode,
    message: `Zod Validation failed for (${fieldPaths}). Detail: ${errorSources[0]?.message || 'Invalid request format.'}`,
    errorSources,
  };
};

export const error = {
  handleCastError,
  handleDuplicateError,
  handleValidationError,
  handleZodError,
};
