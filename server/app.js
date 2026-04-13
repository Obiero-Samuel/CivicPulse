const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Example route (remove or replace as needed)
app.get('/', (req, res) => {
	res.send('CivicPulse API is running!');
});

module.exports = app;
