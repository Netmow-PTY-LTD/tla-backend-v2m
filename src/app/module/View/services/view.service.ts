import { Types } from 'mongoose';
import { validateObjectId } from '../../../utils/validateObjectId';
import Option from '../../Option/models/option.model';
import ServiceWiseQuestion from '../../Question/models/ServiceWiseQuestion.model';
import User from '../../Auth/models/auth.model';
import { IUser } from '../../Auth/interfaces/auth.interface';
import { IUserProfile } from '../../User/interfaces/user.interface';
import Experience from '../../User/models/experience.model';

const getSingleServiceWiseQuestionFromDB = async (
  serviceId: string,
  countryId: string,
) => {
  validateObjectId(serviceId, 'Service');
  validateObjectId(countryId, 'Country');
  const serviceObjectId = new Types.ObjectId(serviceId);
  const countryObjectId = new Types.ObjectId(countryId);

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

const getAllPublicUserProfilesIntoDB = async () => {
  // Fetch users with profile populated, and inside profile populate serviceIds and country with their names
  const rawUsers = await User.find({ deletedAt: null, role: 'user' })
    .select('email profile')
    .populate({
      path: 'profile',
      match: { deletedAt: null },
      select:
        'name bio address profilePicture activeProfile autoTopUp credits serviceIds country',
      populate: [
        { path: 'serviceIds', select: 'name' },
        { path: 'country', select: 'name' },
      ],
    })
    .lean();

  // Type override
  const users = rawUsers as unknown as (Omit<IUser, 'profile'> & {
    email: string;
    profile: IUserProfile | null;
  })[];
  // Helper function to generate slugs
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Set to keep track of used slugs to ensure uniqueness
  const seenSlugs = new Set<string>();
  const getUniqueSlug = (base: string) => {
    let slug = base;
    let counter = 1;
    while (seenSlugs.has(slug)) {
      slug = `${base}-${counter}`;
      counter++;
    }
    seenSlugs.add(slug);
    return slug;
  };

  // Map to public profile format
  const publicProfiles = users
    .filter((user) => user.profile)
    .map((user) => {
      const profile = user.profile!;
      const name = profile.name || '';
      const slug = getUniqueSlug(generateSlug(name));
      const country = profile.country as { name: string } | undefined;
      const serviceIds =
        (profile.serviceIds as { name: string }[] | undefined) || [];
      return {
        email: user.email,
        name,
        slug,
        bio: profile.bio || '',
        address: profile.address || '',
        profilePicture: profile.profilePicture || '',
        activeProfile: profile.activeProfile || '',
        autoTopUp: profile.autoTopUp || false,
        credits: profile?.credits || 0,
        country: country?.name,
        services: serviceIds.map((service) => service.name || ''),
      };
    });

  return publicProfiles;
};

const getPublicUserProfileById = async (userId: string) => {
  // Fetch a single user by ID, including populated profile → serviceIds + country
  const rawUser = await User.findOne({
    _id: userId,
    deletedAt: null,
    role: 'user',
  })
    .select('email profile')
    .populate({
      path: 'profile',
      match: { deletedAt: null },
      select:
        'name bio address profilePicture activeProfile autoTopUp credits serviceIds country',
      populate: [
        { path: 'serviceIds', select: 'name' },
        { path: 'country', select: 'name' },
      ],
    })
    .lean();

  if (!rawUser || !rawUser.profile) return null;

  // Type override
  const user = rawUser as unknown as Omit<IUser, 'profile'> & {
    email: string;
    profile: IUserProfile;
  };

  const experience = await Experience.findOne({
    userProfileId: user.profile._id,
    deletedAt: null,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const name = user.profile.name || '';
  const slug = generateSlug(name);

  const country = user.profile.country as { name: string } | undefined;
  const serviceIds =
    (user?.profile?.serviceIds as { name: string }[] | undefined) || [];

  return {
    email: user.email,
    name,
    slug,
    bio: user.profile.bio || '',
    address: user.profile.address || '',
    profilePicture: user.profile.profilePicture || '',
    activeProfile: user.profile.activeProfile || '',
    autoTopUp: user.profile.autoTopUp || false,
    credits: user.profile.credits || 0,
    country: country?.name || '',
    services: serviceIds?.map((service) => service.name || ''),
    experience: experience,
  };
};

export const viewService = {
  getSingleServiceWiseQuestionFromDB,
  getQuestionWiseOptionsFromDB,
  getAllPublicUserProfilesIntoDB,
  getPublicUserProfileById,
};
