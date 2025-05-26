import { Types } from 'mongoose';
import { validateObjectId } from '../../../utils/validateObjectId';
import Option from '../../Service/Option/models/option.model';
import ServiceWiseQuestion from '../../Service/Question/models/ServiceWiseQuestion.model';

const getSingleServiceWiseQuestionFromDB = async (
  serviceId: string,
  countryId: string,
) => {
  validateObjectId(serviceId, 'Service');
  validateObjectId(countryId, 'Country');
  const serviceObjectId = new Types.ObjectId(serviceId);
  const countryObjectId = new Types.ObjectId(countryId);

  // const result = await ServiceWiseQuestion.aggregate([
  //   {
  //     $match: {
  //       serviceId: serviceObjectId,
  //       countryId: countryObjectId,
  //       deletedAt: null,
  //     },
  //   },
  //   {
  //     $sort: { order: 1 },
  //   },
  //   {
  //     $lookup: {
  //       from: 'options',
  //       localField: '_id',
  //       foreignField: 'questionId',
  //       as: 'options',
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'countries',
  //       localField: 'countryId',
  //       foreignField: '_id',
  //       as: 'countryId',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$countryId',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'services',
  //       localField: 'serviceId',
  //       foreignField: '_id',
  //       as: 'serviceId',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$serviceId',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $project: {
  //       question: 1,
  //       questionType: 1,
  //       order: 1,

  //       countryId: {
  //         _id: 1,
  //         name: 1,
  //         slug: 1,
  //         serviceIds: 1,
  //       },
  //       serviceId: {
  //         _id: 1,
  //         name: 1,
  //         slug: 1,
  //       },

  //       options: {
  //         _id: 1,
  //         name: 1,
  //         slug: 1,
  //         selected_options: 1,
  //       },
  //     },

  //   },
  // ]);

  // return result;

  const result = await ServiceWiseQuestion.aggregate([
    {
      $match: {
        serviceId: serviceObjectId,
        countryId: countryObjectId,
        deletedAt: null,
      },
    },
    {
      $sort: { order: 1 },
    },
    {
      $lookup: {
        from: 'options',
        localField: '_id',
        foreignField: 'questionId',
        as: 'options',
      },
    },
    {
      $unwind: {
        path: '$options',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'options',
        localField: 'options.selected_options',
        foreignField: '_id',
        as: 'options.selected_options',
      },
    },
    {
      $group: {
        _id: '$_id',
        question: { $first: '$question' },
        slug: { $first: '$slug' },
        questionType: { $first: '$questionType' },
        order: { $first: '$order' },
        countryId: { $first: '$countryId' },
        serviceId: { $first: '$serviceId' },
        options: { $push: '$options' }, // re-group options with populated selected_options
      },
    },
    {
      $sort: { order: 1 },
    },
    {
      $lookup: {
        from: 'countries',
        localField: 'countryId',
        foreignField: '_id',
        as: 'countryId',
      },
    },
    {
      $unwind: {
        path: '$countryId',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'services',
        localField: 'serviceId',
        foreignField: '_id',
        as: 'serviceId',
      },
    },
    {
      $unwind: {
        path: '$serviceId',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        question: 1,
        questionType: 1,
        slug: 1,
        order: 1,
        countryId: {
          _id: 1,
          name: 1,
          slug: 1,
          serviceIds: 1,
        },
        serviceId: {
          _id: 1,
          name: 1,
          slug: 1,
        },
        options: {
          _id: 1,
          name: 1,
          slug: 1,
          selected_options: 1, // populated
        },
      },
    },
  ]);

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
