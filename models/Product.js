import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Earphone', 'Headphone', 'Watch', 'Smartphone', 'Laptop', 'Camera', 'Accessories']
  },
  price: {
    type: Number,
    required: true
  },
  offerPrice: {
    type: Number,
    required: true
  },
  image: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 4.5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema); 