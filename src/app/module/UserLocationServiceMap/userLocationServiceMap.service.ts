import mongoose from 'mongoose';


import { UserLocationServiceMap } from './UserLocationServiceMap.model';
import UserProfile from '../User/user.model';
import { IUserLocationServiceMap } from './userLocationServiceMap.interface';
import { deleteCache, removeLeadListCacheByUser } from '../../utils/cacheManger';
import { CacheKeys } from '../../config/cacheKeys';

/**
 * Create a new user location service map
 */
const createUserLocationServiceMap = async (
  userId: string,
  payload: Partial<IUserLocationServiceMap>
) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');

  if (!userProfile) {
    throw new Error('User profile not found');
  }
  const doc = await UserLocationServiceMap.create({ ...payload, userProfileId: userProfile._id });


  // -------------------  REVALIDATE REDIS CACHE ---------------------
  await deleteCache([
    CacheKeys.USER_INFO(userId.toString()),
    CacheKeys.LEAD_SERVICES_QUESTIONS(userId)
  ]
  );

  await removeLeadListCacheByUser(userId.toString());


  return doc;
};

/**
 * Get all maps for a user
 */
const getAllUserLocationServiceMaps = async (userId: string | undefined) => {

  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');

  if (!userProfile) {
    throw new Error('User profile not found');
  }

  const docs = await UserLocationServiceMap.find({ userProfileId: userProfile._id }).populate('serviceIds locationGroupId');
  return docs;
};

/**
 * Get single map by ID
 */
const getUserLocationServiceMapById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await UserLocationServiceMap.findById(id).populate('serviceIds locationGroupId');
  return doc;
};

/**
 * Update map by ID
 */
const updateUserLocationServiceMapById = async (
  userId: string,
  id: string,
  payload: Partial<IUserLocationServiceMap>
) => {


  if (!mongoose.Types.ObjectId.isValid(id)) return null;


  const doc = await UserLocationServiceMap.findByIdAndUpdate(id, payload, { new: true });


  // -------------------  REVALIDATE REDIS CACHE ---------------------
  await deleteCache([
    CacheKeys.USER_INFO(userId.toString()),
    CacheKeys.LEAD_SERVICES_QUESTIONS(userId)
  ]
  );

  await removeLeadListCacheByUser(userId.toString());

  return doc;
};

/**
 * Delete map by ID
 */
const deleteUserLocationServiceMapById = async (userId: string, id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await UserLocationServiceMap.findByIdAndDelete(id);

  // -------------------  REVALIDATE REDIS CACHE ---------------------
  await deleteCache([
    CacheKeys.USER_INFO(userId.toString()),
    CacheKeys.LEAD_SERVICES_QUESTIONS(userId)
  ]
  );

  await removeLeadListCacheByUser(userId.toString());



  return doc;
};



export const userLocationServiceMapService = {
  createMap: createUserLocationServiceMap,
  getAllMaps: getAllUserLocationServiceMaps,
  getMap: getUserLocationServiceMapById,
  updateMap: updateUserLocationServiceMapById,
  deleteMap: deleteUserLocationServiceMapById,
};
