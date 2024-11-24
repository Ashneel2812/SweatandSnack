
const express = require('express');
const cors = require('cors');
const { Queue } = require('bullmq');  // Import from bullmq
// const { createBullBoard } = require('@bull-board/api');
// const { BullMQAdapter } = require('@bull-board/api/bullmqAdapter');  // Use BullMQAdapter
// const { ExpressAdapter } = require('@bull-board/express');
// const { Worker } = require('bullmq');
// const { v4: uuidv4 } = require('uuid');
// const mongoose = require('mongoose');
const questionnaireRoutes = require('./routes/questionarrieRoutes');
const regenerateRoutes = require('./routes/regenerateRoutes');
const planRoutes = require('./routes/planRoutes');
const googleSheetRoutes = require('./routes/googleSheetRoutes');
const jobStatusRoutes= require('./routes/jobStatusRoutes')
const redis = require('redis');

const app = express();
const PORT = 5000;
const allowedOrigins = 'https://www.sweatandsnack.vercel.app'; // Frontend domain
// const allowedOrigins= 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigins, // Allow only your frontend domain
  methods: ['GET', 'POST', 'OPTIONS'], // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow specific headers
  credentials: true, // If you're using cookies, enable this
}));
// app.use(cors());


const client ={
  redis:{
  host: process.env.REDIS_HOST||'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: process.env.REDIS_PORT||10776,
  password: process.env.REDIS_PWD||'8Mkxhn4ZLd6x3I5vJzwAmeQJB8lsqNja'
},
};
app.use(express.json());

// BullMQ Queue
const jobQueue = new Queue('generatePlan', client);


jobQueue.on('ready', () => {
  console.log('Queue is connected and ready to use');
});

jobQueue.on('error', (err) => {
  console.error('Error with the job queue:', err);
});
console.log('Queue "generatePlan" created and connected to Redis');

// Create Bull Board
  // const serverAdapter = new ExpressAdapter();
  // serverAdapter.setBasePath('/admin/queues');
  // createBullBoard({
  //   queues: [new BullMQAdapter(jobQueue)],  // Use BullMQAdapter
  //   serverAdapter,
  // });

  // app.use('/admin/queues', serverAdapter.getRouter());
  // console.log('Bull Board is set up at /admin/queues');

app.use('/api', questionnaireRoutes);
app.use('/api', regenerateRoutes);
app.use('/api', planRoutes);
app.use('/api', googleSheetRoutes);
app.use('/api',jobStatusRoutes);




// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Bull Dashboard available at http://localhost:${PORT}/admin/queues`);
});


