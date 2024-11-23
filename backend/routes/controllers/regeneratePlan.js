const { OpenAI } = require('openai');
const Queue = require('bull');
const { v4: uuidv4 } = require('uuid'); 
const { createClient } = require('redis');

const openai = new OpenAI({
  apiKey: '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'
});

const client ={
  redis:{
  host: 'redis-10776.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 10776,
  password: '8Mkxhn4ZLd6x3I5vJzwAmeQJB8lsqNja'
},
};



const jobQueue = new Queue('generatePlan', client);


const regeneratePlanLogic = async (formData, feedback, aiGeneratedPlan) => {


    console.log('Received formData:', formData);
    console.log('Received feedback:', feedback);
    console.log('Received previous plan:', aiGeneratedPlan);

    const prompt = `
You are an expert fitness and nutrition AI assistant. Your task is to regenerate a personalized diet and workout plan based on the user's feedback and their previous plan. Focus on addressing the specific concerns raised in the feedback while maintaining the overall structure and goals of the original plan.

**Previous Plan:**
${JSON.stringify(aiGeneratedPlan)}

**User Feedback:**
"${feedback}"

**Personal Information:**
${JSON.stringify(formData)}

**Instructions:**
1. **Review the previous plan and make targeted adjustments based on the user feedback while keeping the overall structure intact.**
2. Ensure that the regenerated plan still aligns with the user's original goals, dietary preferences, and workout constraints.
3. **Ensure uniqueness for each day of the week.** Even if a diet or workout seems similar from the previous plan, provide different meal combinations or workout arrangements (exercises, order, etc.).
4. Maintain the same JSON structure as the previous plan, updating only the necessary elements based on the feedback.
5. **Provide a complete JSON response for all 7 days** (diet and workout plans), ensuring no day is left blank and all data is fully populated.
6. If the feedback is about the diet, **only update the diet plan**. Keep the workout plan unchanged.
7. If the feedback is about the workout plan, **only update the workout plan**. Keep the diet plan unchanged.
8. **No matter what**, do not repeat meal structures or exercise sequences exactly as previous days. Every day’s plan should feel unique and well-rounded.
9. Make sure the meal and workout details are specific and clear. For recipes, list only the key ingredients with their weights and avoid excessive cooking instructions.
10. **Plan adjustments should be included** to explain any significant changes made based on the feedback. Provide a list of adjustments made under the 'plan_adjustments' key.
11.**Diet macros has to be exact and replace x,y,z,w with the required measurements in grams**
12.**Give the most optimal tempo for the exercise.**
13.**I want the total_calories_needed in diet_macros to be exactly the sum of all the calories in a day**
**Output Format (Ensure this structure is followed):**

{
  "diet_plan": {
    "day_1": {
      "meal_1": { "meal_name": "Oatmeal with Berries", "calories": 300, "macros": { "protein": "10g", "carbs": "50g", "fats": "5g" }, "recipe": "Cook oats and top with berries." },
      "meal_2": { "meal_name": "Greek Yogurt", "calories": 150, "macros": { "protein": "15g", "carbs": "20g", "fats": "3g" }, "recipe": "Serve plain or with honey." },
      "meal_3": { "meal_name": "Grilled Chicken Salad", "calories": 400, "macros": { "protein": "35g", "carbs": "30g", "fats": "10g" }, "recipe": "Mix grilled chicken with greens." },
      "meal_4": { "meal_name": "Protein Shake", "calories": 250, "macros": { "protein": "25g", "carbs": "30g", "fats": "5g" }, "recipe": "Blend protein powder with water." }
    },
    "day_2": {
      "meal_1": { "meal_name": "Scrambled Eggs", "calories": 250, "macros": { "protein": "20g", "carbs": "5g", "fats": "18g" }, "recipe": "Scramble eggs in a pan." },
      "meal_2": { "meal_name": "Apple", "calories": 95, "macros": { "protein": "0g", "carbs": "25g", "fats": "0g" }, "recipe": "Eat raw." },
      "meal_3": { "meal_name": "Beef Stir-fry", "calories": 500, "macros": { "protein": "40g", "carbs": "40g", "fats": "20g" }, "recipe": "Stir-fry beef and vegetables." },
      "meal_4": { "meal_name": "Nuts", "calories": 200, "macros": { "protein": "5g", "carbs": "5g", "fats": "18g" }, "recipe": "Snack on mixed nuts." }
    },
    "day_3": {
      "meal_1": { "meal_name": "Scrambled Eggs", "calories": 250, "macros": { "protein": "20g", "carbs": "5g", "fats": "18g" }, "recipe": "Scramble eggs in a pan." },
      "meal_2": { "meal_name": "Apple", "calories": 95, "macros": { "protein": "0g", "carbs": "25g", "fats": "0g" }, "recipe": "Eat raw." },
      "meal_3": { "meal_name": "Beef Stir-fry", "calories": 500, "macros": { "protein": "40g", "carbs": "40g", "fats": "20g" }, "recipe": "Stir-fry beef and vegetables." },
      "meal_4": { "meal_name": "Nuts", "calories": 200, "macros": { "protein": "5g", "carbs": "5g", "fats": "18g" }, "recipe": "Snack on mixed nuts." }
    },
    "day_4": {
      "meal_1": { "meal_name": "Scrambled Eggs", "calories": 250, "macros": { "protein": "20g", "carbs": "5g", "fats": "18g" }, "recipe": "Scramble eggs in a pan." },
      "meal_2": { "meal_name": "Apple", "calories": 95, "macros": { "protein": "0g", "carbs": "25g", "fats": "0g" }, "recipe": "Eat raw." },
      "meal_3": { "meal_name": "Beef Stir-fry", "calories": 500, "macros": { "protein": "40g", "carbs": "40g", "fats": "20g" }, "recipe": "Stir-fry beef and vegetables." },
      "meal_4": { "meal_name": "Nuts", "calories": 200, "macros": { "protein": "5g", "carbs": "5g", "fats": "18g" }, "recipe": "Snack on mixed nuts." }
    },
    "day_5": {
      "meal_1": { "meal_name": "Scrambled Eggs", "calories": 250, "macros": { "protein": "20g", "carbs": "5g", "fats": "18g" }, "recipe": "Scramble eggs in a pan." },
      "meal_2": { "meal_name": "Apple", "calories": 95, "macros": { "protein": "0g", "carbs": "25g", "fats": "0g" }, "recipe": "Eat raw." },
      "meal_3": { "meal_name": "Beef Stir-fry", "calories": 500, "macros": { "protein": "40g", "carbs": "40g", "fats": "20g" }, "recipe": "Stir-fry beef and vegetables." },
      "meal_4": { "meal_name": "Nuts", "calories": 200, "macros": { "protein": "5g", "carbs": "5g", "fats": "18g" }, "recipe": "Snack on mixed nuts." }
    },
    "day_6": {
      "meal_1": { "meal_name": "Scrambled Eggs", "calories": 250, "macros": { "protein": "20g", "carbs": "5g", "fats": "18g" }, "recipe": "Scramble eggs in a pan." },
      "meal_2": { "meal_name": "Apple", "calories": 95, "macros": { "protein": "0g", "carbs": "25g", "fats": "0g" }, "recipe": "Eat raw." },
      "meal_3": { "meal_name": "Beef Stir-fry", "calories": 500, "macros": { "protein": "40g", "carbs": "40g", "fats": "20g" }, "recipe": "Stir-fry beef and vegetables." },
      "meal_4": { "meal_name": "Nuts", "calories": 200, "macros": { "protein": "5g", "carbs": "5g", "fats": "18g" }, "recipe": "Snack on mixed nuts." }
    },
    "day_7": {
      "meal_1": { "meal_name": "Scrambled Eggs", "calories": 250, "macros": { "protein": "20g", "carbs": "5g", "fats": "18g" }, "recipe": "Scramble eggs in a pan." },
      "meal_2": { "meal_name": "Apple", "calories": 95, "macros": { "protein": "0g", "carbs": "25g", "fats": "0g" }, "recipe": "Eat raw." },
      "meal_3": { "meal_name": "Beef Stir-fry", "calories": 500, "macros": { "protein": "40g", "carbs": "40g", "fats": "20g" }, "recipe": "Stir-fry beef and vegetables." },
      "meal_4": { "meal_name": "Nuts", "calories": 200, "macros": { "protein": "5g", "carbs": "5g", "fats": "18g" }, "recipe": "Snack on mixed nuts." }
    }
  },
  "workout_plan": {
          "day_1": {
            "session": "Full Body Workout",
            "exercises": [
              { "exercise": "Squats", "sets": 3, "reps": 12, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Bench Press", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Deadlift", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" }
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
          "day_3": {
            "session": "Full Body Workout",
            "exercises": [
              { "exercise": "Squats", "sets": 3, "reps": 12, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Bench Press", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Deadlift", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" }
            ]
          },
          "day_4": {
            "session": "Full Body Workout",
            "exercises": [
              { "exercise": "Squats", "sets": 3, "reps": 12, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Bench Press", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Deadlift", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" }
            ]
          },
          "day_5": {
            "session": "Full Body Workout",
            "exercises": [
              { "exercise": "Squats", "sets": 3, "reps": 12, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Bench Press", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Deadlift", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" }
            ]
          },
          "day_6": {
            "session": "Full Body Workout",
            "exercises": [
              { "exercise": "Squats", "sets": 3, "reps": 12, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Bench Press", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Deadlift", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" }
            ]
          },
          "day_7": {
            "session": "Full Body Workout",
            "exercises": [
              { "exercise": "Squats", "sets": 3, "reps": 12, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Bench Press", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" },
              { "exercise": "Deadlift", "sets": 3, "reps": 10, "tempo": "2 sec down , 1 sec pause , 2 sec up" }
            ]
          }
        },
        "diet_macros": {
          "total_calories_needed": "x" ,
          "macronutrients": {
            "protein": "yg",
            "carbohydrates": "zg",
            "fats": "wg"
          }
        },
        "plan_adjustments": ["Changed lunch meal to include more vegetables", "Increased protein intake in the workout recovery shake"]

        **Do not make any change in the JSON provided and as you are a professional trainer give the complete data instead of saying similar structure and please think and give the best data possible **
}`;


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

