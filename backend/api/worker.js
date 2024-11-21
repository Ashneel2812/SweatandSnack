// Import necessary modules
const Queue = require('bull');
const { OpenAI } = require('openai');
const { generatePlans } = require('../routes/controllers/questionarrieSubmit');
const { regeneratePlanLogic } = require('../routes/controllers/regeneratePlan'); // Import regeneratePlans function from regeneratePlan.js

// Initialize queues for both jobs
const jobQueue = new Queue('generatePlan', {
  redis:{
    url: process.env.REDIS_URL,
    // port: 10776,
    // host: 'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
    // password: '8Mkxhn4ZLd6x3I5vJzwAmeQJB8lsqNja',
    tls: {
        rejectUnauthorized: false, // Add this line to handle self-signed certificates
        servername: 'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com'
      },
    connectTimeout: 4000, // Set timeout to 10 seconds (default is 1000ms)
  }
  });


// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: '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',
});

console.log('Initializing workers...');

// Worker 1: Process `generatePlan` jobs
jobQueue.process('generatePlan', async (job) => {
  console.log(`Processing job: ${job.id}, Type: ${job.name}`);
  
  try {
    const { formData, feedback, jobId, aiGeneratedPlan } = job.data;

    if (!formData) {
      throw new Error('No form data provided in job');
    }

    // Check if feedback exists to decide whether to regenerate or generate the plan
    let result;
    if (feedback) {
      // If feedback exists, call the regeneratePlan function
      console.log(`Feedback found. Regenerating plan for job: ${job.id}`);
      result = await regeneratePlanLogic(formData, feedback, aiGeneratedPlan);
    } else {
      // If no feedback, call the generatePlans function
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
    const waitingJobsGeneratePlan = await jobQueue.getWaiting();
    const activeJobsGeneratePlan = await jobQueue.getActive();
    const completedJobsGeneratePlan = await jobQueue.getCompleted();

    
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
