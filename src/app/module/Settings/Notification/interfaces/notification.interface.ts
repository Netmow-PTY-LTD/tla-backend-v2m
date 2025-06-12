import { Model, Types } from 'mongoose';

export interface INotificationPreference {
  userProfileId: Types.ObjectId;
  emailPreferences: {
    newLeads: boolean;
    closingLeadsRespondedTo: boolean;
    dismissingMyResponse: boolean;
    hiringMe: boolean;
    readingMyMessage: boolean;
    requestingCall: boolean;
    requestingContact: boolean;
    viewingProfile: boolean;
    viewingWebsite: boolean;
    dailyLeadsSummary: boolean;
    sendingMessage: boolean;
    newProfileReviews: boolean;
    newExternalReviews: boolean;
    similarServices: boolean;
  };
  browserPreferences: {
    newTasks: boolean;
    customerMessages: boolean;
    newReviews: boolean;
  };

  deletedAt: Date | null;
}

export interface INotificationPreferenceModel
  extends Model<INotificationPreference> {
  // eslint-disable-next-line no-unused-vars
  isNotificationPreferenceExists(id: string): Promise<boolean>;
}
