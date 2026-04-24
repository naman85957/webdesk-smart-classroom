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

/* =========================
   ✅ Allowed Origins
========================= */
const allowedOrigins = [
  'http://localhost:3000',
  'https://webdesk-smart-classroom.vercel.app'
];

/* =========================
   ✅ CORS Middleware (FIXED)
========================= */
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / mobile apps

    if (
      allowedOrigins.includes(origin) ||
      origin.includes('vercel.app') // allow all Vercel preview URLs
    ) {
      return callback(null, true);
    }

    return callback(new Error('CORS not allowed'));
  },
  credentials: true
}));

/* =========================
   ✅ Socket.io (FIXED)
========================= */
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        origin.includes('vercel.app') ||
        origin === 'http://localhost:3000'
      ) {
        return callback(null, true);
      }

      return callback(new Error('Socket CORS blocked'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

/* =========================
   ✅ Middleware
========================= */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   ✅ MongoDB Connection
========================= */
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Failed');
  console.error(err.message);
});

/* =========================
   ✅ Routes
========================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/doubts', require('./routes/doubts'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/announcements', require('./routes/announcements'));

/* =========================
   ✅ Health Check
========================= */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Webdesk API running' });
});

/* =========================
   ✅ Root Route (optional)
========================= */
app.get('/', (req, res) => {
  res.send('Webdesk Backend Running 🚀');
});

/* =========================
   ✅ Socket Events
========================= */
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
    io.to(`class-${classId}`).emit('new-message', {
      message,
      user,
      timestamp: new Date()
    });
  });

  socket.on('doubt-answered', ({ doubtId }) => {
    io.emit('doubt-update', { doubtId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

/* =========================
   ✅ Make io available in routes
========================= */
app.set('io', io);

/* =========================
   ✅ Server Start
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Webdesk Server running on port ${PORT}`);
});