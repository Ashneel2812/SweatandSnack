const { submitQuestionnaire } = require('../controllers/questionarrieSubmit');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await submitQuestionnaire(req, res);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      res.status(500).json({ error: 'Failed to submit questionnaire' });
    }
  } else {
    // If the method is not POST, respond with a 405 Method Not Allowed error
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
