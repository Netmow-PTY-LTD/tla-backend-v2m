// // services/notificationService.js
// // const NotificationPreference = require('../models/NotificationPreferences');
// // const webpush = require('web-push'); // For browser push notifications

// class NotificationService {
//   constructor() {
//     // Initialize web push with VAPID keys
//     webpush.setVapidDetails(
//       'mailto:your@email.com',
//       process.env.VAPID_PUBLIC_KEY,
//       process.env.VAPID_PRIVATE_KEY,
//     );
//   }

//   async sendBrowserNotification(
//     userId: any,
//     subscription: any,
//     notificationType: any,
//     content: any,
//   ) {
//     try {
//       const preferences = await NotificationPreference.findOne({ userId });

//       if (!preferences || !preferences.browserPreferences[notificationType]) {
//         return false;
//       }

//       const payload = JSON.stringify({
//         title: this.getNotificationTitle(notificationType),
//         body: content.message,
//         icon: '/notification-icon.png',
//       });

//       await webpush.sendNotification(subscription, payload);
//       return true;
//     } catch (err) {
//       console.error('Error sending notification:', err);
//       return false;
//     }
//   }

//   getNotificationTitle(type:string) {
//     const titles = {
//       newTasks: 'New Task Available',
//       customerMessages: 'New Message Received',
//       newReviews: 'New Review Posted',
//     };
//     return titles[type] || 'New Notification';
//   }

//   // Specific notification methods
//   async notifyNewTask(userId, subscription, taskDetails) {
//     return this.sendBrowserNotification(userId, subscription, 'newTasks', {
//       message: `New task: ${taskDetails.title}`,
//     });
//   }

//   // Add similar methods for other notification types
// }

// module.exports = new NotificationService();

// // services/emailService.js
// const NotificationPreference = require('../models/NotificationPreferences');

// class EmailService {
//   constructor() {
//     // Initialize your email provider here (Nodemailer, SendGrid, etc.)
//   }

//   async sendEmailBasedOnPreference(userId, emailType, content) {
//     try {
//       const preferences = await NotificationPreference.findOne({ userId });

//       if (!preferences) return false;

//       const shouldSend = preferences.preferences[emailType];

//       if (shouldSend) {
//         // Implement your email sending logic here
//         // this.sendEmail(content);
//         return true;
//       }

//       return false;
//     } catch (err) {
//       console.error(err);
//       return false;
//     }
//   }

//   // Example method for sending a specific type of notification
//   async notifyNewLead(userId, leadDetails) {
//     return this.sendEmailBasedOnPreference(userId, 'newLeads', {
//       subject: 'New Lead Available',
//       text: `You have a new lead: ${leadDetails.name}`,
//     });
//   }

//   // Add similar methods for other notification types
// }

// module.exports = new EmailService();
