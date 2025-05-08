/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constant/httpStatus';

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'API Not Found !!',
    error: '',
  });
};

export default notFound;
