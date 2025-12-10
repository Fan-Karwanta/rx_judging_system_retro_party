import express from 'express';
import Score from '../models/Score.js';
import Contestant from '../models/Contestant.js';

const router = express.Router();

// Get all scores
router.get('/', async (req, res) => {
  try {
    const { event, contestant } = req.query;
    const filter = {};
    if (event) filter.event = event;
    if (contestant) filter.contestant = contestant;
    
    const scores = await Score.find(filter)
      .populate('contestant')
      .populate('event')
      .sort({ judgeNumber: 1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get scores by event with rankings
router.get('/event/:eventId/rankings', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get all contestants for this event
    const contestants = await Contestant.find({ event: eventId }).sort({ number: 1 });
    
    // Get all scores for this event
    const scores = await Score.find({ event: eventId });
    
    // Calculate rankings
    const rankings = contestants.map(contestant => {
      const contestantScores = scores.filter(
        s => s.contestant.toString() === contestant._id.toString()
      );
      
      const judge1 = contestantScores.find(s => s.judgeNumber === 1)?.totalScore || 0;
      const judge2 = contestantScores.find(s => s.judgeNumber === 2)?.totalScore || 0;
      const judge3 = contestantScores.find(s => s.judgeNumber === 3)?.totalScore || 0;
      const judge4 = contestantScores.find(s => s.judgeNumber === 4)?.totalScore || 0;
      
      const grandTotal = judge1 + judge2 + judge3 + judge4;
      
      return {
        contestant: {
          _id: contestant._id,
          name: contestant.name,
          number: contestant.number,
          groupName: contestant.groupName
        },
        scores: {
          judge1,
          judge2,
          judge3,
          judge4
        },
        grandTotal,
        rank: 0 // Will be calculated after sorting
      };
    });
    
    // Sort by grand total (descending) and assign ranks
    rankings.sort((a, b) => b.grandTotal - a.grandTotal);
    rankings.forEach((item, index) => {
      item.rank = index + 1;
    });
    
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get scores for a specific contestant
router.get('/contestant/:contestantId', async (req, res) => {
  try {
    const scores = await Score.find({ contestant: req.params.contestantId })
      .sort({ judgeNumber: 1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit or update a score
router.post('/', async (req, res) => {
  try {
    const { contestant, event, judgeNumber, totalScore } = req.body;
    
    // Check if score already exists for this judge and contestant
    let score = await Score.findOne({ contestant, judgeNumber });
    
    if (score) {
      // Update existing score
      score.totalScore = totalScore;
      score.submittedAt = new Date();
      await score.save();
    } else {
      // Create new score
      score = new Score({ contestant, event, judgeNumber, totalScore });
      await score.save();
    }
    
    // Get updated rankings for real-time broadcast
    const contestants = await Contestant.find({ event }).sort({ number: 1 });
    const scores = await Score.find({ event });
    
    const rankings = contestants.map(c => {
      const contestantScores = scores.filter(
        s => s.contestant.toString() === c._id.toString()
      );
      
      const judge1 = contestantScores.find(s => s.judgeNumber === 1)?.totalScore || 0;
      const judge2 = contestantScores.find(s => s.judgeNumber === 2)?.totalScore || 0;
      const judge3 = contestantScores.find(s => s.judgeNumber === 3)?.totalScore || 0;
      const judge4 = contestantScores.find(s => s.judgeNumber === 4)?.totalScore || 0;
      
      return {
        contestant: {
          _id: c._id,
          name: c.name,
          number: c.number,
          groupName: c.groupName
        },
        scores: { judge1, judge2, judge3, judge4 },
        grandTotal: judge1 + judge2 + judge3 + judge4,
        rank: 0
      };
    });
    
    rankings.sort((a, b) => b.grandTotal - a.grandTotal);
    rankings.forEach((item, index) => {
      item.rank = index + 1;
    });
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('score-updated', { eventId: event, rankings });
    
    res.status(201).json({ score, rankings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a score
router.delete('/:id', async (req, res) => {
  try {
    const score = await Score.findByIdAndDelete(req.params.id);
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('score-deleted', score);
    
    res.json({ message: 'Score deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all scores for an event
router.delete('/event/:eventId', async (req, res) => {
  try {
    await Score.deleteMany({ event: req.params.eventId });
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('scores-cleared', req.params.eventId);
    
    res.json({ message: 'All scores cleared for event' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
