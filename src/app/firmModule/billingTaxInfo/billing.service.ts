import { FirmProfile } from '../Firm/firm.model';
import { IBillingTaxInfo } from './billing.interface';

const updateBillingTaxInfoIntoDB = async (
  firmUserId: string,
  data: Partial<IBillingTaxInfo>,
) => {
  const updateFirmInfo = await FirmProfile.findOneAndUpdate(
    { firmUser: firmUserId },
    { $set: { billingInfo: data } },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  );
  return updateFirmInfo;
};

export const BillingTaxInfoService = {
  updateBillingTaxInfoIntoDB,
};
