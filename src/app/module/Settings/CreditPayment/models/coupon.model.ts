import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  maxUses: { type: Number },
  currentUses: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
