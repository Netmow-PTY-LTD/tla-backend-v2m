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

    // Group by question and push only selected options
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

    // Filter out nulls from options (non-selected)
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

    // Sort grouped options inside each question by order
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

    // Remove "order" from individual option output if not needed
    {
      $project: {
        questionId: 1,
        question: 1,
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

    // Final question-level sort (optional but keeps order clean)
    {
      $sort: { order: 1 },
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
