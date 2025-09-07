import { ClientSession, Types } from "mongoose";
import { Notification } from "./notification.model";



export const createNotification = async ({
  userId,
  toUser,
  title,
  message,
  module,
  type,
  link,
  session = null,
}: {
  userId: string | Types.ObjectId;
  toUser: string | Types.ObjectId;
  title: string;
  message: string;
  module:string;
  type: string;
  link?: string;
  session?: ClientSession | null;
}) => {
  try {
    await Notification.create(
      [
        {
          userId,
          toUser,
          title,
          message,
          module,
          type,
          link,
          createdAt: new Date(), // optional: explicit timestamp
        },
      ],
      session ? { session } : undefined
    );
  } catch (err) {
    console.error("Notification creation error:", err);
  }
};
