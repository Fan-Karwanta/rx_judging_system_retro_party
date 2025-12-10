import mongoose from 'mongoose';

const contestantSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  number: {
    type: Number,
    required: true
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event',
    required: true 
  },
  groupName: {
    type: String // e.g., "RX DANCE TROUPE" or "RX GRAND MENTORS"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Contestant', contestantSchema);
