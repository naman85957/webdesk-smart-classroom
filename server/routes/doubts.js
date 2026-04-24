const router = require('express').Router();
const Doubt = require('../models/Doubt');
const { auth } = require('../middleware/auth');

// Get all doubts
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.mine === 'true') filter.askedBy = req.user._id;
    if (req.query.search) filter.question = { $regex: req.query.search, $options: 'i' };
    const doubts = await Doubt.find(filter)
      .populate('askedBy', 'name avatar role')
      .populate('replies.author', 'name role')
      .sort({ createdAt: -1 });
    res.json(doubts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single doubt
router.get('/:id', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('askedBy', 'name avatar role').populate('replies.author', 'name role avatar');
    if (!doubt) return res.status(404).json({ message: 'Not found' });
    res.json(doubt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create doubt
router.post('/', auth, async (req, res) => {
  try {
    const { question, description, subject, tags } = req.body;
    const doubt = await Doubt.create({
      question, description, subject,
      tags: tags || [],
      askedBy: req.user._id
    });
    await doubt.populate('askedBy', 'name avatar role');
    res.status(201).json(doubt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add reply
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Not found' });
    doubt.replies.push({
      author: req.user._id,
      text: req.body.text,
      isTeacher: req.user.role === 'teacher'
    });
    if (req.user.role === 'teacher') doubt.status = 'answered';
    await doubt.save();
    await doubt.populate('askedBy', 'name avatar role');
    await doubt.populate('replies.author', 'name role avatar');
    const io = req.app.get('io');
    io.emit('doubt-answered', { doubtId: doubt._id });
    res.json(doubt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upvote doubt
router.put('/:id/upvote', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    const idx = doubt.upvotes.indexOf(req.user._id);
    if (idx === -1) doubt.upvotes.push(req.user._id);
    else doubt.upvotes.splice(idx, 1);
    await doubt.save();
    res.json({ upvotes: doubt.upvotes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete doubt
router.delete('/:id', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Not found' });
    if (doubt.askedBy.toString() !== req.user._id.toString() && req.user.role !== 'teacher')
      return res.status(403).json({ message: 'Not authorized' });
    await doubt.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
