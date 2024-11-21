const { OpenAI } = require('openai');
const Queue = require('bull');
const { v4: uuidv4 } = require('uuid'); // For generating unique job ID

const openai = new OpenAI({
  apiKey: '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'
});

// Initialize Bull Queue for Regenerate Plan
const queueRegeneratePlan = new Queue('regeneratePlan', {
  host: 'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 10776,
  password: '8Mkxhn4ZLd6x3I5vJzwAmeQJB8lsqNja',
  settings: {
    connectTimeout: 4000, // Set timeout to 10 seconds (default is 1000ms)
  }
});

const jobQueue = new Queue('generatePlan', {
  redis:{
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
  }
  });

const regeneratePlanLogic = async (formData, feedback, aiGeneratedPlan) => {


    console.log('Received formData:', formData);
    console.log('Received feedback:', feedback);
    console.log('Received previous plan:', aiGeneratedPlan);

    const prompt = `
      You are an expert fitness and nutrition AI assistant. Your task is to regenerate a personalized diet and workout plan based on the user's feedback and their previous plan. Focus on addressing the specific concerns raised in the feedback while maintaining the overall structure and goals of the original plan.

      Previous plan:
      ${JSON.stringify(aiGeneratedPlan)}

      User feedback:
      "${feedback}"

      Personal Information:
      ${JSON.stringify(formData)}

      Instructions:
      1. Review the previous plan and make targeted adjustments to address the feedback while keeping the overall structure intact.
      2. Ensure that the regenerated plan still aligns with the user's original goals, dietary preferences, and workout constraints.
      3. Maintain the same JSON structure as the previous plan, updating only the necessary elements for both diet and workout plans.
      4. Provide a complete JSON response for all 7 days, ensuring both the diet and workout plans are fully populated and not left as empty objects.
      5. No matter what, give the JSON for all 7 days; don't miss any day.
      6. I only need the JSON, no other text or comments.
      7. You are a professional fitness assistant; you are supposed to give the plan properly and not tell the user to replicate the old plan. You should give the entire plan properly.
      8.No matter what you are not supposed to give something as similar as previous day or anything the sample has it because it is a sample , you will have to give the complere pln for all the days of the week.
      9.If the feedback is about the diet keep the previous workout plan as it is and change the diet plan.
      10.If the feedback is about the workout plan keep the previous diet plan as it is and change the workout plan.
      11.Whatever the feedback is keep the previous data in mind and think about the feedback and give a great plan as the users are trusting you with their fitness journey.
      12.In the recipe , please give only the required information such as the weight of ingredients and don't give the recipe completely.
      Please provide the updated plan in the following JSON format:

      {te
        "diet_plan": {
          "day_1": {
            "meal_1": { "meal_name": "Oatmeal with Berries", "calories": 300, "macros": { "protein": "10g", "carbs": "50g", "fats": "5g" }, "recipe": "Cook oats and top with berries." },
            "meal_2": { "meal_name": "Greek Yogurt", "calories": 150, "macros": { "protein": "15g", "carbs": "20g", "fats": "3g" }, "recipe": "Serve plain or with honey." },
            "meal_3": { "meal_name": "Grilled Chicken Salad", "calories": 400, "macros": { "protein": "35g", "carbs": "30g", "fats": "10g" }, "recipe": "Mix grilled chicken with greens." },
            "meal_4": { "meal_name": "Protein Shake", "calories": 250, "macros": { "protein": "25g", "carbs": "30g", "fats": "5g" }, "recipe": "Blend protein powder with water." },
            "total_calories": 1100
          },
          "day_2": {
            "meal_1": { "meal_name": "Scrambled Eggs", "calories": 250, "macros": { "protein": "20g", "carbs": "5g", "fats": "18g" }, "recipe": "Scramble eggs in a pan." },
            "meal_2": { "meal_name": "Apple", "calories": 95, "macros": { "protein": "0g", "carbs": "25g", "fats": "0g" }, "recipe": "Eat raw." },
            "meal_3": { "meal_name": "Beef Stir-fry", "calories": 500, "macros": { "protein": "40g", "carbs": "40g", "fats": "20g" }, "recipe": "Stir-fry beef and vegetables." },
            "meal_4": { "meal_name": "Nuts", "calories": 200, "macros": { "protein": "5g", "carbs": "5g", "fats": "18g" }, "recipe": "Snack on mixed nuts." },
            "total_calories": 1045
          },
          "day_3": { /* Similar structure for day 3 */ },
          "day_4": { /* Similar structure for day 4 */ },
          "day_5": { /* Similar structure for day 5 */ },
          "day_6": { /* Similar structure for day 6 */ },
          "day_7": { /* Similar structure for day 7 */ }
        },
        "workout_plan": {
          "day_1": {
            "session": "Full Body Workout",
            "exercises": [
              { "exercise": "Squats", "sets": 3, "reps": 12, "tempo": "2-1-2" },
              { "exercise": "Bench Press", "sets": 3, "reps": 10, "tempo": "2-1-2" },
              { "exercise": "Deadlift", "sets": 3, "reps": 10, "tempo": "2-1-2" }
            ]
          },
          "day_2": {
            "session": "Cardio and Core",
            "exercises": [
              { "exercise": "Running", "sets": 1, "reps": "30 mins", "tempo": "N/A" },
              { "exercise": "Planks", "sets": 3, "reps": 30, "tempo": "N/A" },
              { "exercise": "Bicycle Crunches", "sets": 3, "reps": 15, "tempo": "N/A" }
            ]
          },
          "day_3": { /* Similar structure for day 3 */ },
          "day_4": { /* Similar structure for day 4 */ },
          "day_5": { /* Similar structure for day 5 */ },
          "day_6": { /* Similar structure for day 6 */ },
          "day_7": { /* Similar structure for day 7 */ }
        },
        "diet_macros": {
          "total_calories_needed": x ,
          "macronutrients": {
            "protein": "yg",
            "carbohydrates": "zg",
            "fats": "wg"
          }
        },
        "plan_adjustments": [
          "Increased protein intake for muscle gain.",
          "Added more fruits and vegetables for micronutrients."
        ]
      }

      Ensure that the response is a valid JSON object and includes data for all 7 days in both the diet_plan and workout_plan. Include a 'plan_adjustments' array to explain the changes made based on the feedback.
`;


  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  const newPlan = response.choices[0].message.content;
  return newPlan;
};

// Function to handle the API request and add job to the queue
const regeneratePlan = async (req, res) => {
  try {
    const { formData, feedback, aiGeneratedPlan } = req.body;

    if (!formData || !aiGeneratedPlan) {
      return res.status(400).json({ error: 'Form data and previous plan are required' });
    }

    console.log('Received formData:', formData);
    console.log('Received feedback:', feedback);
    console.log('Received previous plan:', aiGeneratedPlan);

    const jobId = uuidv4(); // Generate a unique job ID

    // Add the job to the regeneratePlan queue for background processing
    await jobQueue.add('generatePlan', {jobId,formData,feedback,aiGeneratedPlan});

    // Respond immediately with the job ID
    console.log(`Job ${jobId} added to queue for regeneration.`);
    return res.status(200).json({ jobId });
  } catch (error) {
    console.error('Error regenerating plan:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { regeneratePlan, regeneratePlanLogic };

