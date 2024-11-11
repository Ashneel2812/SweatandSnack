const { createGoogleSheet } = require('../controllers/googleSheetController');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { email, workoutPlan } = req.body;

      if (!email || !workoutPlan) {
        return res.status(400).json({ error: 'Email and workout plan are required' });
      }

      // Call the function to create the Google Sheet
      await createGoogleSheet(email, workoutPlan);
      
      res.status(200).json({ message: 'Google Sheet created and sent to your email!' });
    } catch (error) {
      console.error('Error generating Google Sheet:', error);
      res.status(500).json({ error: 'Failed to create Google Sheet' });
    }
  } else {
    // If the method is not POST, respond with a 405 Method Not Allowed error
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
