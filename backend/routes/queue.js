// queue.js (BullMQ version)
const { Queue, Worker } = require('bullmq');
const nodemailer = require('nodemailer');

// Create a new BullMQ queue (with Redis config)
const emailQueue = new Queue('emailQueue', {
  redis: {
    host: 'redis-12299.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 12299,
    password: 'zzf1j363kjzlys8XAaCB1CljmOwS2Iwt',
  }
});

// Define a worker for processing email jobs
const worker = new Worker('emailQueue', async job => {
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
}, {
  // Optionally, add concurrency control
  concurrency: 5, // Max number of jobs processed simultaneously
  limiter: {
    groupKey: 'emailQueue',
    max: 5, // Max number of emails to send per second
    duration: 1000, // Per second
  }
});

module.exports = emailQueue;
