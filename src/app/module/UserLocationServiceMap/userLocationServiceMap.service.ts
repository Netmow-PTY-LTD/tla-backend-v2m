import mongoose from 'mongoose';

import { IUserLocationServiceMap } from '../LeadSettings/leadService.interface';
import { UserLocationServiceMap } from './UserLocationServiceMap.model';
import User from '../Auth/auth.model';
import UserProfile from '../User/user.model';

/**
 * Create a new user location service map
 */
export const createUserLocationServiceMap = async (
    userId: string | undefined,
  payload: Partial<IUserLocationServiceMap>
) => {
     const userProfile= await UserProfile.findOne({ userId: userId }).select('_id');

    if(!userProfile) {
        throw new Error('User profile not found');
    }
  const doc = await UserLocationServiceMap.create({ ...payload, userProfileId: userProfile._id });
  return doc;
};

/**
 * Get all maps for a user
 */
export const getAllUserLocationServiceMaps = async (userId: string | undefined) => {

    const userProfile= await UserProfile.findOne({ userId: userId }).select('_id');

    if(!userProfile) {
        throw new Error('User profile not found');
    }

  const docs = await UserLocationServiceMap.find({ userProfileId: userProfile._id }).populate('serviceIds locationGroupId');
  return docs;
};

/**
 * Get single map by ID
 */
export const getUserLocationServiceMapById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await UserLocationServiceMap.findById(id).populate('serviceIds locationGroupId');
  return doc;
};

/**
 * Update map by ID
 */
export const updateUserLocationServiceMapById = async (
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
export const deleteUserLocationServiceMapById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await UserLocationServiceMap.findByIdAndDelete(id);
  return doc;
};
