const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/doubts', require('./routes/doubts'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/announcements', require('./routes/announcements'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Webdesk API running' }));

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-class', (classId) => {
    socket.join(`class-${classId}`);
    io.to(`class-${classId}`).emit('user-joined', { socketId: socket.id });
  });

  socket.on('leave-class', (classId) => {
    socket.leave(`class-${classId}`);
    io.to(`class-${classId}`).emit('user-left', { socketId: socket.id });
  });

  socket.on('class-message', ({ classId, message, user }) => {
    io.to(`class-${classId}`).emit('new-message', { message, user, timestamp: new Date() });
  });

  socket.on('doubt-answered', ({ doubtId }) => {
    io.emit('doubt-update', { doubtId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Webdesk Server running on port ${PORT}`);
});
