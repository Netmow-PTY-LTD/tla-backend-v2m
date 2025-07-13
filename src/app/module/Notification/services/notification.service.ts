import { sendNotFoundResponse } from '../../../errors/custom.error';
import UserProfile from '../../User/models/user.model';
import { INotificationPreference } from '../interfaces/notification.interface';
import { Notification } from '../models/notification.model';
import NotificationPreference from '../models/notificationPreference.model';


const browserNotificationUpdateIntoDB = async (
  userProfileId: string,
  browserPreferences: Partial<INotificationPreference['browserPreferences']>,
) => {
  const userProfile = await UserProfile.findOne({ user: userProfileId }).select(
    '_id',
  );
  if (!userProfile) sendNotFoundResponse('User profile not found');
  const updatedPreferences = await NotificationPreference.findOneAndUpdate(
    { userProfileId: userProfile?._id },
    { $set: { browserPreferences: browserPreferences } },
    { new: true, upsert: true },
  );

  return updatedPreferences;
};

const emailNotificationUpdateIntoDB = async (
  userProfileId: string,
  emailPreferences: Partial<INotificationPreference['emailPreferences']>,
) => {
  const userProfile = await UserProfile.findOne({ user: userProfileId }).select(
    '_id',
  );
  if (!userProfile) sendNotFoundResponse('User profile not found');

  const updatedPreferences = await NotificationPreference.findOneAndUpdate(
    { userProfileId: userProfile?._id },
    { $set: { emailPreferences: emailPreferences } },
    { new: true, upsert: true },
  );

  return updatedPreferences;
};

const getAllNotificationPreferenceFromDB = async (userProfileId: string) => {
  const userProfile = await UserProfile.findOne({ user: userProfileId }).select(
    '_id',
  );
  if (!userProfile) sendNotFoundResponse('User profile not found');

  const updatedPreferences = await NotificationPreference.findOne({
    userProfileId: userProfile?._id,
  });

  return updatedPreferences;
};

const markNotificationAsReadFromDB = async (notificationId: string) => {

  const result = await Notification.findByIdAndUpdate(notificationId, { isRead: true });

  return result;
};

const getUserNotificationsFromDB = async (userId: string,isRead:boolean) => {

 
  const notifications = await Notification.find({ userId, isRead }).sort({ createdAt: -1 }).limit(50);

  return notifications;
};

export const notificationService = {
  browserNotificationUpdateIntoDB,
  emailNotificationUpdateIntoDB,
  getAllNotificationPreferenceFromDB,
  markNotificationAsReadFromDB,
  getUserNotificationsFromDB
};
