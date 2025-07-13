import { Notification } from "../models/notification.model";

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  link,
}: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}) => {
  await Notification.create({ userId, title, message, type, link });
};
