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
import { getIO } from "../../../sockets";
import { ResponseWiseChatMessage } from "../models/chatMessage.model";
import { LeadContactRequest } from "../models/LeadContactRequest.model";
import User from "../../Auth/models/auth.model";
import { AppError } from "../../../errors/error";
import { validateObjectId } from "../../../utils/validateObjectId";

// const createLawyerResponseAndSpendCredit = async (
//   userId: Types.ObjectId,
//   payload: { leadId: Types.ObjectId; credit: number; serviceId: Types.ObjectId }
// ) => {
//   const io = getIO();
//   const session = await mongoose.startSession();

//   try {
//     // Find user profile
//     let user = await UserProfile.findOne({ user: userId });
//     if (!user) {
//       return { success: false, status: HTTP_STATUS.NOT_FOUND, message: 'User not found' };
//     }

//     const { leadId, credit, serviceId } = payload;

//     if (user.credits < credit) {

//       // User has saved cards — suggest automatic credit purchase
//       const creditPackages = await CreditPackage.find({ isActive: true }).sort({ credit: 1 });
//       const requiredCredits = Math.max(0, credit - user.credits);
//       const recommendedPackage = creditPackages.find(pkg => pkg.credit >= requiredCredits);

//       // Check if user has saved payment methods
//       const savedCards = await PaymentMethod.find({ userProfileId: user._id, isActive: true, isDefault: true });

//       if (savedCards.length === 0) {
//         // No saved card — tell frontend to ask user to add a card first
//         return {
//           success: false,
//           status: HTTP_STATUS.PRECONDITION_FAILED, // 412 or 400 as you prefer
//           message: 'Insufficient credits and no saved payment method. Please add a card first.',
//           needAddCard: true,
//           requiredCredits: requiredCredits,
//           recommendedPackage
//         };
//       }


//       return {
//         success: false,
//         status: HTTP_STATUS.PAYMENT_REQUIRED, // 402 or 400 as you prefer
//         message: 'Insufficient credits. Auto-purchase recommended.',
//         autoPurchaseCredit: true,
//         requiredCredits,
//         recommendedPackage,
//         // Optionally send info needed for auto-purchase like savedCardId
//         savedCardId: savedCards[0]._id,
//       };
//     }


//     // Enough credits: do the transaction as before



//     let resultLeadResponse: ILeadResponse | null = null;

//     await session.withTransaction(async () => {
//       user = await UserProfile.findOne({ user: userId }).session(session);
//       if (!user) {
//         throw new Error('User not found inside transaction');
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

//       const [leadResponse] = await LeadResponse.create(
//         [
//           {
//             leadId,
//             // userProfileId: user._id,
//             responseBy: user._id,
//             serviceId,
//           },
//         ],
//         { session }
//       );

//       const lead = await Lead.findOneAndUpdate(
//         { _id: leadId }, // Find the lead by its _id
//         [
//           {
//             $set: {
//               responders: {
//                 $cond: [
//                   { $in: [user._id, '$responders'] },
//                   '$responders', // If already exists, keep as is
//                   { $concatArrays: ['$responders', [user._id]] }, // Else push
//                 ],
//               },
//             },
//           },
//         ],
//         { new: true, session }
//       );
//       // Log: Credit spent
//       await logActivity({
//         createdBy: userId,
//         activityType: 'credit_spent',
//         module: 'response',
//         objectId: leadResponse._id,
//         activityNote: `Spent ${credit} credits to contact lead.`,
//         extraField: {
//           creditsBefore,
//           creditsAfter,
//           creditSpent: credit,
//           leadId,
//         },
//         session,
//       },);
//       // Log: Response created
//       await logActivity({
//         createdBy: userId,
//         activityType: 'create',
//         module: 'response',
//         objectId: leadResponse._id,
//         activityNote: `Created response for this lead.`,
//         extraField: {
//           leadId,
//           serviceId,
//         },
//         session,
//       },);


//       // 3. Create notification for the lead

//       const leadUser = await Lead.findById(leadId).populate({ path: 'userProfileId', select: 'name user' }).session(session)

//       // Type assertion to safely access user field
//       const populatedLeadUser = leadUser as typeof leadUser & {
//         userProfileId: {
//           _id: Types.ObjectId;
//           name: string;
//           user: Types.ObjectId;
//         };
//       };


//       // Return the leadResponse in the outer scope
//       resultLeadResponse = leadResponse; // declare this before transaction

//       await createNotification({
//         userId: populatedLeadUser?.userProfileId?.user,
//         toUser: userId,
//         title: "You've received a new contact request",
//         message: `${user.name} wants to connect with you.`,
//         module: 'lead',        // module relates to the lead domain
//         type: 'contact',       // type indicates a contact request notification
//         link: `/lead/messages/${leadResponse._id}`,
//         session,
//       });

