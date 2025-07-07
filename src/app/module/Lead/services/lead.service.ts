/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { validateObjectId } from '../../../utils/validateObjectId';

import { ILead } from '../interfaces/lead.interface';
import Lead from '../models/lead.model';
import { LeadServiceAnswer } from '../models/leadServiceAnswer.model';
import UserProfile from '../../User/models/user.model';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import CountryWiseServiceWiseField from '../../CountryWiseMap/models/countryWiseServiceWiseFields.model';
import { customCreditLogic } from '../utils/customCreditLogic';

import { calculateLawyerBadge } from '../../User/utils/getBadgeStatus';


const CreateLeadIntoDB = async (userId: string, payload: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userProfile = await UserProfile.findOne({ user: userId })
      .select('_id')
      .session(session);

    if (!userProfile) {
      await session.abortTransaction();
      session.endSession();
      return sendNotFoundResponse('User profile not found');
    }

    const { questions, serviceId, additionalDetails, budgetAmount, locationId } = payload;

    const [leadUser] = await Lead.create(
      [
        {
          userProfileId: userProfile._id,
          serviceId,
          additionalDetails,
          budgetAmount,
          locationId
        },
      ],
      { session },
    );

    const leadDocs: any[] = [];

    for (const q of questions) {
      const questionId = q.questionId;
      for (const opt of q.checkedOptionsDetails) {
        leadDocs.push({
          leadId: leadUser._id,
          serviceId,
          questionId,
          optionId: opt.id,
          isSelected: opt.is_checked,
          idExtraData: opt.idExtraData || '',
        });
      }
    }

    if (leadDocs.length > 0) {
      await LeadServiceAnswer.insertMany(leadDocs, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return leadUser;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating lead with transaction:', error);
    throw error;
  }
};

const getAllLeadFromDB = async () => {
  try {
    const pipeline = [
      // Stage 1: Filter active leads
      { $match: { deletedAt: null } },

      // Stage 2: Lookup userProfile data (replaces populate)
      {
        $lookup: {
          from: 'userprofiles',
          localField: 'userProfileId',
          foreignField: '_id',
          as: 'userProfileData',
        },
      },
      { $unwind: '$userProfileData' },

      // Stage 3: Lookup service data (replaces populate)
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'serviceData',
        },
      },
      { $unwind: '$serviceData' },

      // Stage 4: Lookup credit information
      {
        $lookup: {
          from: 'countrywiseservicewisefields',
          let: {
            countryId: '$userProfileData.country',
            serviceId: '$serviceId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$countryId', '$$countryId'] },
                    { $eq: ['$serviceId', '$$serviceId'] },
                    { $eq: ['$deletedAt', null] },
                  ],
                },
              },
            },
          ],
          as: 'creditInfo',
        },
      },

      // Stage 5: Shape the output to match your original format
      {
        $project: {
          _id: 1,
          userProfileId: {
            _id: '$userProfileData._id',
            user: '$userProfileData.user',
            name: '$userProfileData.name',
            activeProfile: '$userProfileData.activeProfile',
            country: '$userProfileData.country',
            deletedAt: '$userProfileData.deletedAt',
            credits: '$userProfileData.credits',
            paymentMethods: '$userProfileData.paymentMethods',
            autoTopUp: '$userProfileData.autoTopUp',
            serviceIds: '$userProfileData.serviceIds',
            createdAt: '$userProfileData.createdAt',
            updatedAt: '$userProfileData.updatedAt',
            address: '$userProfileData.address',
            bio: '$userProfileData.bio',
            phone: '$userProfileData.phone',
            profilePicture: '$userProfileData.profilePicture',
          },
          serviceId: {
            _id: '$serviceData._id',
            name: '$serviceData.name',
            slug: '$serviceData.slug',
            deletedAt: '$serviceData.deletedAt',
            createdAt: '$serviceData.createdAt',
            updatedAt: '$serviceData.updatedAt',
          },
          additionalDetails: 1,
          deletedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          credit: {
            $ifNull: [{ $arrayElemAt: ['$creditInfo.baseCredit', 0] }, 0],
          },
          creditSource: {
            $cond: {
              if: { $gt: [{ $size: '$creditInfo' }, 0] },
              then: 'CountryServiceField',
              else: 'Default',
            },
          },
        },
      },
    ];

    const result = await Lead.aggregate(pipeline);

    // const combineCredit = await Promise.all(
    //   result.map(async (lead) => {
    //     const plainLead = lead.toObject ? lead.toObject() : lead; // <- Fix

    //     const badges = plainLead?.userProfileId?.user
    //       ? await getLawyerBadges(plainLead.userProfileId.user)
    //       : null;

    //     return {
    //       ...plainLead,
    //       credit: customCreditLogic(plainLead.credit),
    //       badges,
    //     };
    //   })
    // );
    const combineCredit = await Promise.all(
      result.map(async (lead) => {
        const badges = lead?.userProfileId?.user
          ? await calculateLawyerBadge(lead.userProfileId.user)
          : null;

        return {
          ...lead,
          credit: customCreditLogic(lead.credit),
          badges,
        };
      })
    );


    return combineCredit;
  } catch (error) {
    console.error('Aggregation error:', error);
    throw error;
  }
};

