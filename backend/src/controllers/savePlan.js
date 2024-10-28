const Plan = require('../models/Plan');

const savePlan = async (req, res) => {
  try {
    const { email, dietPlan, workoutPlan, dietMacros } = req.body;

    if (!email || !dietPlan || !workoutPlan || !dietMacros) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPlan = new Plan({
      email,
      dietPlan,
      workoutPlan,
      dietMacros
    });

    await newPlan.save();

    res.status(201).json({ message: 'Plan saved successfully' });
  } catch (error) {
    console.error('Error saving plan:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { savePlan };