//       // 4. Create notification for the lawyer
//       await createNotification({
//         userId: userId,
//         toUser: populatedLeadUser?.userProfileId?.user,
//         title: "Your message was sent",
//         message: `You’ve successfully contacted ${populatedLeadUser?.userProfileId?.name}.`,
//         module: 'response',    // module relates to response domain
//         type: 'create',        // type for creating a response/contact
//         link: `/lawyer/responses/${leadResponse._id}`,
//         session,
//       });
//       // 📡 Emit socket notifications
//       io.to(`user:${populatedLeadUser?.userProfileId?.user}`).emit('notification', {
//         userId: populatedLeadUser?.userProfileId?.user,
//         toUser: userId,
//         title: "You've received a new contact request",
//         message: `${user.name} wants to connect with you.`,
//         module: 'lead',        // module relates to the lead domain
//         type: 'contact',       // type indicates a contact request notification
//         link: `/lead/messages/${leadResponse._id}`,

//       });
//       io.to(`user:${userId}`).emit('notification', {
//         userId: userId,
//         toUser: populatedLeadUser?.userProfileId?.user,
//         title: "Your message was sent",
//         message: `You’ve successfully contacted ${populatedLeadUser?.userProfileId?.name}.`,
//         module: 'response',    // module relates to response domain
//         type: 'create',        // type for creating a response/contact
//         link: `/lawyer/responses/${leadResponse._id}`,
//       });



//     });



