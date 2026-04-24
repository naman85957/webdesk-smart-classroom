const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherName: { type: String, default: '' },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=Sunday
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "10:00"
  room: { type: String, default: '' },
  color: { type: String, default: '#4F8EF7' },
  semester: { type: String, default: '' },
  section: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
