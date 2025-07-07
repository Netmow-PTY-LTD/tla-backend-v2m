import { Response } from 'express';

type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
  
};

export type QueryTime = {
  start_time: string;         // ISO date string
  end_time: string;           // ISO date string
  durationInMs: string;       // e.g., "123.45"
  durationInSeconds: string;  // e.g., "0.12"
};

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  // meta?: TMeta;
  pagination?: TMeta;
  queryTime?:QueryTime
  token?: string;
  data: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data?.statusCode).json({
    success: data.success,
    message: data.message,
    // meta: data.meta,
    pagination: data.pagination,
    queryTime:data.queryTime,
    token: data.token,
    data: data.data,
  });
};

export default sendResponse;
