const router = require('express').Router();
const Class = require('../models/Class');
const { auth, teacherOnly } = require('../middleware/auth');

// Get all classes
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'teacher') filter.teacher = req.user._id;
    const classes = await Class.find(filter)
      .populate('teacher', 'name email')
      .populate('students', 'name email avatar')
      .sort({ scheduledAt: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single class
router.get('/:id', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email avatar')
      .populate('chatMessages.sender', 'name');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create class (teacher)
router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const { title, subject, description, scheduledAt, duration, meetLink, isRecorded } = req.body;
    const cls = await Class.create({
      title, subject, description,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      meetLink: meetLink || '',
      isRecorded: isRecorded || false,
      teacher: req.user._id
    });
    await cls.populate('teacher', 'name email');
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update class status
router.put('/:id/status', auth, teacherOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const cls = await Class.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('teacher', 'name email');
    const io = req.app.get('io');
    io.emit('class-status-change', { classId: cls._id, status });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join class (student)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (!cls.students.includes(req.user._id)) {
      cls.students.push(req.user._id);
      await cls.save();
    }
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join by class code
router.post('/join-code', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const cls = await Class.findOne({ classCode: code.toUpperCase() });
    if (!cls) return res.status(404).json({ message: 'Invalid class code' });
    if (!cls.students.includes(req.user._id)) {
      cls.students.push(req.user._id);
      await cls.save();
    }
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add recording URL
router.put('/:id/recording', auth, teacherOnly, async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(
      req.params.id, { recordingUrl: req.body.recordingUrl }, { new: true }
    );
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete class
router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
