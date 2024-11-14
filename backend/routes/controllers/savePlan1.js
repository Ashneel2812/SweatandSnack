require('dotenv').config();
const nodemailer = require('nodemailer');
const Plan = require('../models/Plan');

const savePlan = async (req, res) => {
  try {
    const { email, dietPlan, workoutPlan, dietMacros } = req.body;

    console.log(email);
    console.log(dietPlan);
    console.log(workoutPlan);
    console.log(dietMacros);

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
        pass: 'xdga zgbn pcst aqnx' // Use environment variables for security
      }
    });

    // Construct the email body
    let emailBody = `<h1>Your Plan Has Been Saved Successfully!</h1>`;
    emailBody += `<h2>Here are the details:</h2>`;
    
    // Diet Plan
    emailBody += `<h3>Diet Plan:</h3>`;
    for (const day in dietPlan) {
      emailBody += `<h4>${day.replace('_', ' ')}</h4>`;
      for (const mealKey in dietPlan[day]) {
        const meal = dietPlan[day][mealKey];
        emailBody += `
          <p><strong>${meal.meal_name}</strong>: ${meal.calories} calories<br>
          <strong>Macros:</strong> Protein: ${meal.macros.protein}, Carbs: ${meal.macros.carbs}, Fats: ${meal.macros.fats}<br>
          <strong>Recipe:</strong> ${meal.recipe}</p>
        `;
      }
    }

    // Workout Plan
    emailBody += `<h3>Workout Plan:</h3>`;
    for (const day in workoutPlan) {
      emailBody += `<h4>${day.replace('_', ' ')}</h4>`;
      const workout = workoutPlan[day];
      emailBody += `<p><strong>Session:</strong> ${workout.session}</p>`;
      workout.exercises.forEach(exercise => {
        emailBody += `<p><strong>${exercise.exercise}</strong>: ${exercise.sets} sets x ${exercise.reps} reps (Tempo: ${exercise.tempo})</p>`;
      });
    }

    // Diet Macros
    emailBody += `<h3>Diet Macros:</h3>`;
    emailBody += `<p>Total Calories Needed: ${dietMacros.total_calories_needed}</p>`;
    emailBody += `<p>Protein: ${dietMacros.macronutrients.protein}</p>`;
    emailBody += `<p>Carbohydrates: ${dietMacros.macronutrients.carbohydrates}</p>`;
    emailBody += `<p>Fats: ${dietMacros.macronutrients.fats}</p>`;

    // Closing remarks
    emailBody += `<p>Have a look at the tempo, sets, and reps in order to achieve more from the workout plan.</p>`;
    emailBody += `<p>In case of any queries, send an email to: sweatandsnack2024@gmail.com</p>`;
    emailBody += `<p>Thank you for using our service!</p>`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'iashneel@gmail.com',
      to: email,
      subject: 'Your Diet and Workout Plan',
      html: emailBody,
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