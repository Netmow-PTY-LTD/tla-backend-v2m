import { IFirmProfile } from "../Firm/firm.interface";
import { FirmProfile } from "../Firm/firm.model";
import { IFirmUser } from "../FirmAuth/frimAuth.interface";
import FirmUser from "../FirmAuth/frimAuth.model";
import { FirmLocationModel } from "../firmLocation/firmLocation.model";
import { FirmLicense } from "../FirmWiseCertLicense/cirtificateLicese.model";
import FirmMedia from "../media/media.model";







const getSingleFirmProfileBySlug = async (slug: string) => {
  // Step 1: Find firm profile by slug
  const firmProfile = await FirmProfile.findOne({
    slug,
    deletedAt: null,
  }).select('firmName registrationNumber yearEstablished legalFocusAreas contactInfo companySize logo  description vatTaxId yearsInBusiness slug ')
    .populate({
      path: 'contactInfo.country',
      select: 'name slug -_id',
    })
    .populate({
      path: 'contactInfo.city',
      select: 'name  region -_id',
    })
    .populate({
      path: 'contactInfo.zipCode',
      select: 'zipcode postalCode countryCode latitude longitude -_id',
    })
    .lean();

  if (!firmProfile) return null;

  // Find the user using the firm profile ID
  const rawUser = await FirmUser.findOne({
    profile: firmProfile._id,
    deletedAt: null,
  })
    .select('email profile')
    .lean();

  if (!rawUser) return null;

  // Type override
  const user = rawUser as unknown as Omit<IFirmUser, 'profile'> & {
    email: string;
    profile: IFirmProfile;
  };


  const certification = await FirmLicense.find({
    firmProfileId: firmProfile._id,
  })
    .select('licenseNumber issuedBy additionalNote validUntil type  certificationId -_id')
    .populate({
      path: 'certificationId',
      select: 'certificationName logo  -_id',
    });


  const media = await FirmMedia.findOne({
    firmProfileId: firmProfile._id,
  }).select('-_id photos videos bannerImage');

  const location = await FirmLocationModel.find({
    firmProfileId: firmProfile._id,
  }).select('name address -_id').populate({
    path: 'address',
    select: 'zipcode postalCode countryCode latitude longitude -_id',
  });


  // Compose a complete, frontend-friendly response
  return {
    ...firmProfile,
    certification: certification || [],
    media: media || { photos: [], videos: [] },
    location: location || [],
    lawyers: []
  };
};





export const viewService = {
  getSingleFirmProfileBySlug,
};


