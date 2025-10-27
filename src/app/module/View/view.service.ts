import { Types } from 'mongoose';
import { validateObjectId } from '../../utils/validateObjectId';
import Option from '../Option/option.model';
import ServiceWiseQuestion from '../Question/question.model';
import User from '../Auth/auth.model';
import { IUser } from '../Auth/auth.interface';
import { IUserProfile } from '../User/user.interface';
import Experience from '../User/experience.model';
import Faq from '../User/faq.model';
import UserProfile from '../User/user.model';
import ProfilePhotos from '../User/profilePhotos';
import ProfileSocialMedia from '../User/profileSocialMedia';
import ProfileCustomService from '../User/profileServiceCoustom.model';
import { calculateLawyerBadge } from '../User/user.utils';
import { FirmProfile } from '../../firmModule/Firm/firm.model';
import { redisClient } from '../../config/redis';



const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const getSingleServiceWiseQuestionFromDB = async (
  serviceId: string,
  countryId: string,
) => {
  validateObjectId(serviceId, 'Service');
  validateObjectId(countryId, 'Country');
  const serviceObjectId = new Types.ObjectId(serviceId);
  const countryObjectId = new Types.ObjectId(countryId);


  // Create a deterministic cache key
  const cacheKey = `serviceWiseQuestion:${serviceId}:${countryId}`;

  //  Check Redis cache first
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log(' Returning cached ServiceWiseQuestion');
    return JSON.parse(cachedData);
  }



  const result = await ServiceWiseQuestion.aggregate([
    {
      $match: {
        serviceId: serviceObjectId,
        countryId: countryObjectId,

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


  await redisClient.set(cacheKey, JSON.stringify(result), { EX: CACHE_TTL_SECONDS });
  console.log(' Cached ServiceWiseQuestion for 24 hours');







  return result;
};








const getQuestionWiseOptionsFromDB = async (questionId: string) => {
  validateObjectId(questionId, 'Question');
  const result = await Option.find({
    questionId: questionId,

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
        'name bio address profilePicture profileType autoTopUp credits serviceIds country phone slug',
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

  // Map to public profile format
  const publicProfiles = users
    .filter((user) => user.profile)
    .map((user) => {
      const profile = user.profile!;
      const name = profile.name || '';
      const slug = profile.slug || '';
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
        profileType: profile.profileType || '',
        autoTopUp: profile.autoTopUp || false,
        credits: profile?.credits || 0,
        country: country?.name,
        services: serviceIds.map((service) => service.name || ''),
        phone: profile.phone || '',
      };
    });

  return publicProfiles;
};

const getPublicUserProfileById = async (userId: string) => {
  // Fetch a single user by ID, including populated profile → serviceIds + country
  const rawUser = await User.findOne({
    _id: userId,
    deletedAt: null,
  })
    .select('email profile')
    .populate({
      path: 'profile',
      match: { deletedAt: null },
      select:
        'name bio address profilePicture profileType autoTopUp credits serviceIds country phone slug',
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

  });
  const faq = await Faq.find({
    userProfileId: user.profile._id,

  });

  const photosVideos = await ProfilePhotos.findOne({
    userProfileId: user.profile._id,
  }).select('-_id photos videos');
  const socialMedia = await ProfileSocialMedia.findOne({
    userProfileId: user.profile._id,
  });

  const name = user.profile.name || '';
  const slug = user.profile.slug || '';

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
    profileType: user.profile.profileType || '',
    autoTopUp: user.profile.autoTopUp || false,
    credits: user.profile.credits || 0,
    country: country?.name || '',
    services: serviceIds?.map((service) => service.name || ''),
    experience: experience,
    faq: faq,
    phone: user.profile.phone || '',
    photosVideos: photosVideos || {},
    socialMedia: socialMedia || {},
  };
};

const getPublicUserProfileBySlug = async (slug: string) => {
  // Step 1: Find profile by slug
  const profile = await UserProfile.findOne({
    slug,
    deletedAt: null,
  }).select('_id');

  if (!profile) return null;

  // Step 2: Find the user using the profile ID
  const rawUser = await User.findOne({
    profile: profile._id,
    deletedAt: null,
  })
    .select('email profile')
    .populate({
      path: 'profile',
      match: { deletedAt: null },
      select:
        'name slug bio address profilePicture profileType autoTopUp credits serviceIds country phone designation languages  law_society_member_number practising_certificate_number ',
      populate: [
        { path: 'serviceIds', select: 'name slug' },
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

  });

  const faq = await Faq.find({
    userProfileId: user.profile._id,

  });
  const photosVideos = await ProfilePhotos.findOne({
    userProfileId: user.profile._id,
  }).select('-_id photos videos');
  const socialMedia = await ProfileSocialMedia.findOne({
    userProfileId: user.profile._id,
  });

  const customService = await ProfileCustomService.find({
    userProfileId: user.profile._id,
  });

  const badge = await calculateLawyerBadge(rawUser?._id);

  const name = user.profile.name || '';
  const slugResult = user.profile.slug || '';
  const country = user.profile.country as { name: string } | undefined;
  const serviceIds =
    (user?.profile?.serviceIds as { name: string }[] | undefined) || [];

  return {
    userId: rawUser?._id,
    email: user.email,
    name,
    slug: slugResult,
    designation: user.profile.designation || '',
    bio: user.profile.bio || '',
    address: user.profile.address || '',
    profilePicture: user.profile.profilePicture || '',
    profileType: user.profile.profileType || '',
    autoTopUp: user.profile.autoTopUp || false,
    credits: user.profile.credits || 0,
    country: country?.name || '',
    services: serviceIds?.map((service) => service.name || ''),
    experience,
    faq,
    phone: user.profile.phone || '',
    photosVideos: photosVideos || {},
    socialMedia: socialMedia || {},
    customService: customService,
    badge,
    languages: user.profile.languages,
    law_society_member_number: user.profile.law_society_member_number,
    practising_certificate_number: user.profile.practising_certificate_number
  };
};


// company profile list
interface CompanyProfileQuery {
  page?: number;
  limit?: number;
  search?: string;
  countryId?: string;
  ZipCodeId?: string;
  cityId?: string;
}

const getAllPublicCompanyProfilesIntoDB = async (query: CompanyProfileQuery) => {
  const { page = 1, limit = 10, search, countryId, ZipCodeId, cityId } = query;

  const filter: Record<string, any> = { status: 'approved', deletedAt: null };

  if (countryId) filter["contactInfo.country"] = countryId;
  if (cityId) filter["contactInfo.city"] = cityId;
  if (ZipCodeId) filter["contactInfo.zipCode"] = ZipCodeId;
  if (search) filter.firmName = { $regex: search.trim(), $options: "i" };

  const skip = (page - 1) * limit;

  const companiesQuery = FirmProfile.find(filter)
    .populate([
      { path: "contactInfo.country", select: "name" },
      { path: "contactInfo.city", select: "name region" },
      { path: "contactInfo.zipCode", select: "zipcode postalCode" },

    ]).select('firmName logo contactInfo companySize')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const [companies, total] = await Promise.all([
    companiesQuery,
    FirmProfile.countDocuments(filter),
  ]);

  return {
    data: companies,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};


export const viewService = {
  getSingleServiceWiseQuestionFromDB,
  getQuestionWiseOptionsFromDB,
  getAllPublicUserProfilesIntoDB,
  getPublicUserProfileById,
  getPublicUserProfileBySlug,
  getAllPublicCompanyProfilesIntoDB,
};