const getMyAllLeadFromDB = async (userId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds');
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  const leads = await Lead.find({
    // userProfileId: userProfile?._id,
    deletedAt: null,
    serviceId: { $in: userProfile.serviceIds }, // match any of the IDs
  })
    .populate('userProfileId')
    .populate('serviceId');

  console.log('check match  leads')

  return leads;

};



const getSingleLeadFromDB = async (leadId: string) => {
  validateObjectId(leadId, 'Lead');

  const leadDoc = await Lead.findOne({ _id: leadId, deletedAt: null })
    .populate({
      path: 'userProfileId',
      populate: {
        path: 'user',
      },
    })
    .populate({
      path: 'serviceId',
    })
    .lean(); // Convert to plain JS object

  if (!leadDoc) return null;

  // 2. Fetch credit information in parallel
  const [creditInfo] = await Promise.all([
    CountryWiseServiceWiseField.findOne({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      countryId: (leadDoc.userProfileId as any).country,
      serviceId: leadDoc.serviceId._id,
      deletedAt: null,
    }).lean(),

    // Add other parallel queries here if needed
  ]);

  const leadAnswers = await LeadServiceAnswer.aggregate([
    {
      $match: {
        leadId: new mongoose.Types.ObjectId(leadId),
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionId',
        foreignField: '_id',
        as: 'question',
      },
    },
    { $unwind: '$question' },
    {
      $lookup: {
        from: 'options',
        localField: 'optionId',
        foreignField: '_id',
        as: 'option',
      },
    },
    { $unwind: '$option' },

    // Sort by question.order before grouping
    {
      $sort: {
        'question.order': 1,
      },
    },

    // Group by question and collect selected options
    {
      $group: {
        _id: '$question._id',
        questionId: { $first: '$question._id' },
        question: { $first: '$question.question' },
        order: { $first: '$question.order' },
        options: {
          $push: {
            $cond: [
              { $eq: ['$isSelected', true] },
              {
                optionId: '$option._id',
                option: '$option.name',
                isSelected: '$isSelected',
                idExtraData: '$idExtraData',
                order: '$option.order',
              },
              null,
            ],
          },
        },
      },
    },

    // Filter out non-selected (null) options
    {
      $project: {
        _id: 0,
        questionId: 1,
        question: 1,
        order: 1,
        options: {
          $filter: {
            input: '$options',
            as: 'opt',
            cond: { $ne: ['$$opt', null] },
          },
        },
      },
    },

    // Sort options inside each question by option.order
    {
      $addFields: {
        options: {
          $sortArray: {
            input: '$options',
            sortBy: { order: 1 },
          },
        },
      },
    },

    // Format final options and remove internal `order`
    {
      $project: {
        questionId: 1,
        question: 1,
        order: 1,
        options: {
          $map: {
            input: '$options',
            as: 'opt',
            in: {
              optionId: '$$opt.optionId',
              option: '$$opt.option',
              isSelected: '$$opt.isSelected',
              idExtraData: '$$opt.idExtraData',
            },
          },
        },
      },
    },

    // ✅ Final sort to ensure question order is preserved
    {
      $sort: {
        order: 1,
      },
    },

    // Optionally, remove order from final output
    {
      $project: {
        questionId: 1,
        question: 1,
        options: 1,
      },
    },
  ]);

  // ✅ 3. Calculate lawyer badge
  const lawyerUserId = (leadDoc.userProfileId as any)?.user?._id;
  const badges = lawyerUserId ? await calculateLawyerBadge(lawyerUserId) : null;

  // ✅ 4. Return final result
  return {
    ...leadDoc,
    badges,
    leadAnswers,
    credit: creditInfo?.baseCredit ?? 0,
    creditSource: creditInfo ? 'CountryServiceField' : 'Default',
  };


};

const updateLeadIntoDB = async (id: string, payload: Partial<ILead>) => {
  validateObjectId(id, 'Lead');
  const result = await Lead.findOneAndUpdate(
    { _id: id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteLeadFromDB = async (id: string) => {
  validateObjectId(id, 'Lead');
  const deletedAt = new Date().toISOString();

  const result = await Lead.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const leadService = {
  CreateLeadIntoDB,
  getAllLeadFromDB,
  getSingleLeadFromDB,
  updateLeadIntoDB,
  deleteLeadFromDB,
  getMyAllLeadFromDB,
};
