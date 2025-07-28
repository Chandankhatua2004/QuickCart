import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  amount: Number,
  address: Object,
  status: String,
  date: Date,
  customerName: String,
  customerEmail: String,
  paymentMethod: String,
  paymentId: String,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema); 