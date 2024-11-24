require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');  // Assuming this file contains your Plan model
const nodemailer = require('nodemailer');
const Bull = require('bull');
const path = require('path');

// Define Redis queues for saving plans and sending emails with unique names
const savePlanQueue = new Bull('save-plan', {
  redis: {
    host: 'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 10776,
    password: '8Mkxhn4ZLd6x3I5vJzwAmeQJB8lsqNja',
    settings: {
      connectTimeout: 4000, // Set timeout to 10 seconds (default is 1000ms)
    }// 5 seconds backoff between retries
  },
});

const sendEmailQueue = new Bull('send-email-save-plan', {  // Changed queue name
  redis: {
    host: 'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 10776,
    password: '8Mkxhn4ZLd6x3I5vJzwAmeQJB8lsqNja',
    settings: {
      connectTimeout: 4000, // Set timeout to 10 seconds (default is 1000ms)
    } // Number of retry attempts for sending email
  },
});


// Function to establish MongoDB connection
const connectMongoDB = async () => {
  try {
    // Check if the database connection is already established
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected successfully');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

// Function to save plan and enqueue the email job
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

    // Ensure MongoDB connection is established
    await connectMongoDB();

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

    // Add a job to the savePlanQueue to process the email after saving the plan
    console.log('Adding job to savePlanQueue...');
    const job = await savePlanQueue.add('save-plan', {
      email,
      dietPlan,
      workoutPlan,
      dietMacros,
    });
    console.log('Job added to savePlanQueue:', job.id);

    // Respond immediately to the user
    console.log('Responding to the user...');
    res.status(201).json({ message: 'Plan saved successfully. Email will be sent shortly.' });

  } catch (error) {
    console.error('Error saving plan:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Process the "save-plan" job in the queue
savePlanQueue.process('save-plan', async (job) => {
  try {
    console.log(`Processing job in savePlanQueue: ${job.id}...`);

    const { email, dietPlan, workoutPlan, dietMacros } = job.data;

    // Generate the email body HTML
    console.log('Generating email body...');
    let emailBody = `<h1>Your Plan Has Been Saved Successfully!</h1>`;
    emailBody += `<h2>Here are the details:</h2>`;

    // Add Diet Plan to the email body
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

    // Add Workout Plan to the email body
    emailBody += `<h3>Workout Plan:</h3>`;
    for (const day in workoutPlan) {
      emailBody += `<h4>${day.replace('_', ' ')}</h4>`;
      const workout = workoutPlan[day];
      emailBody += `<p><strong>Session:</strong> ${workout.session}</p>`;
      workout.exercises.forEach(exercise => {
        emailBody += `<p><strong>${exercise.exercise}</strong>: ${exercise.sets} sets x ${exercise.reps} reps (Tempo: ${exercise.tempo})</p>`;
      });
    }

    // Add Diet Macros to the email body
    emailBody += `<h3>Diet Macros:</h3>`;
    emailBody += `<p>Total Calories Needed: ${dietMacros.total_calories_needed}</p>`;
    emailBody += `<p>Protein: ${dietMacros.macronutrients.protein}</p>`;
    emailBody += `<p>Carbohydrates: ${dietMacros.macronutrients.carbohydrates}</p>`;
    emailBody += `<p>Fats: ${dietMacros.macronutrients.fats}</p>`;

    // Closing remarks
    emailBody += `<p>Have a look at the tempo, sets, and reps in order to achieve more from the workout plan.</p>`;
    emailBody += `<p>We suggest you to use these recipes inorder to make a perfect diet plan.</p>`;
    emailBody += `<p>In case of any queries, send an email to: sweatandsnack2024@gmail.com</p>`;
    emailBody += `<p>Thank you for using our service!</p>`;

    console.log('Adding job to sendEmailQueue...');
    // Add the send email job to the sendEmailQueue
    await sendEmailQueue.add('send-email-save-plan', {
      email,
      emailBody,
    });

    console.log('Job added to sendEmailQueue.');
  } catch (error) {
    console.error('Error processing save-plan job:', error);
    throw new Error('Error processing save-plan job');
  }
});

// Process the "send-email" job in the queue
sendEmailQueue.process('send-email-save-plan', async (job) => {
  try {
    console.log(`Processing email send job in sendEmailQueue: ${job.id}...`);

    const { email, emailBody } = job.data;

    // Configure the email transporter (using Gmail for example)
    console.log('Configuring email transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'sweatandsnack2024@gmail.com',  // Your email
        pass: process.env.EMAIL_PASSWORD || 'dipg naah huny fjrv',  // App-specific password or regular password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Diet and Workout Plan',
      html: emailBody,
    };

    console.log('Sending email...');
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    throw new Error(`Error sending email: ${error.message}`);
  } finally {
    // Ensure Redis client is closed after job is processed
    console.log('Closing sendEmailQueue...');
    sendEmailQueue.close();
  }
});

module.exports = { savePlan };
