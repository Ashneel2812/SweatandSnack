// queue.js (BullMQ version)
const { Queue, Worker } = require('bullmq');
const nodemailer = require('nodemailer');

// Create a new BullMQ queue (with Redis config)
const emailQueue = new Queue('emailQueue', {
  redis: {
    host: process.env.REDIS_HOST||'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: process.env.REDIS_PORT||10776,
    password: process.env.REDIS_PWD||'8Mkxhn4ZLd6x3I5vJzwAmeQJB8lsqNja',
    settings: {
      connectTimeout: 4000, // Set timeout to 10 seconds (default is 1000ms)
    }
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
