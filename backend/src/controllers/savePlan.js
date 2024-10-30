require('dotenv').config();
const nodemailer = require('nodemailer');
const Plan = require('../models/Plan');

const savePlan = async (req, res) => {
  try {
    const { email, dietPlan, workoutPlan, dietMacros } = req.body;

    if (!email || !dietPlan || !workoutPlan || !dietMacros) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if a plan with the given email already exists
    const existingPlan = await Plan.findOne({ email });

    if (existingPlan) {
      // Update the existing plan
      existingPlan.dietPlan = dietPlan;
      existingPlan.workoutPlan = workoutPlan;
      existingPlan.dietMacros = dietMacros;

      await existingPlan.save(); // Save the updated plan
    } else {
      // Create a new plan if it doesn't exist
      const newPlan = new Plan({
        email,
        dietPlan,
        workoutPlan,
        dietMacros
      });

      await newPlan.save(); // Save the new plan
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'iashneel@gmail.com',
        pass: 'xdga zgbn pcst aqnx'
      }
    });

    const mailOptions = {
      from: 'iashneel@gmail.com',
      to: email,
      subject: 'Your Diet and Workout Plan',
      html: `
  <h1>Your Plan Has Been Saved Successfully!</h1>
  <h2>Here are the details:</h2>
  
  <h3>Diet Plan:</h3>
  <ul>
    ${Object.entries(dietPlan).map(([day, meals]) => `
      <li>
        <strong>${day.replace('_', ' ')}</strong>
        <ul>
          ${Object.entries(meals).map(([mealKey, meal]) => `
            <li>
              <strong>${meal.meal_name}</strong>: ${meal.calories} calories
              <br>
              <strong>Macros:</strong> Protein: ${meal.macros.protein}, Carbs: ${meal.macros.carbs}, Fats: ${meal.macros.fats}
              <br>
              <strong>Recipe:</strong> ${meal.recipe}
            </li>
          `).join('')}
        </ul>
      </li>
    `).join('')}
  </ul>
  
  <h3>Workout Plan:</h3>
  <ul>
    ${Object.entries(workoutPlan).map(([day, workout]) => `
      <li>
        <strong>${day.replace('_', ' ')} - ${workout.session}</strong>
        <ul>
          ${workout.exercises.map(exercise => `
            <li>
              <strong>${exercise.exercise}</strong>: ${exercise.sets} sets x ${exercise.reps} reps (Tempo: ${exercise.tempo})
            </li>
          `).join('')}
        </ul>
      </li>
    `).join('')}
  </ul>
  
  <h3>Diet Macros:</h3>
  <p>Total Calories Needed: ${dietMacros.total_calories_needed}</p>
  <p>Protein: ${dietMacros.macronutrients.protein}</p>
  <p>Carbohydrates: ${dietMacros.macronutrients.carbohydrates}</p>
  <p>Fats: ${dietMacros.macronutrients.fats}</p>
  
  <p>Have a look at the tempo , sets and reps in order to achieve more from the workout plan.</p>
  <p>In case of any queries , send an email to :sweatandsnack2024@gmail.com</p>
  <p>Thank you for using our service!</p>
`


    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    res.status(201).json({ message: 'Plan saved successfully and email sent!' });
  } catch (error) {
    console.error('Error saving plan or sending email:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { savePlan };
