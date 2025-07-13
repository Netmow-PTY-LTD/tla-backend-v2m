
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  message: String,
  type: { type: String, enum: ['lead', 'response', 'credit', 'admin-message'] }, // Custom types
  link: String, // Optional - page to open
  isRead: { type: Boolean, default: false },
 
},{
    timestamps:true
});



export const Notification = mongoose.model('Notification', notificationSchema);
