import { validateObjectId } from '../../../../utils/validateObjectId';
import Option from '../../Option/models/option.model';

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
