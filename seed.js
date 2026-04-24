// Run: node server/seed.js
// Seeds the database with demo data

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });

mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected')).catch(console.error);

const User = require('./server/models/User');
const Material = require('./server/models/Material');
const Assignment = require('./server/models/Assignment');
const Class = require('./server/models/Class');
const Doubt = require('./server/models/Doubt');
const Schedule = require('./server/models/Schedule');
const Announcement = require('./server/models/Announcement');

async function seed() {
  try {
    // Clear existing
    await Promise.all([User, Material, Assignment, Class, Doubt, Schedule, Announcement].map(M => M.deleteMany({})));
    console.log('Cleared existing data');

    // Create users
    const teacher = await User.create({ name: 'Prof. Meena Sharma', email: 'teacher@demo.com', password: 'password123', role: 'teacher', department: 'Computer Science', bio: 'Faculty of Data Structures & Algorithms' });
    const teacher2 = await User.create({ name: 'Prof. Arjun Anand', email: 'teacher2@demo.com', password: 'password123', role: 'teacher', department: 'Computer Science' });
    const student = await User.create({ name: 'Arjun Kumar', email: 'student@demo.com', password: 'password123', role: 'student', department: 'Computer Science', semester: '6', bio: 'CSE 3rd year, passionate about coding' });
    const student2 = await User.create({ name: 'Priya Nair', email: 'student2@demo.com', password: 'password123', role: 'student', department: 'Computer Science', semester: '6' });
    console.log('✅ Users created');

    // Create schedule
    const scheduleItems = [
      { subject: 'Data Structures', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', room: '201', color: '#4F8EF7', semester: '6', teacher: teacher._id, teacherName: teacher.name },
      { subject: 'Database Systems', dayOfWeek: 1, startTime: '11:00', endTime: '12:00', room: '105', color: '#7C3AED', semester: '6', teacher: teacher2._id, teacherName: teacher2.name },
      { subject: 'Web Development', dayOfWeek: 1, startTime: '14:00', endTime: '15:00', room: 'Lab 3', color: '#10B981', semester: '6', teacher: teacher2._id, teacherName: teacher2.name },
      { subject: 'Machine Learning', dayOfWeek: 2, startTime: '10:00', endTime: '11:30', room: '302', color: '#F59E0B', semester: '6', teacher: teacher._id, teacherName: teacher.name },
      { subject: 'Data Structures', dayOfWeek: 3, startTime: '09:00', endTime: '10:00', room: '201', color: '#4F8EF7', semester: '6', teacher: teacher._id, teacherName: teacher.name },
      { subject: 'Database Systems', dayOfWeek: 4, startTime: '11:00', endTime: '12:00', room: '105', color: '#7C3AED', semester: '6', teacher: teacher2._id, teacherName: teacher2.name },
      { subject: 'Software Engineering', dayOfWeek: 5, startTime: '09:00', endTime: '10:30', room: '204', color: '#EC4899', semester: '6', teacher: teacher._id, teacherName: teacher.name },
    ];
    await Schedule.insertMany(scheduleItems);
    console.log('✅ Schedule created');

    // Create materials
    await Material.insertMany([
      { title: 'Trees & Graphs - Complete Notes', description: 'Comprehensive notes on tree traversals and graph algorithms', subject: 'Data Structures', type: 'pdf', uploadedBy: teacher._id, tags: ['Trees', 'Graphs', 'BFS', 'DFS'] },
      { title: 'ER Diagrams & Normalization Slides', description: 'PowerPoint slides covering ER modeling and normalization forms', subject: 'Database Systems', type: 'presentation', uploadedBy: teacher2._id, tags: ['ER Diagram', 'Normalization'] },
      { title: 'React Hooks & State Management Notes', description: 'Notes on useState, useEffect, useContext and custom hooks', subject: 'Web Development', type: 'notes', uploadedBy: teacher2._id, tags: ['React', 'Hooks', 'State'] },
      { title: 'Sorting Algorithms Cheatsheet', description: 'Quick reference for all major sorting algorithms with complexity', subject: 'Data Structures', type: 'pdf', uploadedBy: teacher._id, tags: ['Sorting', 'Big O'] },
      { title: 'MDN JavaScript Reference', description: 'Official Mozilla Developer Network JavaScript documentation', subject: 'Web Development', type: 'link', externalLink: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', uploadedBy: teacher2._id, tags: ['JavaScript', 'Reference'] },
    ]);
    console.log('✅ Materials created');

    // Create assignments
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
    const twoWeeks = new Date(); twoWeeks.setDate(twoWeeks.getDate() + 14);

    await Assignment.insertMany([
      { title: 'BST Implementation in C++', description: 'Implement a Binary Search Tree with insert, delete, search, and all traversal methods (inorder, preorder, postorder). Include proper documentation and test cases.', subject: 'Data Structures', dueDate: tomorrow, maxMarks: 100, priority: 'high', assignedBy: teacher._id },
      { title: 'React Components & Custom Hooks', description: 'Build a Todo application using React functional components and create at least 2 custom hooks. Include proper state management and component composition.', subject: 'Web Development', dueDate: nextWeek, maxMarks: 100, priority: 'medium', assignedBy: teacher2._id },
      { title: 'ER Diagram for Library System', description: 'Design a complete ER diagram for a library management system. Include all entities, relationships, primary keys, foreign keys, and cardinality.', subject: 'Database Systems', dueDate: twoWeeks, maxMarks: 50, priority: 'medium', assignedBy: teacher2._id },
    ]);
    console.log('✅ Assignments created');

    // Create classes
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    await Class.insertMany([
      { title: 'Data Structures - Graph Algorithms', subject: 'Data Structures', description: 'Covering BFS, DFS, Dijkstra and Floyd-Warshall algorithms', teacher: teacher._id, students: [student._id, student2._id], scheduledAt: inOneHour, duration: 60, status: 'live', meetLink: 'https://meet.google.com/demo-link', isRecorded: true },
      { title: 'Database Systems - SQL Advanced', subject: 'Database Systems', description: 'Stored procedures, triggers and advanced joins', teacher: teacher2._id, students: [student._id], scheduledAt: new Date(now.getTime() + 3 * 60 * 60 * 1000), duration: 90, status: 'scheduled', meetLink: '' },
      { title: 'React State Management - Redux', subject: 'Web Development', description: 'Introduction to Redux and state management patterns', teacher: teacher2._id, students: [student._id, student2._id], scheduledAt: yesterday, duration: 75, status: 'ended', recordingUrl: '', isRecorded: true },
    ]);
    console.log('✅ Classes created');

    // Create doubts
    await Doubt.insertMany([
      { question: 'How does AVL tree self-balancing work after multiple insertions?', description: 'I understand rotation operations individually, but get confused when multiple insertions happen and the tree needs multiple re-balancing operations.', subject: 'Data Structures', tags: ['Trees', 'AVL', 'Rotation'], askedBy: student._id, status: 'answered', replies: [{ author: teacher._id, text: 'AVL trees maintain balance by tracking the balance factor (height difference between left and right subtrees) for each node. After insertion, if any node\'s factor becomes ±2, we perform rotations: LL/RR for single rotations, LR/RL for double rotations. Walk up from the inserted node to the root checking each ancestor.', isTeacher: true }] },
      { question: 'What is the difference between LEFT JOIN and INNER JOIN with NULL values?', description: 'When tables have NULL values in join columns, I am not sure which join type handles them correctly.', subject: 'Database Systems', tags: ['SQL', 'Joins', 'NULL'], askedBy: student2._id, status: 'pending' },
      { question: 'How to properly use useEffect with async functions in React?', description: 'I keep getting the warning about useEffect returning a promise. What is the correct pattern for async operations inside useEffect?', subject: 'Web Development', tags: ['React', 'Hooks', 'Async', 'useEffect'], askedBy: student._id, status: 'pending' },
    ]);
    console.log('✅ Doubts created');

    // Create announcements
    await Announcement.insertMany([
      { title: 'Mid-semester exams schedule released', content: 'The mid-semester examination schedule has been released. Please check the notice board and plan your preparation accordingly. Exams start from next Monday.', author: teacher._id, subject: 'General', priority: 'urgent', targetRole: 'all' },
      { title: 'New study materials uploaded for Data Structures', content: 'Complete notes for Unit 4 - Graphs have been uploaded in the Study Materials section. Please review them before Friday\'s class.', author: teacher._id, subject: 'Data Structures', priority: 'normal', targetRole: 'student' },
      { title: 'Assignment submission deadline extended', content: 'The BST Implementation assignment deadline has been extended by 2 days due to the upcoming technical fest. New deadline: this Sunday.', author: teacher._id, subject: 'Data Structures', priority: 'high', targetRole: 'student' },
    ]);
    console.log('✅ Announcements created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('   Student: student@demo.com / password123');
    console.log('   Teacher: teacher@demo.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
