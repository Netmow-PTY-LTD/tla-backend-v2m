import mongoose from 'mongoose';

import certificationsData from './data/certificationsData';
import { LawFirmCertification } from '../app/module/LawfirmCertification/lawFirmCert.model';

const countryIds: Record<string, string> = {
  Australia: '682ecd01e6b730f229c8d3d3',
  'United Kingdom': '68a6c60a551ac20293f25a98',
  'United States': '68a6c616551ac20293f25ae5',
  Canada: '68a6c6c2551ac20293f25f38',
  Ireland: '68a6c6d2551ac20293f25fa5',
  'South Africa': '68a6c6de551ac20293f25ff3',
  'New Zealand': '68a6c6eb551ac20293f26048',
  Singapore: '68a6c6f5551ac20293f26088',
  France: '68a6c700551ac20293f260d0',
  Deutschland: '68a6c70d551ac20293f26132',
};

async function seedCertifications(): Promise<void> {
  try {
    await mongoose.connect(
      'mongodb+srv://tla-db:ucTzNJuV5jmerx2U@rh-dev.enoq8.mongodb.net/tlaDB?retryWrites=true&w=majority&appName=rh-dev',
    );

    for (const [countryName, data] of Object.entries(certificationsData)) {
      const countryId = countryIds[countryName];

      if (!countryId) continue;

      // Mandatory certifications
      for (const cert of data.mandatory) {
        await LawFirmCertification.create({
          countryId,
          type: 'mandatory',
          certificationName: cert,
        });
      }

      // Optional certifications
      for (const cert of data.optional) {
        await LawFirmCertification.create({
          countryId,
          type: 'optional',
          certificationName: cert,
        });
      }

      console.log(`✅ Seeded ${countryName}`);

      for (const cert of data.optional) {
        await LawFirmCertification.updateOne(
          {
            countryId,
            type: 'optional',
            certificationName: cert,
          },
          {
            $set: {
              countryId,
              type: 'optional',
              certificationName: cert,
            },
          },
          { upsert: true },
        );
      }
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedCertifications();

// command
// npx ts-node src/scripts/seedCertifications.ts
