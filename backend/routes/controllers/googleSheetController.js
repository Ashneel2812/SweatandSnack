const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const path = require('path');
const Bull = require('bull');
const { Queue, Worker } = require('bullmq');

// Define a Redis queue for processing emails and sheet creation
const createGoogleSheetQueue = new Bull('create-google-sheet', {
  redis: { host: 'redis-12299.c212.ap-south-1-1.ec2.redns.redis-cloud.com', port: 12299 , password: 'zzf1j363kjzlys8XAaCB1CljmOwS2Iwt'  ,maxClients: 10000}, // Update Redis connection details as needed
});

const sendEmailQueue = new Bull('send-email', {
  redis: { host: 'redis-12299.c212.ap-south-1-1.ec2.redns.redis-cloud.com', port: 12299 , password: 'zzf1j363kjzlys8XAaCB1CljmOwS2Iwt' ,maxClients: 10000 }, // Update Redis connection details as needed
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
    
    // Add a job to the queue to process Google Sheet creation asynchronously
    const job = await createGoogleSheetQueue.add('create-sheet', {
      email,
      workoutPlan,
    });

    // Return response immediately while the job is processed in the background
    res.status(201).json({ message: 'Your request is being processed. You will be notified via email.' });
  } catch (error) {
    console.error('Error queuing job for Google Sheet creation:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Function to handle the job of creating Google Sheet and sending the email
createGoogleSheetQueue.process('create-sheet', async (job) => {
  try {
    const { email, workoutPlan } = job.data;
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Create a new spreadsheet with the name "Workout Plan - email"
    const resource = {
      properties: {
        title: `Workout Plan - ${email}`,
      },
      sheets: [{ properties: { title: 'Workout' } }],
    };

    const spreadsheet = await sheets.spreadsheets.create({ resource });
    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // Prepare data for the sheet
    const values = [['Day', 'Session', 'Exercise', 'Sets', 'Reps', 'Tempo', 'Performance Notes', 'Date']];
    Object.keys(workoutPlan).forEach((day, index) => {
      const dayData = workoutPlan[day];
      values.push([`Day ${index + 1}`, dayData.session, '', '', '', '', '', '']);
      dayData.exercises.forEach((exercise) => {
        values.push(['', '', exercise.exercise, exercise.sets, exercise.reps, exercise.tempo, '', '']);
      });
    });

    // Update the spreadsheet with the workout data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Workout!A1',
      valueInputOption: 'RAW',
      resource: { values },
    });

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

    // Add the send email job to the queue
    await sendEmailQueue.add('send-email', {
      email,
      spreadsheetId,
    });
  } catch (error) {
    console.error('Error in creating Google Sheet job:', error);
    throw new Error('Error creating Google Sheet');
  }
});

// Function to handle sending email after Google Sheet is created
sendEmailQueue.process('send-email', async (job) => {
  try {
    const { email, spreadsheetId } = job.data;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'iashneel@gmail.com', // Your email
        pass: 'djgn lkrx ugtp bjgm', // Your email password or app password
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
      4.In case the google sheet is asking for permission , change the google account to which you requested the google sheet.
      
      In case of any queries , send an email to :sweatandsnack2024@gmail.com`,
      attachments: [
        {
          filename: 'Sample_Sheet.png', 
          path: path.join(__dirname, '../google_sheet_sample.png'), 
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
});

module.exports = { createGoogleSheet };
