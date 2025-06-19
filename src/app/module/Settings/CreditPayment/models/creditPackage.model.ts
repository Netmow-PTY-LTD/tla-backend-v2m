import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const creditPackageSchema = new Schema({
  name: { type: String, required: true }, // e.g., "About 10 responses"
  credit: { type: Number, required: true },
  price: { type: Number, required: true }, // in base currency (e.g., pence/cents)
  priceDisplay: { type: String }, // e.g., "£476.00 (ex VAT)"
  pricePerCredit: { type: String }, // e.g., "£1.36/credit"
  discountPercentage: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const CreditPackage = mongoose.model('CreditPackage', creditPackageSchema);
export default CreditPackage;
