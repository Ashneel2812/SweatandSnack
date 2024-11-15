require('dotenv').config();
const nodemailer = require('nodemailer');
const Bull = require('bull');

// Define Redis queues for sending email
const sendEmailQueue = new Bull('send-email-save-plan', {
  redis: {
    host: 'redis-12299.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 12299,
    password: 'zzf1j363kjzlys8XAaCB1CljmOwS2Iwt',
    maxClients: 10000,
  },
  settings: {
    retries: 5, // Number of retry attempts for sending email
    backoff: 5000, // 5 seconds backoff between retries
  },
});

// Function to send the email (this function will be triggered when needed)
const savePlan = async (req, res) => {
  try {
    console.log('Received request to send email...');

    const { email, dietPlan, workoutPlan, dietMacros } = req.body;

    // Log input for debugging
    console.log('Request body:', { email, dietPlan, workoutPlan, dietMacros });

    // Check for missing required fields
    if (!email || !dietPlan || !workoutPlan || !dietMacros) {
      console.log('Error: Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
    emailBody += `<p>In case of any queries, send an email to: sweatandsnack2024@gmail.com</p>`;
    emailBody += `<p>Thank you for using our service!</p>`;

    console.log('Adding job to sendEmailQueue...');
    // Add the send email job to the sendEmailQueue
    await sendEmailQueue.add('send-email-save-plan', {
      email,
      emailBody,
    });

    console.log('Job added to sendEmailQueue.');

    // Respond immediately to the user
    res.status(201).json({ message: 'Email will be sent shortly.' });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

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
        user: process.env.EMAIL_USER || 'iashneel@gmail.com',  // Your email
        pass: process.env.EMAIL_PASSWORD || 'xdga zgbn pcst aqnx',  // App-specific password or regular password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'iashneel@gmail.com',
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
