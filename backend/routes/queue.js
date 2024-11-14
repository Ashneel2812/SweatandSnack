// queue.js
const Bull = require('bull');
const nodemailer = require('nodemailer');

// Create a new Bull queue
const emailQueue = new Bull('emailQueue', {
  redis: { host: 'redis-12299.c212.ap-south-1-1.ec2.redns.redis-cloud.com', port: 12299 , password: 'zzf1j363kjzlys8XAaCB1CljmOwS2Iwt' ,maxClients: 100 }, // Redis server connection
});

// Define a job processor for sending emails
emailQueue.process(async (job) => {
  const { email, emailBody } = job.data;

  // Configure the email transporter (using Gmail here for example)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'iashneel@gmail.com', // Email address
      pass: process.env.EMAIL_PASSWORD || 'xdga zgbn pcst aqnx', // Your email password or app-specific password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER || 'iashneel@gmail.com',
    to: email,
    subject: 'Your Diet and Workout Plan',
    html: emailBody,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    throw new Error(`Error sending email: ${error.message}`);
  }
});

// Optionally, you can add job events such as completion, failed jobs, etc.
emailQueue.on('completed', (job, result) => {
  console.log(`Job completed for email: ${job.data.email}`);
});

emailQueue.on('failed', (job, error) => {
  console.error(`Job failed for email: ${job.data.email}`, error);
});

module.exports = emailQueue;
