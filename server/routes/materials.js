const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const { auth, teacherOnly } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/materials');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// Get all materials
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };
    const materials = await Material.find(filter)
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload material
router.post('/', auth, teacherOnly, upload.single('file'), async (req, res) => {
  try {
    const { title, description, subject, type, externalLink, tags } = req.body;
    const material = await Material.create({
      title, description, subject, type,
      externalLink: externalLink || '',
      fileUrl: req.file ? `/uploads/materials/${req.file.filename}` : '',
      fileName: req.file ? req.file.originalname : '',
      fileSize: req.file ? req.file.size : 0,
      uploadedBy: req.user._id,
      tags: tags ? JSON.parse(tags) : []
    });
    await material.populate('uploadedBy', 'name role');
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete material
router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Not found' });
    if (material.uploadedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (material.fileUrl) {
      const filePath = path.join(__dirname, '..', material.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await material.deleteOne();
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Increment download count
router.put('/:id/download', auth, async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id, { $inc: { downloads: 1 } }, { new: true }
    );
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
