const Queue = require('bull');

const jobQueue = new Queue('generatePlan', {
  port: 10776,
  host: 'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
  password: '8Mkxhn4ZLd6x3I5vJzwAmeQJB8lsqNja',
  tls: {
      rejectUnauthorized: false, // Add this line to handle self-signed certificates
      servername: 'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com'
    },
  settings: {
    connectTimeout: 4000, // Set timeout to 10 seconds (default is 1000ms)
  }
});

// Function to handle job status request
const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log(`Received request for job status with jobId: ${jobId}`);

    // Retrieve all waiting, active, and completed jobs from the queue
    console.log('Retrieving jobs from the queue...');
    const waitingJobs = await jobQueue.getJobs(['waiting']);
    const activeJobs = await jobQueue.getJobs(['active']);
    const completedJobs = await jobQueue.getJobs(['completed']);
    const failedJobs = await jobQueue.getJobs(['failed']);
    console.log(`Retrieved ${waitingJobs.length} waiting jobs, ${activeJobs.length} active jobs, ${completedJobs.length} completed jobs, and ${failedJobs.length} failed jobs`);

    let matchedJob = null;

    // Check for the job in waiting jobs
    console.log('Searching for the job in the waiting queue...');
    waitingJobs.forEach(job => {
      if (job.data?.jobId === jobId) {
        matchedJob = job;  // If a match is found, store the job
        console.log(`Found matching job in waiting queue: ID - ${job.id}, Job Data - ${JSON.stringify(job.data)}`);
      }
    });

    // Check for the job in active jobs if not found in waiting jobs
    if (!matchedJob) {
      console.log('Job not found in waiting queue, searching in the active queue...');
      activeJobs.forEach(job => {
        if (job.data?.jobId === jobId) {
          matchedJob = job;  // If a match is found, store the job
          console.log(`Found matching job in active queue: ID - ${job.id}, Job Data - ${JSON.stringify(job.data)}`);
        }
      });
    }

    // If no matching job was found in waiting or active jobs, check completed jobs
    if (!matchedJob) {
      console.log('Job not found in waiting or active queues, searching in the completed queue...');
      completedJobs.forEach(job => {
        if (job.data?.jobId === jobId) {
          matchedJob = job;  // If a match is found, store the job
          console.log(`Found matching job in completed queue: ID - ${job.id}, Job Data - ${JSON.stringify(job.data)}`);
        }
      });
    }

    // If no matching job was found in any queue, return an error
    if (!matchedJob) {
      console.log(`Job with ID ${jobId} not found in any queue.`);
      return res.status(404).json({ error: `Job with ID ${jobId} not found in the queue` });
    }

    // Poll the job status until it is either completed or failed
    const waitForJobCompletion = async (job) => {
      const pollingInterval = 5000; // 5 seconds
      let jobStatus = await jobQueue.getJob(job.id);
      console.log(`Polling for job with ID ${job.id}...`);

      // Continue polling the job status until it is finished or failed
      while (jobStatus && !jobStatus.finishedOn && !jobStatus.isFailed()) {
        console.log(`Job with ID ${job.id} is still in progress. Checking again...`);
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
        jobStatus = await jobQueue.getJob(job.id);
      }

      // If job has completed or failed, return the final status
      console.log(`Polling complete for job with ID ${job.id}. Final status: ${jobStatus.finishedOn ? 'completed' : jobStatus.isFailed() ? 'failed' : 'in-progress'}`);
      return jobStatus;
    };

    // Wait for the job to complete or fail
    console.log('Waiting for job completion...');
    const completedJob = await waitForJobCompletion(matchedJob);

    // Check if job has completed or failed
    if (completedJob.finishedOn || completedJob.isFailed()) {
      console.log(`Job with ID ${completedJob.id} has finished with status: ${completedJob.finishedOn ? 'completed' : 'failed'}`);

      // Only construct the job status if the job has finished or failed
      const jobStatus = {
        id: completedJob.id,
        status: completedJob.finishedOn ? 'completed' : completedJob.isFailed() ? 'failed' : 'in-progress',
        result: completedJob.finishedOn ? completedJob.returnvalue : null, // If completed, return the result
        failedReason: completedJob.failedReason || null, // If failed, return the failure reason
      };

      return res.status(200).json(jobStatus);
    } else {
      console.log(`Job with ID ${matchedJob.id} is still in progress.`);
      // If job is still in progress, return a message indicating it is still being processed
      return res.status(200).json({
        id: matchedJob.id,
        status: 'in-progress',
        message: 'Job is still being processed. Please wait.',
      });
    }

  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
};

module.exports = { getJobStatus };
