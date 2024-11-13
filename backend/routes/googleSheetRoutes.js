const express = require('express');
const router = express.Router();
const { createGoogleSheet } = require('../routes/controllers/googleSheetController');

// Define the endpoint for generating Google Sheets
router.post('/generate-google-sheet', createGoogleSheet);

module.exports = router;
