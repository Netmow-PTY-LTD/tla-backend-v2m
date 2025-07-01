import mongoose, { Types } from "mongoose";
import UserProfile from "../../User/models/user.model";
import { sendNotFoundResponse } from "../../../errors/custom.error";
import CreditTransaction from "../../CreditPayment/models/creditTransaction.model";
import LeadResponse from "../../LeadResponse/models/response.model";
import { HTTP_STATUS } from "../../../constant/httpStatus";




const createLawyerResponseAndSpendCredit = async (
  userId: Types.ObjectId,
  payload: { leadId: Types.ObjectId; credit: number; serviceId: Types.ObjectId }
) => {
  const session = await mongoose.startSession();

  
  try {
    await session.withTransaction(async () => {
      const user = await UserProfile.findOne({ user: userId }).session(session);
      if (!user) {
       return { success:false, status:HTTP_STATUS.NOT_FOUND, message: 'User not found' };
      }

      const { leadId, credit, serviceId } = payload;

      if (user.credits < credit) {
        return { success:false, status: HTTP_STATUS.BAD_REQUEST, message: 'Insufficient credits' };
      }

      const creditsBefore = user.credits;
      user.credits -= credit;
      const creditsAfter = user.credits;

      await user.save({ session });

      await CreditTransaction.create(
        [
          {
            userProfileId: user._id,
            type: 'usage',
            credit: -credit,
            creditsBefore,
            creditsAfter,
            description: 'Credits deducted for initiating contact with the lawyer',
            relatedLeadId: leadId,
          },
        ],
        { session }
      );

      await LeadResponse.create(
        [
          {
            leadId,
            userProfileId: user._id,
            serviceId,
          },
        ],
        { session }
      );
    });

    return {
      success: true,
      message: 'Contact initiated and credits deducted successfully',
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error; // You can format this into a custom error handler if needed
  } finally {
    await session.endSession();
  }
};

export const commonService = {
  createLawyerResponseAndSpendCredit,
};
