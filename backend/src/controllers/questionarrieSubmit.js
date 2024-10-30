const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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'
});

const submitQuestionnaire = async (req, res) => {
  try {
    const formData = req.body;
    
    const dietPlanPrompt = `
    {
      "day_1": {
        "meal_1": {
          "meal_name": "Meal Name",
          "calories": 0,
          "macros": {
            "protein": "0g",
            "carbs": "0g",
            "fats": "0g"
          },
          "recipe": "Recipe Instructions"
        },
        "meal_2": { ... },
        "meal_3": { ... },
        "meal_4": { ... }
      },
      "day_2": {
        "meal_1": { ... },
        ...
      }
    }`;
    
    const workoutPlanPrompt = `
    {
      "day_1": {
        "session": "Workout Focus (e.g., Gym - Chest and Shoulders)",
        "exercises": [
          {
            "exercise": "Exercise Name",
            "sets": 0,
            "reps": 0,
            "tempo": "Tempo (e.g., 3 seconds down, 1 second up)"
          },
          ...
        ]
      },
      "day_2": {
        "session": "Workout Focus (e.g., Gym - Back and Arms)",
        "exercises": [ ... ]
      }
    }`;
    
    const prompt = `
    You are a professional fitness assistant who has great knowledge about everything related to fitness.Just give these 3 JSON and don't give anything extra . I want to create a personalized diet and workout plan based on the following details. Please provide the response in a structured JSON format for both the diet and workout plan, with the format outlined below.
    Personal Information:
    I am a ${formData.gender} of ${formData.age} age.
    My current body weight is ${formData.weight} ${formData.weightUnit} and my height is ${formData.height} ${formData.heightFt} ${formData.heightIn} ${formData.heightUnit}.
    My goal body weight is ${formData.goalWeight} ${formData.goalWeightUnit} in a time span of ${formData.timeSpan} months.
    My workout goal is: ${formData.workoutGoal}.
    My lifestyle is: ${formData.lifestyle}.
    I prefer a ${formData.diet} diet.
    Diet-Related Information:
    I have the following dietary allergies: ${formData.allergies}.
    I prefer to eat ${formData.meals} meals per day and follow ${formData.cuisine} cuisine.
    I have ${formData.cookingTime} hours per day available for cooking.
    My preferred protein sources are: ${formData.proteinSources}.
    I am currently taking protein powder: ${formData.supplements}.
    Workout-Related Information:
    I can workout ${formData.workoutDays} days per week and go to the gym for ${formData.gymDays} days per week.
    I have access to the following equipment: ${formData.equipment}.
    I have ${formData.dailyTime} hours per day available for workout.
    I am working on mobility/flexibility: ${formData.mobility}.If not working on mobility , do not include mobility in the workout routine.
    Calculate the Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation and Adjust the BMR based on the activity level to find the Total Daily Energy Expenditure (TDEE): Sedentary (little or no exercise): BMR*1.2,Lightly active (light exercise/sports 1-3 days a week): BMR*1.375,Moderately active (moderate exercise/sports 3-5 days a week): BMR+1.55,Very active (hard exercise/sports 6-7 days a week): BMR*1.725,Super active (very hard exercise/sports & a physical job): BMR*1.9
    Based on the TDEE calculate the calories to be taken for different goals . As you are a trained fitness coach you should be giving proper calories to be taken keeping the nutrients and macros required and also daily calorie count should be the same as the calories required arrange protein , fats and carbs based on the need. Also keep in mind the duration mentioned to achieve the goals.
    Based on this information, please provide the following for 7 days and every day should have different recipes:
    A diet plan structured by day and meal number in the following JSON format and in the json also include needed and total calories available on that specific day:
    ${dietPlanPrompt} . Give this JSON for 7 days.
    Ensure each meal includes the name, calorie count, macronutrients (protein, carbs, fats), and the recipe should include the exact measurement of the ingredient and the entire recipe step by step.
    Every workout should include exercises in such a way that all the parts of the muscle to be trained are included . Include atleast 5 exercises every day so that the user can include the exercises they need . A workout plan structured by day and session in the following JSON format:
    ${workoutPlanPrompt} . Give this JSON for 7 days.
    Add a third Json named Diet-macros and in this JSON give the breakdown of the calories needed by the individual and the macro nutrients required.This should be the exact calories available throught the diet also.
    The third Json should be of the form         
    "diet_macros": {
          "total_calories_needed": 2000,
          "macronutrients": {
            "protein": "150g",
            "carbohydrates": "250g",
            "fats": "60g"
          }
        }
    Each session should include the focus, exercises with the number of sets, reps, and tempo for each exercise. Just give these 3 JSON and don't give anything extra.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    console.log('AI Response:', completion.choices[0].message.content);

    res.status(200).json({ 
      formData,
      aiGeneratedPlan: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { submitQuestionnaire };