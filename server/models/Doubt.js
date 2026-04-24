const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isTeacher: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const doubtSchema = new mongoose.Schema({
  question: { type: String, required: true },
  description: { type: String, default: '' },
  subject: { type: String, required: true },
  tags: [String],
  askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  replies: [replySchema],
  status: { type: String, enum: ['pending', 'answered', 'closed'], default: 'pending' },
  attachmentUrl: { type: String, default: '' },
  views: { type: Number, default: 0 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Doubt', doubtSchema);
