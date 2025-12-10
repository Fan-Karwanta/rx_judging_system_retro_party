import mongoose from 'mongoose';

const criteriaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  percentage: { type: Number, required: true },
  description: { type: String }
});

const eventSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['dance', 'outfit'],
    required: true 
  },
  criteria: [criteriaSchema],
  isActive: { 
    type: Boolean, 
    default: false 
  },
  isLive: {
    type: Boolean,
    default: false
  },
  showRankings: {
    type: Boolean,
    default: false
  },
  revealTop: {
    type: Number,
    default: 0 // 0 means show all, otherwise show top N
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Event', eventSchema);
