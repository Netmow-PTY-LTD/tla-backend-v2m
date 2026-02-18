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
    required: true,
    uppercase: true, // USD, AUD, GBP
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
    const Country = mongoose.model('Country');
    const country = await Country.findById(this.country);

    if (!country) {
      return next(new Error('Invalid country selected'));
    }

    this.currency = country.currency.toUpperCase();
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

      update.currency = country.currency.toUpperCase();
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});












export default CreditPackage;
