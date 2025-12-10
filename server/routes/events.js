import express from 'express';
import Event from '../models/Event.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/', async (req, res) => {
  const event = new Event(req.body);
  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('event-updated', event);
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle event live status
router.put('/:id/toggle-live', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    event.isLive = !event.isLive;
    await event.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('event-live-toggled', event);
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle rankings visibility
router.put('/:id/toggle-rankings', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    event.showRankings = !event.showRankings;
    await event.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('rankings-toggled', event);
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Set reveal top N
router.put('/:id/reveal-top', async (req, res) => {
  try {
    const { revealTop } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { revealTop },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('reveal-top-updated', event);
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed default events
router.post('/seed', async (req, res) => {
  try {
    // Check if events already exist
    const existingEvents = await Event.find();
    if (existingEvents.length > 0) {
      return res.status(400).json({ message: 'Events already exist. Delete them first to reseed.' });
    }

    const defaultEvents = [
      {
        name: 'Retro Dance Contest',
        type: 'dance',
        criteria: [
          { name: 'Retro Outfit Style', percentage: 30, description: 'Accuracy and creativity of retro-inspired fashion' },
          { name: 'Dance Performance', percentage: 40, description: 'Execution, cleanliness, and synchronization' },
          { name: 'Audience Impact', percentage: 20, description: 'Connection with the crowd' },
          { name: 'Overall Presentation', percentage: 10, description: 'Flow, confidence, and completeness' }
        ],
        isActive: true,
        isLive: false,
        showRankings: false
      },
      {
        name: 'Retro Outfit Competition',
        type: 'outfit',
        criteria: [
          { name: 'Retro Theme Accuracy', percentage: 50, description: 'How well the outfit represents the retro era (70s-90s)' },
          { name: 'Creativity & Originality', percentage: 30, description: 'How uniquely the participant styled their retro look' },
          { name: 'Overall Impact', percentage: 20, description: 'Overall impression of the entire look' }
        ],
        isActive: true,
        isLive: false,
        showRankings: false
      }
    ];

    const events = await Event.insertMany(defaultEvents);
    res.status(201).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
