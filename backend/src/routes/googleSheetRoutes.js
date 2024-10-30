const express = require('express');
const router = express.Router();
const { createGoogleSheet } = require('../controllers/googleSheetController');

router.post('/generate-sheet', async (req, res) => {
  const { email, workoutPlan } = req.body;

  try {
    await createGoogleSheet(email, workoutPlan);
    res.status(200).json({ message: 'Google Sheet created and sent to your email!' });
  } catch (error) {
    console.error('Error generating Google Sheet:', error);
    res.status(500).json({ error: 'Failed to create Google Sheet.' });
  }
});

module.exports = router;
