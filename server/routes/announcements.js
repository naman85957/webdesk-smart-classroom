const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { auth, teacherOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const filter = { $or: [{ targetRole: 'all' }, { targetRole: req.user.role }] };
    const announcements = await Announcement.find(filter)
      .populate('author', 'name role')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const ann = await Announcement.create({ ...req.body, author: req.user._id });
    await ann.populate('author', 'name role');
    const io = req.app.get('io');
    io.emit('new-announcement', ann);
    res.status(201).json(ann);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
