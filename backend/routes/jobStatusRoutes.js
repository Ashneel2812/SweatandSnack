const express = require('express');
const router = express.Router();
const { getJobStatus } = require('../routes/controllers/jobStatusController');

// Define the endpoint for generating Google Sheets
router.post('/job-status/:jobId', getJobStatus);

module.exports = router;

