require('dotenv').config();
const app = require('./server/app');
const { startEscalationJob } = require('./server/jobs/escalationJob');

const PORT = process.env.PORT || 5000;

// Start escalation job before server starts
startEscalationJob();

app.listen(PORT, () => {
  console.log(`🚀 CivicPulse server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
