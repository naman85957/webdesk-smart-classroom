const router = require('express').Router();
const Schedule = require('../models/Schedule');
const { auth, teacherOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.day !== undefined) filter.dayOfWeek = parseInt(req.query.day);
    if (req.query.semester) filter.semester = req.query.semester;
    const schedules = await Schedule.find(filter)
      .populate('teacher', 'name')
      .sort({ dayOfWeek: 1, startTime: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const { subject, dayOfWeek, startTime, endTime, room, color, semester, section } = req.body;
    const schedule = await Schedule.create({
      subject, dayOfWeek, startTime, endTime,
      room: room || '', color: color || '#4F8EF7',
      semester: semester || '', section: section || '',
      teacher: req.user._id, teacherName: req.user.name
    });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
