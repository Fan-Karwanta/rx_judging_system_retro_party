import express from 'express';
import Contestant from '../models/Contestant.js';
import Score from '../models/Score.js';

const router = express.Router();

// Get all contestants
router.get('/', async (req, res) => {
  try {
    const { event } = req.query;
    const filter = event ? { event } : {};
    const contestants = await Contestant.find(filter)
      .populate('event')
      .sort({ number: 1 });
    res.json(contestants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get contestants by event
router.get('/event/:eventId', async (req, res) => {
  try {
    const contestants = await Contestant.find({ event: req.params.eventId })
      .sort({ number: 1 });
    res.json(contestants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single contestant
router.get('/:id', async (req, res) => {
  try {
    const contestant = await Contestant.findById(req.params.id).populate('event');
    if (!contestant) {
      return res.status(404).json({ message: 'Contestant not found' });
    }
    res.json(contestant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create contestant
router.post('/', async (req, res) => {
  const contestant = new Contestant(req.body);
  try {
    const newContestant = await contestant.save();
    const populated = await Contestant.findById(newContestant._id).populate('event');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('contestant-added', populated);
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update contestant
router.put('/:id', async (req, res) => {
  try {
    const contestant = await Contestant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('event');
    
    if (!contestant) {
      return res.status(404).json({ message: 'Contestant not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('contestant-updated', contestant);
    
    res.json(contestant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete contestant
router.delete('/:id', async (req, res) => {
  try {
    const contestant = await Contestant.findByIdAndDelete(req.params.id);
    if (!contestant) {
      return res.status(404).json({ message: 'Contestant not found' });
    }
    
    // Also delete associated scores
    await Score.deleteMany({ contestant: req.params.id });
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('contestant-deleted', req.params.id);
    
    res.json({ message: 'Contestant deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed default contestants
router.post('/seed/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { type } = req.body; // 'dance' or 'outfit'
    
    // Check if contestants already exist for this event
    const existing = await Contestant.find({ event: eventId });
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Contestants already exist for this event' });
    }

    let defaultContestants = [];
    
    if (type === 'dance') {
      defaultContestants = [
        { name: 'HAPPY FEET MOVERS', number: 1, event: eventId, groupName: 'RX DANCE TROUPE' },
        { name: 'B.E DANCERS', number: 2, event: eventId, groupName: 'RX DANCE TROUPE' },
        { name: 'SNEAKER RIDERS', number: 3, event: eventId, groupName: 'RX DANCE TROUPE' },
        { name: 'D GOLDEN STEPS REVOLUTION', number: 4, event: eventId, groupName: 'RX DANCE TROUPE' },
        { name: 'THE VINTAGE VIBES', number: 5, event: eventId, groupName: 'RX DANCE TROUPE' }
      ];
    } else if (type === 'outfit') {
      defaultContestants = [
        { name: 'BLACK EAGLES', number: 1, event: eventId, groupName: 'RX GRAND MENTORS' },
        { name: 'ELITE FALCONS', number: 2, event: eventId, groupName: 'RX GRAND MENTORS' },
        { name: 'WOLFGANG', number: 3, event: eventId, groupName: 'RX GRAND MENTORS' },
        { name: 'BLACK PANTHERS', number: 4, event: eventId, groupName: 'RX GRAND MENTORS' },
        { name: 'DOMINATORS', number: 5, event: eventId, groupName: 'RX GRAND MENTORS' }
      ];
    }

    const contestants = await Contestant.insertMany(defaultContestants);
    res.status(201).json(contestants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
