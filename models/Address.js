import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  userId: String,
  fullName: String,
  phoneNumber: String,
  pincode: String,
  area: String,
  city: String,
  state: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Address || mongoose.model('Address', AddressSchema); 