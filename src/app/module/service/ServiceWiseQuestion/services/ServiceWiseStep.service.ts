import { HTTP_STATUS } from '../../../../constant/httpStatus';
import { AppError } from '../../../../errors/error';
import { IServiceWiseQuestion } from '../interfaces/ServiceWiseQuestion.interface';
import ServiceWiseQuestion from '../models/ServiceWiseQuestion.model';

const CreateServiceWiseQuestionIntoDB = async (
  payload: IServiceWiseQuestion,
) => {
  const result = await ServiceWiseQuestion.create(payload);
  return result;
};

const getAllServiceWiseQuestionFromDB = async () => {
  const result = await ServiceWiseQuestion.find({ deletedAt: null });
  return result;
};

const getSingleServiceWiseQuestionFromDB = async (id: string) => {
  const swQuestion = await ServiceWiseQuestion.isServiceWiseStepExists(id);
  if (!swQuestion) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'This Service Wise Question is not found !',
    );
  }

  const result = await ServiceWiseQuestion.findOne({
    _id: swQuestion._id,
    deletedAt: null,
  });
  return result;
};

const updateServiceWiseQuestionIntoDB = async (
  id: string,
  payload: Partial<IServiceWiseQuestion>,
) => {
  const swQuestion = await ServiceWiseQuestion.isServiceWiseStepExists(id);
  if (!swQuestion) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'This Service Wise Question is not found !',
    );
  }

  const result = await ServiceWiseQuestion.findOneAndUpdate(
    { _id: swQuestion._id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteServiceWiseQuestionFromDB = async (id: string) => {
  const swQuestion = await ServiceWiseQuestion.isServiceWiseStepExists(id);
  if (!swQuestion) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'This Service Wise Question is not found !',
    );
  }
  const deletedAt = new Date().toISOString();
  const result = await ServiceWiseQuestion.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const ServiceWiseQuestionService = {
  CreateServiceWiseQuestionIntoDB,
  getAllServiceWiseQuestionFromDB,
  getSingleServiceWiseQuestionFromDB,
  deleteServiceWiseQuestionFromDB,
  updateServiceWiseQuestionIntoDB,
};
