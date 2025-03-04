const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const path = require('path');
const Bull = require('bull');
const Redis = require('ioredis'); // Import ioredis to manage the Redis connection

// Define Redis configuration
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST||'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
  // port: process.env.REDIS_PORT||10776,
  // password: process.env.REDIS_PWD||'8Mkxhn4ZLd6x3I5vJzwAmeQJB8lsqNja',
  settings: {
    connectTimeout: 4000, // Set timeout to 10 seconds (default is 1000ms)
  }
};

// Create a Redis connection using ioredis
const redis = new Redis(REDIS_CONFIG);

// Define the Bull queue for Google Sheet creation
const createGoogleSheetQueue = new Bull('create-google-sheet', {
  redis: REDIS_CONFIG, // Pass the Redis connection details to the Bull queue
});

// Define the Bull queue for sending emails
const sendEmailQueue = new Bull('send-email', {
  redis: REDIS_CONFIG, // Pass the Redis connection details to the Bull queue
});

// Path to credentials and other constants
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

// Function to add Google Sheets creation job to the Redis queue
const createGoogleSheet = async (req, res) => {
  try {
    const { email, workoutPlan } = req.body;
    console.log('Received request for creating Google Sheet:', { email, workoutPlan });

    // Add a job to the queue to process Google Sheet creation asynchronously
    const job = await createGoogleSheetQueue.add('create-sheet', {
      email,
      workoutPlan,
    });

    console.log('Job added to createGoogleSheetQueue with ID:', job.id);

    // Return response immediately while the job is processed in the background
    res.status(201).json({ message: 'Your request is being processed. You will be notified via email.' });
  } catch (error) {
    console.error('Error queuing job for Google Sheet creation:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Worker to process the job of creating Google Sheets
createGoogleSheetQueue.process('create-sheet', async (job) => {
  try {
    console.log('Processing job in createGoogleSheetQueue:', job.id);
    const { email, workoutPlan } = job.data;
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    console.log('Google Auth and Sheets API initialized.');

    // Create a new spreadsheet with the name "Workout Plan - email"
    const resource = {
      properties: {
        title: `Workout Plan - ${email}`,
      },
      sheets: [{ properties: { title: 'Workout' } }],
    };

    const spreadsheet = await sheets.spreadsheets.create({ resource });
    const spreadsheetId = spreadsheet.data.spreadsheetId;

    console.log(`Google Sheet created successfully. Spreadsheet ID: ${spreadsheetId}`);

    // Prepare data for the sheet
    const values = [['Day', 'Session', 'Exercise', 'Sets', 'Reps', 'Tempo', 'Performance Notes', 'Date']];
    Object.keys(workoutPlan).forEach((day, index) => {
      const dayData = workoutPlan[day];
      values.push([`Day ${index + 1}`, dayData.session, '', '', '', '', '', '']);
      dayData.exercises.forEach((exercise) => {
        values.push(['', '', exercise.exercise, exercise.sets, exercise.reps, exercise.tempo, '', '']);
      });
    });

    console.log('Workout plan data prepared for Google Sheet.');

    // Update the spreadsheet with the workout data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Workout!A1',
      valueInputOption: 'RAW',
      resource: { values },
    });

    console.log('Google Sheet updated with workout plan data.');

    // Set permissions to share the sheet with the specific email
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: email,
      },
      sendNotificationEmail: false,
    });

    console.log(`Permissions set to share the Google Sheet with ${email}`);

    // Add the send email job to the Bull queue
    await sendEmailQueue.add('send-email', {
      email,
      spreadsheetId,
    });

    console.log('Job added to sendEmailQueue to send email.');
  } catch (error) {
    console.error('Error in creating Google Sheet job:', error);
    throw new Error('Error creating Google Sheet');
  }
});

// Worker to handle sending email after Google Sheet is created
sendEmailQueue.process('send-email', async (job) => {
  try {
    console.log('Processing job in sendEmailQueue:', job.id);
    const { email, spreadsheetId } = job.data;
    console.log('Sending email to:', email, 'with Spreadsheet ID:', spreadsheetId);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'sweatandsnack2024@gmail.com',  // Your email
        pass: process.env.EMAIL_PASSWORD || 'dipg naah huny fjrv',  // App-specific password or regular password
      },
    });

    const mailOptions = {
      from: 'sweatandsnack2024@gmail.com',
      to: email,
      subject: 'Your Workout Tracker',
      text: `Your workout plan has been created! You can access it here: https://docs.google.com/spreadsheets/d/${spreadsheetId}
      Things to keep in mind before using the Google Sheet attached in this mail:
      1. The reps need not be exact, it is just a depiction of how many reps are advised for that exercise and anything less than those reps is a clear sign to decrease the weight.
      2. Performance Notes gives a clear indication of how the workout was and it can be used to keep a few things in mind before the next workout.
      3. The image attached shows how to log the data in order to track the progress.
      4. In case the Google Sheet is asking for permission, change the Google account to which you requested the Google Sheet.
      
      In case of any queries, send an email to: sweatandsnack2024@gmail.com`,
      attachments: [
        {
          filename: 'Sample_Sheet.png', 
          path: path.join(__dirname, '../google_sheet_sample.png'), 
        },
      ],
    };

    console.log('Attempting to send email...');
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
});

// Export the function for use elsewhere in the app
module.exports = { createGoogleSheet };
