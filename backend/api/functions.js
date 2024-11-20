// Import necessary modules
const cors = require('cors');
const Queue = require('bull');
const { OpenAI } = require('openai');
const { submitQuestionnaire } = require('../routes/controllers/questionarrieSubmit');
const { createGoogleSheet } = require('../routes/controllers/googleSheetController');
const { regeneratePlan } = require('../routes/controllers/regeneratePlan');
const { savePlan } = require('../routes/controllers/savePlan');
const {getJobStatus} = require('../routes/controllers/jobStatusController')
const { generatePlans } = require('../routes/controllers/questionarrieSubmit');
const { regeneratePlanLogic } = require('../routes/controllers/regeneratePlan'); // Import regeneratePlans function from regeneratePlan.js

app.use(cors());

// OR Configure CORS for specific routes or origins
app.use(cors({
  origin: 'https://sweatand-snack.vercel.app', // allow requests only from specific origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // specify allowed headers
}));

// Initialize Redis connection and Bull queues
const queueGeneratePlan = new Queue('generatePlan', {
  host: 'redis-12299.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 12299,
  password: 'zzf1j363kjzlys8XAaCB1CljmOwS2Iwt',
});


console.log('Initializing workers...');

// Worker to process `generatePlan` jobs
queueGeneratePlan.process('generatePlan', async (job) => {
  console.log(`Processing job: ${job.id}, Type: ${job.name}`);
  
  try {
    const { formData, feedback, jobId, aiGeneratedPlan } = job.data;

    if (!formData) {
      throw new Error('No form data provided in job');
    }

    // Check if feedback exists to decide whether to regenerate or generate the plan
    let result;
    if (feedback) {
      console.log(`Feedback found. Regenerating plan for job: ${job.id}`);
      result = await regeneratePlanLogic(formData, feedback, aiGeneratedPlan);
    } else {
      console.log(`No feedback found. Generating new plan for job: ${job.id}`);
      result = await generatePlans(formData);
    }

    console.log(`Job ${job.id} completed successfully.`);
    return { status: 'success', plan: result };
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    throw error;
  }
});

// Monitor the queue status for both queues
async function monitorQueue() {
  try {
    const waitingJobsGeneratePlan = await queueGeneratePlan.getWaiting();
    const activeJobsGeneratePlan = await queueGeneratePlan.getActive();
    const completedJobsGeneratePlan = await queueGeneratePlan.getCompleted();

    console.log('\nQueue Monitor Status:');
    console.log('--- generatePlan Queue ---');
    console.log('Waiting Jobs:', waitingJobsGeneratePlan.length);
    console.log('Active Jobs:', activeJobsGeneratePlan.length);
    console.log('Completed Jobs:', completedJobsGeneratePlan.length);
  } catch (error) {
    console.error('Error monitoring queues:', error);
  }
}

// Monitor the queues every 5 seconds
setInterval(monitorQueue, 5000);

// Handle error events
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

console.log('Worker initialization complete');

// Main function to handle routes and API requests
module.exports = async (req, res) => {
  if (req.method === 'POST' && req.url.includes('submit-questionnaire')) {
    try {
      await submitQuestionnaire(req, res);
    } catch (error) {
      res.status(500).json({ error: 'Error in submitting questionnaire.', details: error.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url.includes('generate-sheet')) {
    try {
      await createGoogleSheet(req, res);
      console.log('Google Sheet created and email sent successfully');
      res.status(200).json({ message: 'Google Sheet created and sent to your email!' });
    } catch (error) {
      console.error('Error in creating Google Sheet:', error);
      res.status(500).json({ error: 'Error in creating Google Sheet.', details: error.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url.includes('regenerate-plan')) {
    try {
      await regeneratePlan(req, res);
    } catch (error) {
      res.status(500).json({ error: 'Error in regenerating plan.', details: error.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url.includes('email-plan')) {
    try {
      await savePlan(req, res);
    } catch (error) {
      res.status(500).json({ error: 'Error in saving plan.', details: error.message });
    }
    return;
  }

  if (req.method === 'GET' && req.url.includes('job-status')) {
    try {
      await getJobStatus(req, res); // Call the job status controller
    } catch (error) {
      res.status(500).json({ error: 'Error fetching job status.', details: error.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};
