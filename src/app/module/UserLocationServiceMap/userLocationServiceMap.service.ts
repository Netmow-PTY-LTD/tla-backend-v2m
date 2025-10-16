import mongoose from 'mongoose';


import { UserLocationServiceMap } from './UserLocationServiceMap.model';
import User from '../Auth/auth.model';
import UserProfile from '../User/user.model';
import { IUserLocationServiceMap } from './userLocationServiceMap.interface';

/**
 * Create a new user location service map
 */
 const createUserLocationServiceMap = async (
    userId: string | undefined,
  payload: Partial<IUserLocationServiceMap>
) => {
     const userProfile= await UserProfile.findOne({ user: userId }).select('_id');

    if(!userProfile) {
        throw new Error('User profile not found');
    }
  const doc = await UserLocationServiceMap.create({ ...payload, userProfileId: userProfile._id });
  return doc;
};

/**
 * Get all maps for a user
 */
 const getAllUserLocationServiceMaps = async (userId: string | undefined) => {

    const userProfile= await UserProfile.findOne({ user: userId }).select('_id');

    if(!userProfile) {
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
  id: string,
  payload: Partial<IUserLocationServiceMap>
) => {


  if (!mongoose.Types.ObjectId.isValid(id)) return null;


  const doc = await UserLocationServiceMap.findByIdAndUpdate(id, payload, { new: true });
  return doc;
};

/**
 * Delete map by ID
 */
 const deleteUserLocationServiceMapById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await UserLocationServiceMap.findByIdAndDelete(id);
  return doc;
};



export const userLocationServiceMapService = {
  createMap: createUserLocationServiceMap,
  getAllMaps: getAllUserLocationServiceMaps,
  getMap: getUserLocationServiceMapById,
  updateMap: updateUserLocationServiceMapById,
  deleteMap: deleteUserLocationServiceMapById,
};
