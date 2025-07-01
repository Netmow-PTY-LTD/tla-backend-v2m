import mongoose, { Types } from "mongoose";
import UserProfile from "../../User/models/user.model";
import { sendNotFoundResponse } from "../../../errors/custom.error";
import CreditTransaction from "../../CreditPayment/models/creditTransaction.model";
import LeadResponse from "../../LeadResponse/models/response.model";
import { HTTP_STATUS } from "../../../constant/httpStatus";
import CreditPackage from "../../CreditPayment/models/creditPackage.model";
import PaymentMethod from "../../CreditPayment/models/paymentMethod.model";




// const createLawyerResponseAndSpendCredit = async (
//   userId: Types.ObjectId,
//   payload: { leadId: Types.ObjectId; credit: number; serviceId: Types.ObjectId }
// ) => {
//   const session = await mongoose.startSession();

  
//   try {
//     await session.withTransaction(async () => {
//       const user = await UserProfile.findOne({ user: userId }).session(session);
//       if (!user) {
//        return { success:false, status:HTTP_STATUS.NOT_FOUND, message: 'User not found' };
//       }

//       const { leadId, credit, serviceId } = payload;

//       if (user.credits < credit) {
//         return { success:false, status: HTTP_STATUS.BAD_REQUEST, message: 'Insufficient credits' };
//       }

//       const creditsBefore = user.credits;
//       user.credits -= credit;
//       const creditsAfter = user.credits;

//       await user.save({ session });

//       await CreditTransaction.create(
//         [
//           {
//             userProfileId: user._id,
//             type: 'usage',
//             credit: -credit,
//             creditsBefore,
//             creditsAfter,
//             description: 'Credits deducted for initiating contact with the lawyer',
//             relatedLeadId: leadId,
//           },
//         ],
//         { session }
//       );

//       await LeadResponse.create(
//         [
//           {
//             leadId,
//             userProfileId: user._id,
//             serviceId,
//           },
//         ],
//         { session }
//       );
//     });

//     return {
//       success: true,
//       message: 'Contact initiated and credits deducted successfully',
//     };
//   } catch (error) {
//     console.error('Transaction failed:', error);
//     throw error; // You can format this into a custom error handler if needed
//   } finally {
//     await session.endSession();
//   }
// };





// const createLawyerResponseAndSpendCredit = async (
//   userId: Types.ObjectId,
//   payload: { leadId: Types.ObjectId; credit: number; serviceId: Types.ObjectId }
// ) => {
//   const session = await mongoose.startSession();

//   try {
//     // First, find user outside transaction
//     let user = await UserProfile.findOne({ user: userId });
//     if (!user) {
//       return { success: false, status: HTTP_STATUS.NOT_FOUND, message: 'User not found' };
//     }

//     const { leadId, credit, serviceId } = payload;

//     // Check if credits are enough
//     if (user.credits < credit) {
//       // Suggest credit package
//       const creditPackages = await CreditPackage.find({ isActive: true }).sort({ credit: 1 });
//       const requiredCredits = credit - user.credits;
//       const recommendedPackage = creditPackages.find(pkg => pkg.credit >= requiredCredits);

//       return {
//         success: false,
//         status: HTTP_STATUS.BAD_REQUEST,
//         message: 'Insufficient credits',
//         requiredCredits,
//         recommendedPackage,
//         showCheckout: true, // frontend triggers Stripe checkout flow
//       };
//     }

//     // Begin transaction
//     await session.withTransaction(async () => {
//       // Re-fetch user inside transaction and check null
//       user = await UserProfile.findOne({ user: userId }).session(session);
//       if (!user) {
//        return { success: false, status: HTTP_STATUS.NOT_FOUND, message: 'User not found' };
//       }

//       const creditsBefore = user.credits;
//       user.credits -= credit;
//       const creditsAfter = user.credits;

//       await user.save({ session });

//       await CreditTransaction.create(
//         [
//           {
//             userProfileId: user._id,
//             type: 'usage',
//             credit: -credit,
//             creditsBefore,
//             creditsAfter,
//             description: 'Credits deducted for initiating contact with the lawyer',
//             relatedLeadId: leadId,
//           },
//         ],
//         { session }
//       );

//       await LeadResponse.create(
//         [
//           {
//             leadId,
//             userProfileId: user._id,
//             serviceId,
//           },
//         ],
//         { session }
//       );
//     });

//     return {
//       success: true,
//       message: 'Contact initiated and credits deducted successfully',
//     };
//   } catch (error) {
//     console.error('Transaction failed:', error);
//     throw error;
//   } finally {
//     await session.endSession();
//   }
// };





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
      // Check if user has saved payment methods
      const savedCards = await PaymentMethod.find({ userProfileId: user._id, isActive: true ,isDefault:true});

      if (savedCards.length === 0) {
        // No saved card — tell frontend to ask user to add a card first
        return {
          success: false,
          status: HTTP_STATUS.PRECONDITION_FAILED, // 412 or 400 as you prefer
          message: 'Insufficient credits and no saved payment method. Please add a card first.',
          needAddCard: true,
          requiredCredits: credit - user.credits,
        };
      }

      // User has saved cards — suggest automatic credit purchase
      const creditPackages = await CreditPackage.find({ isActive: true }).sort({ credit: 1 });
      const requiredCredits = credit - user.credits;
      const recommendedPackage = creditPackages.find(pkg => pkg.credit >= requiredCredits);

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
    throw error;
  } finally {
    await session.endSession();
  }
};



export const commonService = {
  createLawyerResponseAndSpendCredit,
};
