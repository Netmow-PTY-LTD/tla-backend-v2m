import mongoose from 'mongoose';

import { clientsFaqData, lawyersFaqData } from './data/websiteFaqData';
import { WebsiteFaq, FAQ_CATEGORY } from '../app/module/WebsiteFaq/websiteFaq.model';
import { User } from '../app/module/Auth/auth.model';
import config from '../app/config';

async function seedWebsiteFaqs(): Promise<void> {
  try {
    // Connect to database
    const dbUrl = config.database_url || process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined');
    }
    await mongoose.connect(dbUrl);
    console.log('Connected to database');

    // Find admin user for createdBy field
    let adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    const adminUserId = adminUser._id;
    console.log('Using admin user:', adminUser.email);

    // Clear existing FAQs (optional - remove if you want to keep existing data)
    const existingCount = await WebsiteFaq.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing FAQs. Cleaning...`);
      await WebsiteFaq.deleteMany({});
    }

    // Insert client FAQs
    let clientOrder = 1;
    for (const faq of clientsFaqData) {
      await WebsiteFaq.create({
        question: faq.question,
        answer: faq.answer,
        category: FAQ_CATEGORY.CLIENT,
        order: clientOrder++,
        isActive: true,
        createdBy: adminUserId,
      });
    }
    console.log(`✅ Seeded ${clientsFaqData.length} client FAQs`);

    // Insert lawyer FAQs
    let lawyerOrder = 1;
    for (const faq of lawyersFaqData) {
      await WebsiteFaq.create({
        question: faq.question,
        answer: faq.answer,
        category: FAQ_CATEGORY.LAWYER,
        order: lawyerOrder++,
        isActive: true,
        createdBy: adminUserId,
      });
    }
    console.log(`✅ Seeded ${lawyersFaqData.length} lawyer FAQs`);

    const totalCount = await WebsiteFaq.countDocuments();
    console.log(`✨ Total FAQs in database: ${totalCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding FAQs:', err);
    process.exit(1);
  }
}

seedWebsiteFaqs();

// command to run this script:
// npx ts-node src/scripts/seedWebsiteFaqs.ts
