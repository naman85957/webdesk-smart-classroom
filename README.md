# 🎓 Webdesk — Smart Classroom System

A full-stack web application that brings all classroom tools under one roof for students and teachers.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Real-time | Socket.io |
| File Upload | Multer |
| Styling | Custom CSS Design System |

---

## ✨ Features

- **📊 Dashboard** – Live stats, today's schedule, announcements, pending assignments
- **📚 Study Materials** – Upload/download PDFs, videos, notes, links with search & filter
- **📝 Assignments** – Create, assign, submit, and grade assignments with file upload
- **🎥 Live Classes** – Schedule classes, go live, join by code, watch recordings
- **❓ Ask Doubts** – Forum with threaded replies, upvotes, teacher answers
- **📅 Schedule** – Weekly timetable with color-coded subjects (week & list views)
- **👤 Profile** – Edit profile, change password, notification preferences
- **🔔 Real-time** – Socket.io for live class notifications, doubt answers
- **🔐 Role-based Auth** – Students & Teachers have different capabilities

---

## 📁 Project Structure

```
webdesk/
├── package.json              # Root package with concurrently scripts
├── seed.js                   # Database seeder with demo data
├── README.md
│
├── server/                   # Node.js + Express API
│   ├── index.js              # Entry point, Socket.io setup
│   ├── .env                  # Environment variables
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js           # JWT auth + teacher guard
│   ├── models/
│   │   ├── User.js
│   │   ├── Material.js
│   │   ├── Assignment.js
│   │   ├── Class.js
│   │   ├── Doubt.js
│   │   ├── Schedule.js
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── auth.js           # Register, login, profile
│   │   ├── users.js
│   │   ├── materials.js      # Upload, list, delete
│   │   ├── assignments.js    # CRUD + submit + grade
│   │   ├── classes.js        # Schedule, join, status
│   │   ├── doubts.js         # Ask, reply, upvote
│   │   ├── schedule.js       # Weekly timetable
│   │   └── announcements.js
│   └── uploads/              # File storage (auto-created)
│
└── client/                   # React.js frontend
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js             # Routes + layout
        ├── index.js
        ├── index.css          # Full design system
        ├── context/
        │   └── AuthContext.js # Global auth state
        ├── utils/
        │   └── api.js         # Axios instance + interceptors
        ├── components/
        │   └── common/
        │       └── Sidebar.js # Collapsible navigation
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── Materials.js
            ├── Assignments.js
            ├── Classes.js
            ├── Doubts.js
            ├── Schedule.js
            └── Profile.js
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v16+ and npm
- MongoDB (local) or MongoDB Atlas (cloud)

### Step 1 – Clone and install

```bash
# Install all dependencies (root + server + client)
npm run install-all
```

### Step 2 – Configure environment

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/webdesk
JWT_SECRET=your_strong_secret_here
CLIENT_URL=http://localhost:3000
```

For MongoDB Atlas, replace MONGO_URI with your connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/webdesk
```

### Step 3 – Seed demo data (optional but recommended)

```bash
node seed.js
```

This creates:
- Demo student: `student@demo.com` / `password123`
- Demo teacher: `teacher@demo.com` / `password123`
- Sample materials, assignments, classes, doubts, schedule, and announcements

### Step 4 – Run the application

```bash
# Run both frontend and backend simultaneously
npm run dev

# Or run separately:
npm run server   # Backend on http://localhost:5000
npm run client   # Frontend on http://localhost:3000
```

---

## 🔑 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Materials
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/materials` | List materials (with filters) |
| POST | `/api/materials` | Upload material (Teacher) |
| DELETE | `/api/materials/:id` | Delete material (Teacher) |
| PUT | `/api/materials/:id/download` | Increment download count |

### Assignments
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/assignments` | List assignments |
| GET | `/api/assignments/:id` | Get one assignment |
| POST | `/api/assignments` | Create assignment (Teacher) |
| POST | `/api/assignments/:id/submit` | Submit work (Student) |
| PUT | `/api/assignments/:id/grade/:studentId` | Grade submission (Teacher) |
| DELETE | `/api/assignments/:id` | Delete (Teacher) |

### Classes
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/classes` | List classes |
| GET | `/api/classes/:id` | Get one class |
| POST | `/api/classes` | Create class (Teacher) |
| PUT | `/api/classes/:id/status` | Update status (Teacher) |
| POST | `/api/classes/:id/join` | Join class (Student) |
| POST | `/api/classes/join-code` | Join by class code |
| PUT | `/api/classes/:id/recording` | Add recording URL |
| DELETE | `/api/classes/:id` | Delete class |

### Doubts
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/doubts` | List doubts (with filters) |
| GET | `/api/doubts/:id` | Get one doubt |
| POST | `/api/doubts` | Ask a doubt |
| POST | `/api/doubts/:id/reply` | Post a reply |
| PUT | `/api/doubts/:id/upvote` | Toggle upvote |
| DELETE | `/api/doubts/:id` | Delete doubt |

### Schedule
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/schedule` | Get schedule (with filters) |
| POST | `/api/schedule` | Add schedule entry (Teacher) |
| PUT | `/api/schedule/:id` | Update entry |
| DELETE | `/api/schedule/:id` | Remove entry |

### Announcements
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/announcements` | List announcements |
| POST | `/api/announcements` | Post announcement (Teacher) |
| PUT | `/api/announcements/:id/read` | Mark as read |
| DELETE | `/api/announcements/:id` | Delete |

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-class` | Client → Server | Join a class room |
| `class-message` | Client → Server | Send chat message |
| `new-message` | Server → Client | Receive chat message |
| `class-status-change` | Server → Client | Class went live/ended |
| `doubt-answered` | Server → Client | A doubt was answered |
| `new-announcement` | Server → Client | New announcement posted |

---

## 🚀 Deployment

### Backend (Render / Railway / Heroku)
1. Set environment variables in dashboard
2. Set build command: `npm install`
3. Set start command: `node server/index.js`

### Frontend (Vercel / Netlify)
1. Build command: `cd client && npm install && npm run build`
2. Publish directory: `client/build`
3. Set environment variable: `REACT_APP_API_URL=https://your-api.com`

### MongoDB Atlas (Cloud DB)
1. Create free cluster at mongodb.com/atlas
2. Get connection string and paste in `server/.env`

---

## 🛡️ Role Permissions

| Feature | Student | Teacher |
|---------|---------|---------|
| View materials | ✅ | ✅ |
| Upload materials | ❌ | ✅ |
| View assignments | ✅ | ✅ |
| Create assignments | ❌ | ✅ |
| Submit assignments | ✅ | ❌ |
| Grade submissions | ❌ | ✅ |
| View classes | ✅ | ✅ |
| Create/manage classes | ❌ | ✅ |
| Join classes | ✅ | ❌ |
| Ask doubts | ✅ | ✅ |
| Answer doubts | ✅ (peer) | ✅ (teacher badge) |
| Add schedule | ❌ | ✅ |
| Post announcements | ❌ | ✅ |

---

Built with ❤️ using React.js, Node.js & MongoDB
