import mongoose from 'mongoose';
import { validateObjectId } from '../../../utils/validateObjectId';

import { ILead } from '../interfaces/lead.interface';
import Lead from '../models/lead.model';
import { LeadServiceAnswer } from '../models/leadServiceAnswer.model';

const CreateLeadIntoDB = async (payload: ILead) => {
  const lead = await Lead.create(payload);
  return lead;
};

const getAllLeadFromDB = async () => {
  const countries = await Lead.find({ deletedAt: null })
    .populate('userProfileId')
    .populate('serviceId');
  return countries;
};

const getSingleLeadFromDB = async (leadId: string) => {
  validateObjectId(leadId, 'Lead');
  const leadDoc = await Lead.findOne({ _id: leadId, deletedAt: null })
    .populate({
      path: 'userProfileId',
      populate: {
        path: 'user',
        select: 'email ',
      },
    })
    .populate({
      path: 'serviceId',
      select: 'name slug',
    });
  if (!leadDoc) return null;
  // Fetch lead answers with options and questions
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

    // Sort first by question.order then by option.order
    {
      $sort: {
        'question.order': 1,
        'option.order': 1,
      },
    },

    {
      $group: {
        _id: '$question._id',
        questionId: { $first: '$question._id' },
        questionText: { $first: '$question.question' },
        questionOrder: { $first: '$question.order' },
        options: {
          $push: {
            optionId: '$option._id',
            optionText: '$option.name',
            isSelected: '$isSelected',
            idExtraData: '$idExtraData',
            optionOrder: '$option.order',
          },
        },
      },
    },

    // Sort again to guarantee order after grouping
    {
      $sort: { questionOrder: 1 },
    },

    {
      $project: {
        _id: 0,
        questionId: 1,
        question: '$questionText',
        options: {
          $map: {
            input: {
              $sortArray: {
                input: '$options',
                sortBy: { optionOrder: 1 },
              },
            },
            as: 'opt',
            in: {
              optionId: '$$opt.optionId',
              optionText: '$$opt.optionText',
              isSelected: '$$opt.isSelected',
              idExtraData: '$$opt.idExtraData',
            },
          },
        },
      },
    },
  ]);

  const lead = leadDoc.toObject();
  // Attach answers
  lead.leadAnswers = leadAnswers;

  return lead;
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
};
