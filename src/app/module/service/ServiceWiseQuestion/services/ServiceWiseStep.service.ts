import { IServiceWiseQuestion } from '../interfaces/ServiceWiseQuestion.interface';
import ServiceWiseQuestion from '../models/ServiceWiseQuestion.model';

const CreateServiceWiseQuestionIntoDB = async (
  payload: IServiceWiseQuestion,
) => {
  const result = await ServiceWiseQuestion.create(payload);
  return result;
};

const getAllServiceWiseQuestionFromDB = async () => {
  const result = await ServiceWiseQuestion.find({});
  return result;
};

const getSingleServiceWiseQuestionFromDB = async (id: string) => {
  const result = await ServiceWiseQuestion.findById(id);
  return result;
};

const updateServiceWiseQuestionIntoDB = async (
  id: string,
  payload: Partial<IServiceWiseQuestion>,
) => {
  const result = await ServiceWiseQuestion.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteServiceWiseQuestionFromDB = async (id: string) => {
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