//     return {
//       success: true,
//       message: 'Contact initiated and credits deducted successfully',
//       data: {
//         responseId: (resultLeadResponse as any)?._id
//       }

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
  const io = getIO();
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
      const requiredCredits = Math.max(0, credit - user.credits);
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
          requiredCredits: requiredCredits,
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


    let resultLeadResponse: ILeadResponse | null = null;
    // let leadUser;


    const leadUser = await Lead.findById(leadId).populate({ path: 'userProfileId', select: 'name user' }).session(session)

    // Type assertion to safely access user field
    const populatedLeadUser = leadUser as typeof leadUser & {
      userProfileId: {
        _id: Types.ObjectId;
        name: string;
        user: Types.ObjectId;
      };
    };


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

     await Lead.findOneAndUpdate(
        { _id: leadId }, // Find the lead by its _id
        [
          {
            $set: {
              responders: {
                $cond: [
                  { $in: [user._id, '$responders'] },
                  '$responders', // If already exists, keep as is
                  { $concatArrays: ['$responders', [user._id]] }, // Else push
                ],
              },
            },
          },
        ],
        { new: true, session }
      );
      // Log: Credit spent
      await logActivity({
        createdBy: userId,
        activityType: 'credit_spent',
        module: 'response',
        objectId: leadResponse._id,
        activityNote: `Spent ${credit} credits to contact`,
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
        activityNote: `Created response`,
        extraField: {
          leadId,
          serviceId,
        },
        session,
      },);


      // Return the leadResponse in the outer scope
      resultLeadResponse = leadResponse; // declare this before transaction

      await createNotification({
        userId: populatedLeadUser?.userProfileId?.user,
        toUser: userId,
        title: "You've received a new contact request",
        message: `${user.name} wants to connect with you.`,
        module: 'lead',        // module relates to the lead domain
        type: 'contact',       // type indicates a contact request notification
        link: `/client/dashboard/my-cases/${leadId}`,
        session,
      });

      // 4. Create notification for the lawyer
      await createNotification({
        userId: userId,
        toUser: populatedLeadUser?.userProfileId?.user,
        title: "Your message was sent",
        message: `You’ve successfully contacted ${populatedLeadUser?.userProfileId?.name}.`,
        module: 'response',    // module relates to response domain
        type: 'create',        // type for creating a response/contact
        link: `/lawyer/dashboard/my-responses?responseId=${leadResponse._id}`,
        session,
      });


    });

    // 📡 --------------- Emit socket notifications -----------------------------------------
    io.to(`user:${populatedLeadUser?.userProfileId?.user}`).emit('notification', {
      userId: populatedLeadUser?.userProfileId?.user,
      toUser: userId,
      title: "You've received a new contact request",
      message: `${user.name} wants to connect with you.`,
      module: 'lead',        // module relates to the lead domain
      type: 'contact',       // type indicates a contact request notification
      link: `/client/dashboard/my-cases/${leadId}`,

    });
    io.to(`user:${userId}`).emit('notification', {
      userId: userId,
      toUser: populatedLeadUser?.userProfileId?.user,
      title: "Your message was sent",
      message: `You’ve successfully contacted ${populatedLeadUser?.userProfileId?.name}.`,
      module: 'response',    // module relates to response domain
      type: 'create',        // type for creating a response/contact
      link: `/lawyer/dashboard/my-responses?responseId=${(resultLeadResponse as any)?._id}`,
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



const getChatHistoryFromDB = async (responseId: string) => {

  const messages = await ResponseWiseChatMessage.find({ responseId })
    .populate({
      path: 'from',
      populate: {
        path: 'profile',
        select: 'name profilePicture',
      },
    })
    .sort({ createdAt: 1 }); // oldest messages first





  return messages

}






const getLawyerSuggestionsFromDB = async (
  userId: string,
  serviceId: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc' } = options;

  const skip = (page - 1) * limit;
  const sortOption: Record<string, 1 | -1> = {};
  sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // First, get current user's profileId (needed for lookup)
  const currentUserProfile = await UserProfile.findOne({ user: userId }, { _id: 1 });
  const currentProfileId = currentUserProfile?._id;
  const pipeline = [
    // 1. Match users excluding the current one
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(userId) }
      }
    },
    // 2. Lookup profile
    {
      $lookup: {
        from: 'userprofiles',
        localField: 'profile',
        foreignField: '_id',
        as: 'profile'
      }
    },
    // 3. Unwind profile
    { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
    // 4. Filter only profiles that have serviceId
    {
      $match: {
        'profile.serviceIds': new mongoose.Types.ObjectId(serviceId)
      }
    },
    // 5. Lookup serviceIds in profile
    {
      $lookup: {
        from: 'services', // adjust to your services collection name
        localField: 'profile.serviceIds',
        foreignField: '_id',
        as: 'profile.serviceIds'
      }
    },


    //  Lookup into LeadContactRequest to see if request exists
    {
      $lookup: {
        from: 'leadcontactrequests',
        let: { lawyerProfileId: '$profile._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$requestedId', currentProfileId] }, // current user requested
                  { $eq: ['$toRequestId', '$$lawyerProfileId'] } // to this lawyer
                ]
              }
            }
          },
          { $limit: 1 }
        ],
        as: 'requestInfo'
      }
    },
    //  Add requested: true/false
    {
      $addFields: {
        isRequested: { $gt: [{ $size: '$requestInfo' }, 0] }
      }
    },

    // Hide requestInfo field from output
    {
      $project: {
        requestInfo: 0
      }
    },


    // 6. Sorting
    { $sort: sortOption },
    // 7. Facet for paginated data and total count
    {
      $facet: {
        paginatedData: [
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
  ];

  const result = await User.aggregate(pipeline);

  const lawyers = result[0]?.paginatedData || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;

  return {
    lawyers,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};









export const createLeadContactRequest = async (
  leadId: string,
  requestedUserId: string,
  toRequestUserId: string,
  message?: string
) => {

  validateObjectId(leadId, "leadId")
  validateObjectId(requestedUserId, "requestedUserId")
  validateObjectId(toRequestUserId, "toRequestUserId")

  // Prevent self-request
  if (requestedUserId === toRequestUserId) {
    throw new AppError(400, 'You cannot send a request to yourself.');
  }

  // Fetch both profiles in one query batch
  const [requestedProfile, toRequestProfile] = await Promise.all([
    UserProfile.findOne({ user: requestedUserId }).select('_id'),
    UserProfile.findOne({ user: toRequestUserId }).select('_id'),
  ]);

  if (!requestedProfile) {
    throw new AppError(404, 'Requested user profile not found.');
  }
  if (!toRequestProfile) {
    throw new AppError(404, 'Target user profile not found.');
  }

  // Check for existing request
  const existingRequest = await LeadContactRequest.findOne({
    leadId: new Types.ObjectId(leadId),
    requestedId: requestedProfile._id,
    toRequestId: toRequestProfile._id,
  });

  if (existingRequest) {
    throw new AppError(409, 'Request already exists for this lead.');
  }

  // Create request
  const newRequest = await LeadContactRequest.create({
    leadId: new Types.ObjectId(leadId),
    requestedId: requestedProfile._id,
    toRequestId: toRequestProfile._id,
    message: message?.trim() || null,
    status: 'unread', // Default for new requests
    createdAt: new Date(),
  });

  return newRequest;
};




export const getLeadContactRequestsForUser = async (userId: string) => {

  const toUser = await UserProfile.findOne({ user: userId }).select('_id');

  return LeadContactRequest.find({ toRequestId: toUser?._id })
    .populate({
      path: 'leadId',
      populate: "userProfileId"
    })
    .populate('requestedId')
    .populate('toRequestId')
    .sort({ createdAt: -1 });
};

export const getSingleLeadContactRequestsForUser = async (leadRequestId: string) => {
  return LeadContactRequest.findById(leadRequestId)
    .populate({
      path: 'leadId',
      populate: [
      { path: 'userProfileId' },
      { path: 'serviceId' }
    ]

    })
    .populate('requestedId')
    .populate('toRequestId')
    .sort({ createdAt: -1 });
};

export const updateLeadContactRequestStatus = async (
  requestId: string,
  status: 'read' | 'unread' | 'deleted'
) => {
  return LeadContactRequest.findByIdAndUpdate(
    requestId,
    { status },
    { new: true }
  );
};





export const commonService = {
  createLawyerResponseAndSpendCredit,
  getChatHistoryFromDB,
  getLawyerSuggestionsFromDB,
  updateLeadContactRequestStatus,
  createLeadContactRequest,
  getLeadContactRequestsForUser,
  getSingleLeadContactRequestsForUser

};
