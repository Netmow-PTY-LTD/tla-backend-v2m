
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  message: String,
  module: {
    type: String,
    enum: ['lead', 'response', 'payment', 'admin', 'credit', 'system', 'admin-message'],
    required: true,
  },
  type: {
    type: String,
    enum: [
      'login',
      'update',
      'delete',
      'create',
      'other',
      'schedule',
      'sendsms',
      'contact',
      'sendemail',
      'whatsapp',
      'pending',
      'archive',
      'hired',
      'credit_spent',
      'sendestimate',
      // Added common types for your notification use cases
      'failed_email',
      'failed_sms',
      'new_lead',
      'response_sent',
      'payment_failed',
      'credit_low',
      'admin_alert',
      'sms_received',
      'sms_pending',
    ],
    required: true,
  }, // Custom types
  link: String, // Optional - page to open
  isRead: { type: Boolean, default: false },

}, {
  timestamps: true
});



export const Notification = mongoose.model('Notification', notificationSchema);
