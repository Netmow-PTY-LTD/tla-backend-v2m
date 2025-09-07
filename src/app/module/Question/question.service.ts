import mongoose from 'mongoose';
import { validateObjectId } from '../../utils/validateObjectId';
import { IServiceWiseQuestion } from './question.interface';
import ServiceWiseQuestion from './question.model';

const CreateServiceWiseQuestionIntoDB = async (
  payload: IServiceWiseQuestion,
) => {
  const result = await ServiceWiseQuestion.create(payload);
  return result;
};

const getAllServiceWiseQuestionFromDB = async () => {
  const result = await ServiceWiseQuestion.find();
  return result;
};

const getSingleQuestionFromDB = async (id: string) => {
  validateObjectId(id, 'Question');
  const result = await ServiceWiseQuestion.findById(id).populate('serviceId countryId');
  return result;
};

const getSingleServiceWiseQuestionFromDB = async (id: string) => {
  validateObjectId(id, 'Service');
  const result = await ServiceWiseQuestion.find({ serviceId: id });
  return result;
};

const updateServiceWiseQuestionIntoDB = async (
  id: string,
  payload: Partial<IServiceWiseQuestion>,
) => {
  validateObjectId(id, 'Question');

  const result = await ServiceWiseQuestion.findByIdAndUpdate(id,
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteServiceWiseQuestionFromDB = async (id: string) => {
  validateObjectId(id, 'Question');

  const result = await ServiceWiseQuestion.findByIdAndDelete(id)

  return result;
};

const updateQuestionOrderIntoDB = async (
  payload: { _id: string; order: number }[],
) => {
  // Step 1: Filter valid ObjectIds using your utility
  const validItems: { _id: string; order: number }[] = [];

  for (const item of payload) {
    try {
      validateObjectId(item._id, 'Question');
      validItems.push(item);
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`Skipping invalid Question ID: ${item._id}`);
    }
  }

  // Step 2: Exit early if none are valid
  if (validItems.length === 0) {
    return {
      message: 'No valid Question IDs provided.',
      updated: [],
    };
  }

  // Step 3: Check which IDs actually exist in the database
  const existingIds = await ServiceWiseQuestion.find({
    _id: { $in: validItems?.map((item) => item._id) },
  }).distinct('_id');

  // Step 4: Filter only valid and existing items

  const updateItems = validItems.filter((item) => {
    return existingIds.some(
      (existingId) =>
        existingId.toString() ===
        new mongoose.Types.ObjectId(item._id).toString(),
    );
  });

  if (updateItems.length === 0) {
    return {
      message: 'None of the valid Question IDs exist in the database.',
      updated: [],
    };
  }

  // Step 5: Build bulk update operations
  const bulkOps = updateItems.map(({ _id, order }) => ({
    updateOne: {
      filter: { _id },
      update: { $set: { order } },
    },
  }));

  // Step 6: Execute bulkWrite
  await ServiceWiseQuestion.bulkWrite(bulkOps);

  // Fetch updated documents to return them
  const updatedDocuments = await ServiceWiseQuestion.find({
    _id: { $in: updateItems.map((item) => item._id) },
  });

  return updatedDocuments;
};

export const ServiceWiseQuestionService = {
  CreateServiceWiseQuestionIntoDB,
  getAllServiceWiseQuestionFromDB,
  getSingleServiceWiseQuestionFromDB,
  deleteServiceWiseQuestionFromDB,
  updateServiceWiseQuestionIntoDB,
  getSingleQuestionFromDB,
  updateQuestionOrderIntoDB,
};
