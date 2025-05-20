import { validateObjectId } from '../../../utils/validateObjectId';
import Option from '../../Service/Option/models/option.model';
import ServiceWiseQuestion from '../../Service/Question/models/ServiceWiseQuestion.model';

const getSingleServiceWiseQuestionFromDB = async (
  serviceId: string,
  countryId: string,
) => {
  validateObjectId(serviceId, 'Service');
  validateObjectId(countryId, 'Country');
  const result = await ServiceWiseQuestion.find({
    serviceId: serviceId,
    countryId: countryId,
    deletedAt: null,
  })
    .populate('serviceId countryId')
    .sort({ order: 1 }); // ascending order by 'order' field
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
