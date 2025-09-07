import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema({
  userProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true,
    unique: true,
  },
  emailPreferences: {
    newLeads: { type: Boolean, default: true },
    closingLeadsRespondedTo: { type: Boolean, default: true },
    dismissingMyResponse: { type: Boolean, default: true },
    hiringMe: { type: Boolean, default: true },
    readingMyMessage: { type: Boolean, default: true },
    requestingCall: { type: Boolean, default: true },
    requestingContact: { type: Boolean, default: true },
    viewingProfile: { type: Boolean, default: true },
    viewingWebsite: { type: Boolean, default: true },
    dailyLeadsSummary: { type: Boolean, default: true },
    sendingMessage: { type: Boolean, default: true },
    newProfileReviews: { type: Boolean, default: true },
    newExternalReviews: { type: Boolean, default: true },
    similarServices: { type: Boolean, default: true },
  },
  browserPreferences: {
    newTasks: { type: Boolean, default: true },
    customerMessages: { type: Boolean, default: true },
    newReviews: { type: Boolean, default: true },
  },
  // mobilePreferences: {
  //   // Could add mobile-specific preferences here
  // },
  
});

const NotificationPreference = mongoose.model(
  'NotificationPreference',
  notificationPreferenceSchema,
);

export default NotificationPreference;
