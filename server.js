require('dotenv').config();
require('./server/config/env');  // validate required env vars on startup

const app = require('./server/app');
const { startEscalationJob } = require('./server/jobs/escalationJob');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Start escalation job before server starts
startEscalationJob();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Example: emit event when a new report is created (to be triggered in report logic)
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in app
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 CivicPulse server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
