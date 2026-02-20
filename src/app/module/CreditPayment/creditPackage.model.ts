import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const creditPackageSchema = new Schema({
  name: { type: String, required: true }, // e.g., "About 10 responses"
  credit: { type: Number, required: true },
  price: { type: Number, required: true }, // in base currency (e.g., pence/cents)
  priceDisplay: { type: Number }, // e.g., "£476.00 (ex VAT)"
  pricePerCredit: { type: Number }, // e.g., "£1.36/credit"
  discountPercentage: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  currency: {
    type: String,
    uppercase: true, // USD, AUD, GBP
    default: 'USD', // Default value, will be overridden by pre-save hook
  },

  country: {
    type: Schema.Types.ObjectId,
    ref: 'Country',
    required: true,
  },
});

const CreditPackage = mongoose.model('CreditPackage', creditPackageSchema);



/* ---------- AUTO SET CURRENCY ON CREATE ---------- */
creditPackageSchema.pre('save', async function (next) {
  try {
    // Only auto-populate currency if country is provided and currency is not already set
    if (this.country) {
      const Country = mongoose.model('Country');
      const country = await Country.findById(this.country);

      if (!country) {
        return next(new Error('Invalid country selected'));
      }

      if (country.currency) {
        this.currency = country.currency.toUpperCase();
      } else {
        return next(new Error('Country does not have a currency configured'));
      }
    } else {
      return next(new Error('Country is required to set currency'));
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

/* ---------- AUTO SET CURRENCY ON UPDATE ---------- */
creditPackageSchema.pre('findOneAndUpdate', async function (next) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update = this.getUpdate() as any;

    if (update?.country) {
      const Country = mongoose.model('Country');
      const country = await Country.findById(update.country);

      if (!country) {
        return next(new Error('Invalid country selected'));
      }

      if (country.currency) {
        update.currency = country.currency.toUpperCase();
      } else {
        return next(new Error('Country does not have a currency configured'));
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});












export default CreditPackage;
