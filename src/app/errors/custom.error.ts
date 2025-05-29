import { HTTP_STATUS } from '../constant/httpStatus';

export const sendNotFoundResponse = (label: string) => {
  return {
    statusCode: HTTP_STATUS.OK,
    success: false,
    message: `  ${label} `,
    data: null,
  };
};
