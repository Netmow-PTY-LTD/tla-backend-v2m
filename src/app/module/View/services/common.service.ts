import mongoose, { Types } from "mongoose";
import UserProfile from "../../User/models/user.model";
import CreditTransaction from "../../CreditPayment/models/creditTransaction.model";
import LeadResponse from "../../LeadResponse/models/response.model";
import { HTTP_STATUS } from "../../../constant/httpStatus";
import CreditPackage from "../../CreditPayment/models/creditPackage.model";
import PaymentMethod from "../../CreditPayment/models/paymentMethod.model";
import { ILeadResponse } from "../../LeadResponse/interfaces/response.interface";
import { logActivity } from "../../Activity/utils/logActivityLog";
import { createNotification } from "../../Notification/utils/createNotification";
import Lead from "../../Lead/models/lead.model";

const createLawyerResponseAndSpendCredit = async (
  userId: Types.ObjectId,
  payload: { leadId: Types.ObjectId; credit: number; serviceId: Types.ObjectId }
) => {
  const session = await mongoose.startSession();

  try {
    // Find user profile
    let user = await UserProfile.findOne({ user: userId });
    if (!user) {
      return { success: false, status: HTTP_STATUS.NOT_FOUND, message: 'User not found' };
    }

    const { leadId, credit, serviceId } = payload;

    if (user.credits < credit) {

      // User has saved cards — suggest automatic credit purchase
      const creditPackages = await CreditPackage.find({ isActive: true }).sort({ credit: 1 });
      const requiredCredits = credit - user.credits;
      const recommendedPackage = creditPackages.find(pkg => pkg.credit >= requiredCredits);


      // Check if user has saved payment methods

      const savedCards = await PaymentMethod.find({ userProfileId: user._id, isActive: true, isDefault: true });


      if (savedCards.length === 0) {
        // No saved card — tell frontend to ask user to add a card first
        return {
          success: false,
          status: HTTP_STATUS.PRECONDITION_FAILED, // 412 or 400 as you prefer
          message: 'Insufficient credits and no saved payment method. Please add a card first.',
          needAddCard: true,
          requiredCredits: credit - user.credits,
          recommendedPackage
        };
      }



      return {
        success: false,
        status: HTTP_STATUS.PAYMENT_REQUIRED, // 402 or 400 as you prefer
        message: 'Insufficient credits. Auto-purchase recommended.',
        autoPurchaseCredit: true,
        requiredCredits,
        recommendedPackage,
        // Optionally send info needed for auto-purchase like savedCardId
        savedCardId: savedCards[0]._id,
      };
    }


    // Enough credits: do the transaction as before



    let resultLeadResponse: ILeadResponse | null = null;

    await session.withTransaction(async () => {
      user = await UserProfile.findOne({ user: userId }).session(session);
      if (!user) {
        throw new Error('User not found inside transaction');
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

      const [leadResponse] = await LeadResponse.create(
        [
          {
            leadId,
            // userProfileId: user._id,
            responseBy: user._id,
            serviceId,
          },
        ],
        { session }
      );

      // Log: Credit spent
      await logActivity({
        createdBy: userId,
        activityType: 'credit_spent',
        module: 'response',
        objectId: leadResponse._id,
        activityNote: `Spent ${credit} credits to contact lead.`,
        extraField: {
          creditsBefore,
          creditsAfter,
          creditSpent: credit,
          leadId,
        },
        session,
      },);
      // Log: Response created
      await logActivity({
        createdBy: userId,
        activityType: 'create',
        module: 'response',
        objectId: leadResponse._id,
        activityNote: `Created response for this lead.`,
        extraField: {
          leadId,
          serviceId,
        },
        session,
      },);


     // 3. Create notification for the lead

     const leadUser= await Lead.findById(leadId).populate({path:'userProfileId',select:'name user'})
     
    await createNotification({
      userId: leadUser?.userProfileId?.user,
      title: "You've received a new contact request",
      message: `${user.name} wants to connect with you.`,
      type: "lead",
      link: `/lead/messages/${leadResponse._id}`,
    });

    // 4. Create notification for the lawyer
    await createNotification({
      userId: userId,
      title: "Your message was sent",
      message: `You’ve successfully contacted ${leadUser?.userProfileId?.name}.`,
      type: "response",
      link: `/lawyer/responses/${leadResponse._id}`,
    });

      // Return the leadResponse in the outer scope
      resultLeadResponse = leadResponse; // declare this before transaction

    });



    return {
      success: true,
      message: 'Contact initiated and credits deducted successfully',
      data: {
        responseId: (resultLeadResponse as any)?._id
      }

    };
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};



export const commonService = {
  createLawyerResponseAndSpendCredit,
};
