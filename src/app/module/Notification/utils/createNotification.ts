import { Types } from "mongoose";
import { Notification } from "../models/notification.model";

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  link,
}: {
  userId: string|Types.ObjectId;
  title: string;
  message: string;
  type: string;
  link?: string;
}) => {
  await Notification.create({ userId, title, message, type, link });
};
