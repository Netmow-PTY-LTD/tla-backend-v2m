export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
  // SELLER: 'seller',
  // BUYER: 'buyer',
} as const;

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];


// constants/folderNames.ts

export const FOLDERS = {
  PROFILES: 'profiles',               // User avatars, profile pictures
  FIRMS: 'firms',                     // Law firm logos, certifications
  CERTIFICATIONS: 'certifications',   // Uploaded certification documents
  SERVICES: 'services',               // Service-related media (images, videos, brochures)
  MEDIA: 'media',                     // General media (e.g., banners)
  CONTRACTS: 'contracts',             // Contracts, legal agreements
  INVOICES: 'invoices',               // Invoice PDFs, receipts
  TEMP: 'temp',                       // Temporary uploads
  DOCUMENTS: 'documents',             // Miscellaneous documents
  VIDEOS: 'videos',                   // Video uploads
  THUMBNAILS: 'thumbnails',           // Thumbnails for images or videos
  CHAT: 'chat',                       // Media shared in chat
  STAFF: 'staff',                     // Staff profile images, documents
  REPORTS: 'reports',                 // Generated reports, PDFs
  FEEDBACK: 'feedback',               // User-submitted feedback files/screenshots
  LOGS: 'logs',                       // Logs or debug files
  BANNERS: 'banners',                 // Banner images for homepage, sections, campaigns
  LOGOS: 'logos',                     // Logos (company, app, services)
  CLIENT: 'client',                   // Client-specific uploads (documents, profile pics)
  ADMIN: 'admin',                     // Admin-specific uploads (reports, configs)
  LAWYER: 'lawyer',                   // Lawyer-specific uploads (certifications, documents)
  CLAIMS: 'claims',                   // Claims-specific uploads (evidence, documents)
  TESTIMONIALS: 'testimonials',                   // testimonials uploads (evidence, documents)
} as const;

export type TFolder = (typeof FOLDERS)[keyof typeof FOLDERS];
