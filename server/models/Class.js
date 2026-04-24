const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const classSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, default: '' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 },
  status: { type: String, enum: ['scheduled', 'live', 'ended'], default: 'scheduled' },
  meetLink: { type: String, default: '' },
  recordingUrl: { type: String, default: '' },
  chatMessages: [messageSchema],
  isRecorded: { type: Boolean, default: false },
  classCode: { type: String, unique: true }
}, { timestamps: true });

classSchema.pre('save', function(next) {
  if (!this.classCode) {
    this.classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Class', classSchema);
