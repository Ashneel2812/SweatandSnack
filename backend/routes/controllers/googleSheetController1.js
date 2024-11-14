const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const path = require('path');

// Load client secrets from a local file.
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

const createGoogleSheet = async (req, res) => {
  try{
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });

    const {email,workoutPlan}=req.body

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Create a new spreadsheet with the name "Workout Plan - email"
    const resource = {
      properties: {
        title: `Workout Plan - ${email}`,
      },
      sheets: [
        {
          properties: {
            title: 'Workout',
          },
        },
      ],
    };

    const spreadsheet = await sheets.spreadsheets.create({ resource });
    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // Prepare data for the sheet
    const values = [['Day', 'Session', 'Exercise', 'Sets', 'Reps', 'Tempo', 'Performance Notes', 'Date']];

    // Convert the workoutPlan object to an array
    Object.keys(workoutPlan).forEach((day, index) => {
      const dayData = workoutPlan[day];
      
      // Add the session row with highlight
      values.push([`Day ${index + 1}`, dayData.session, '', '', '', '', '', '']); 

      // Add the exercises under the session, leaving 'Performance Notes' and 'Date' empty for user input
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
        role: 'writer', // 'reader' for view-only, 'writer' for edit access
        type: 'user',   // sharing with a specific user
        emailAddress: email, // the email address to share with
      },
      sendNotificationEmail: false,
    });

    // Send the link to the user via email
    await sendEmail(email, spreadsheetId);
    res.status(201).json({ message: 'Google Sheet saved successfully and email sent!' });
  } 
  catch (error) {
    console.error('Error saving plan or sending email:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const sendEmail = async (email, spreadsheetId) => {
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
      
      In case of any queries , send an email to :sweatandsnack2024@gmail.com
      `,
      attachments: [
        {
          filename: 'Sample_Sheet.png', // Name of the file as it will appear in the email
          path: path.join(__dirname, '../google_sheet_sample.png'), // Adjust the path to your image
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  

};

module.exports = { createGoogleSheet };