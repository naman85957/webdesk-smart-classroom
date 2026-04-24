const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const { auth, teacherOnly } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/assignments');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Get all assignments
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.user.role === 'teacher') filter.assignedBy = req.user._id;
    const assignments = await Assignment.find(filter)
      .populate('assignedBy', 'name')
      .populate('submissions.student', 'name email')
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single assignment
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('assignedBy', 'name')
      .populate('submissions.student', 'name email avatar');
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create assignment (teacher only)
router.post('/', auth, teacherOnly, upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, subject, dueDate, maxMarks, priority, allowLateSubmission } = req.body;
    const assignment = await Assignment.create({
      title, description, subject,
      dueDate: new Date(dueDate),
      maxMarks: maxMarks || 100,
      priority: priority || 'medium',
      allowLateSubmission: allowLateSubmission === 'true',
      assignedBy: req.user._id,
      attachmentUrl: req.file ? `/uploads/assignments/${req.file.filename}` : '',
      attachmentName: req.file ? req.file.originalname : ''
    });
    await assignment.populate('assignedBy', 'name');
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit assignment (student)
router.post('/:id/submit', auth, upload.single('file'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Not found' });

    const existing = assignment.submissions.find(
      s => s.student.toString() === req.user._id.toString()
    );
    if (existing) return res.status(400).json({ message: 'Already submitted' });

    const isLate = new Date() > new Date(assignment.dueDate);
    assignment.submissions.push({
      student: req.user._id,
      fileUrl: req.file ? `/uploads/assignments/${req.file.filename}` : '',
      fileName: req.file ? req.file.originalname : '',
      note: req.body.note || '',
      status: isLate ? 'late' : 'submitted'
    });
    await assignment.save();
    await assignment.populate('submissions.student', 'name email');
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Grade submission (teacher)
router.put('/:id/grade/:studentId', auth, teacherOnly, async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    const submission = assignment.submissions.find(
      s => s.student.toString() === req.params.studentId
    );
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete assignment
router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
