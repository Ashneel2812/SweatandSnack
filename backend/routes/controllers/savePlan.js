require('dotenv').config();
const mongoose = require('mongoose');

// Define the schema for the Plan model
const planSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  dietPlan: {
    type: Map, // Use Map for flexible key-value pairs
    of: mongoose.Schema.Types.Mixed, // Allows nested objects of any type
    required: true
  },
  workoutPlan: {
    type: Map, // Use Map for flexible key-value pairs
    of: mongoose.Schema.Types.Mixed, // Allows nested objects of any type
    required: true
  },
  dietMacros: {
    type: Map, // Use Map for flexible key-value pairs
    of: mongoose.Schema.Types.Mixed, // Allows nested objects of any type
    required: true
  },
}, { timestamps: true });

// Create the Plan model
const Plan = mongoose.model('Plan', planSchema,'EmailPlan');

// Function to save plan
const savePlan = async (req, res) => {
  try {
    console.log('Received request to save plan...');

    const { email, dietPlan, workoutPlan, dietMacros } = req.body;

    // Log input for debugging
    console.log('Request body:', { email, dietPlan, workoutPlan, dietMacros });

    // Check for missing required fields
    if (!email || !dietPlan || !workoutPlan || !dietMacros) {
      console.log('Error: Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Establish MongoDB connection
    if (mongoose.connection.readyState !== 1) { // If not already connected
      await mongoose.connect('mongodb+srv://dbUser:dbUserPassword@sweatandsnack.5nd6x.mongodb.net/SweatandSnack?retryWrites=true&w=majority&appName=SweatandSnack', { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('MongoDB connected');
    }

    // Check if a plan with the given email already exists
    const existingPlan = await Plan.findOne({ email });
    console.log('Existing plan check:', existingPlan);

    if (existingPlan) {
      // Update the existing plan
      console.log('Updating existing plan for email:', email);
      existingPlan.dietPlan = dietPlan;
      existingPlan.workoutPlan = workoutPlan;
      existingPlan.dietMacros = dietMacros;
      await existingPlan.save(); // Save the updated plan
    } else {
      // Create a new plan if it doesn't exist
      console.log('Creating new plan for email:', email);
      const newPlan = new Plan({
        email,
        dietPlan,
        workoutPlan,
        dietMacros,
      });
      await newPlan.save(); // Save the new plan
    }

    // Respond immediately to the user
    console.log('Responding to the user...');
    res.status(201).json({ message: 'Plan saved successfully.' });

  } catch (error) {
    console.error('Error saving plan:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { savePlan };
