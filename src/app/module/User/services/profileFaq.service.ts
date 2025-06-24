import { sendNotFoundResponse } from '../../../errors/custom.error';
import { validateObjectId } from '../../../utils/validateObjectId';
import Faq, { IFaq } from '../models/faq.model';
import UserProfile from '../models/user.model';

const updateProfileFaqIntoDB = async (
  userId: string,
  payload: Partial<IFaq> & { _id?: string }, // accept _id like the other function
) => {
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) {
    return sendNotFoundResponse('user profile data');
  }

  let faq;

  // Try to update existing FAQ if _id exists
  if (payload._id) {
    faq = await Faq.findByIdAndUpdate(
      payload._id,
      {
        ...payload,
        userProfileId: userProfile._id,
      },
      { new: true },
    );
  }

  // If not found or no _id, create new FAQ
  if (!faq) {
    faq = await Faq.create({
      ...payload,
      userProfileId: userProfile._id,
    });
  }

  return faq;
};

const deleteFaqIntoDB = async (id: string) => {
  validateObjectId(id, 'Faq ');
  const faqDelete = await Faq.findByIdAndDelete(id);

  return faqDelete;
};

export const profileFaqService = {
  updateProfileFaqIntoDB,
  deleteFaqIntoDB,
};
