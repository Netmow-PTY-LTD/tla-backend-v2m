import { Types } from 'mongoose';
import { validateObjectId } from '../../../utils/validateObjectId';
import Option from '../../Service/Option/models/option.model';
import ServiceWiseQuestion from '../../Service/Question/models/ServiceWiseQuestion.model';

const getSingleServiceWiseQuestionFromDB = async (
  serviceId: string,
  countryId: string,
) => {
  validateObjectId(serviceId, 'Service');
  validateObjectId(countryId, 'Country');
  const serviceObjectId = new Types.ObjectId(serviceId);
  const countryObjectId = new Types.ObjectId(countryId);

  const result = await ServiceWiseQuestion.aggregate([
    {
      $match: {
        serviceId: serviceObjectId,
        countryId: countryObjectId,
        deletedAt: null,
      },
    },
    {
      $sort: { order: 1 }, // Sort by order ascending
    },
    {
      $lookup: {
        from: 'options', // collection name
        localField: '_id',
        foreignField: 'questionId',
        as: 'options',
      },
    },
    {
      $project: {
        question: 1,
        questionType: 1,
        order: 1,
        options: {
          _id: 1,
          name: 1,
          slug: 1,
        },
      },
    },
  ]);

  return result;
};

const getQuestionWiseOptionsFromDB = async (questionId: string) => {
  validateObjectId(questionId, 'Question');
  const result = await Option.find({
    questionId: questionId,
    deletedAt: null,
  }).populate(['questionId', 'serviceId', 'countryId']); // ✅ fixed

  return result;
};

export const questionWiseOptionsService = {
  getQuestionWiseOptionsFromDB,
};

export const viewService = {
  getSingleServiceWiseQuestionFromDB,
  getQuestionWiseOptionsFromDB,
};
