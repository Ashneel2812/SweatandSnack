const { submitQuestionnaire } = require('../controllers/questionarrieSubmit');
const { createGoogleSheet } = require('../controllers/googleSheetController');
const { regeneratePlan } = require('../controllers/regeneratePlan');
const { savePlan } = require('../controllers/savePlan');

module.exports = async (req, res) => {
  // Check the request method and handle different routes accordingly

  // Handle submit-questionnaire
  if (req.method === 'POST' && req.url.includes('submit-questionnaire')) {
    try {
      await submitQuestionnaire(req, res);
    } catch (error) {
      res.status(500).json({ error: 'Error in submitting questionnaire.', details: error.message });
    }
    return;
  }

  // Handle generate-sheet
  if (req.method === 'POST' && req.url.includes('generate-sheet')) {
    try {
      const { email, workoutPlan } = req.body;
      if (!email || !workoutPlan) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      await createGoogleSheet(email, workoutPlan);
      res.status(200).json({ message: 'Google Sheet created and sent to your email!' });
    } catch (error) {
      res.status(500).json({ error: 'Error in creating Google Sheet.', details: error.message });
    }
    return;
  }

  // Handle regenerate-plan
  if (req.method === 'POST' && req.url.includes('regenerate-plan')) {
    try {
      await regeneratePlan(req, res);
    } catch (error) {
      res.status(500).json({ error: 'Error in regenerating plan.', details: error.message });
    }
    return;
  }

  // Handle save-plan
  if (req.method === 'POST' && req.url.includes('email-plan')) {
    try {
      await savePlan(req, res);
    } catch (error) {
      res.status(500).json({ error: 'Error in saving plan.', details: error.message });
    }
    return;
  }

  // Default to 405 Method Not Allowed if no valid route is matched
  res.status(405).json({ error: 'Method Not Allowed' });
};
