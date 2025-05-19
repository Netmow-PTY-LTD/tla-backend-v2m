import { validateObjectId } from '../../../../utils/validateObjectId';
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

const getSingleQuestionFromDB = async (id: string) => {
  validateObjectId(id, 'Question');
  const result = await ServiceWiseQuestion.findOne({
    _id: id,
    deletedAt: null,
  }).populate('serviceId countryId');
  return result;
};

const getSingleServiceWiseQuestionFromDB = async (id: string) => {
  validateObjectId(id, 'Service');
  const result = await ServiceWiseQuestion.find({
    serviceId: id,
    deletedAt: null,
  });

  return result;
};

const updateServiceWiseQuestionIntoDB = async (
  id: string,
  payload: Partial<IServiceWiseQuestion>,
) => {
  validateObjectId(id, 'Question');

  const result = await ServiceWiseQuestion.findOneAndUpdate(
    { _id: id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteServiceWiseQuestionFromDB = async (id: string) => {
  validateObjectId(id, 'Question');
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
  getSingleQuestionFromDB,
};
