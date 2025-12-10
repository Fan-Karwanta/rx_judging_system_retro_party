import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  contestant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contestant',
    required: true 
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event',
    required: true 
  },
  judgeNumber: { 
    type: Number, 
    required: true,
    min: 1,
    max: 4
  },
  totalScore: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index to ensure one score per judge per contestant
scoreSchema.index({ contestant: 1, judgeNumber: 1 }, { unique: true });

export default mongoose.model('Score', scoreSchema);
