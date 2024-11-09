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
    You are a professional fitness assistant who has great knowledge about everything related to fitness. Just give these 3 JSONs and don't give anything extra. I want to create a personalized diet and workout plan based on the following details. Please provide the response in a structured JSON format for both the diet and workout plan, with the format outlined below.
    
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
    I am working on mobility/flexibility: ${formData.mobility}. If not working on mobility, do not include mobility in the workout routine.
    
    **Calorie Calculation**:
    1. Calculate the **Basal Metabolic Rate (BMR)** using the Mifflin-St Jeor Equation for a male/female. Use the following formula:
    
        For males:  
        **BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5**
        
        For females:  
        **BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161**
    
    2. Adjust the BMR based on the activity level to find the **Total Daily Energy Expenditure (TDEE)**:
    - Sedentary (little or no exercise): BMR × 1.2
    - Lightly active (light exercise/sports 1-3 days a week): BMR × 1.375
    - Moderately active (moderate exercise/sports 3-5 days a week): BMR × 1.55
    - Very active (hard exercise/sports 6-7 days a week): BMR × 1.725
    - Super active (very hard exercise/sports & a physical job): BMR × 1.9
    
    3. Based on the **TDEE**, calculate the **calories to be taken for different goals**:
    - If the goal is **weight loss**, subtract a moderate calorie deficit (typically 10–20%) from the TDEE, depending on the desired speed of weight loss (more aggressive for faster loss, moderate for a gradual pace).
    - If the goal is **maintenance**, use TDEE.
    - If the goal is **muscle gain**, add a slight caloric surplus (typically 5–10%) above TDEE.
    
    4. The calories calculated should match the required number for the goal (e.g., weight loss, muscle gain). Ensure that **the calorie count per meal/day matches the exact number** calculated and adjust the **macronutrients** (protein, carbs, fats) accordingly. Each day's calorie total should be **precise**.

    **Macronutrient Distribution**:
    - Protein: 25-30% of total calories (to preserve muscle mass during weight loss or build muscle during muscle gain).
    - Carbohydrates: 40-50% of total calories (energy source for workouts and general activity).
    - Fats: 20-30% of total calories (essential for hormone balance and overall health).

    **Diet Plan**:
    Based on the calories and macros calculated, provide a 7-day **meal plan** in the following JSON format:
    
    ${dietPlanPrompt} . Give this JSON for 7 days and different receipes everyday and i want the json to be the exact same along with the same amount of calories needed and this should be the exact same calories from the meals given.
    
    Ensure each meal includes:
    - The **name** of the meal.
    - The **calorie count** for that meal.
    - The **macronutrients** (protein, carbs, fats) in grams.
    - The **recipe** with the exact measurements of each ingredient and the preparation steps.
    
    The total daily calories should exactly match the calculated TDEE (after adjustments for weight loss, muscle gain, or maintenance).
    The calories should be exact as the calories calculated and it should not deviate much .The calorie part is one of the most important part , you should not mess it up so give exact calories per day as calculated.

    **Workout Plan**:
    Based on the TDEE and workout goals, provide a **7-day workout routine** in the following JSON format:
    
    ${workoutPlanPrompt} . Give this JSON for 7 days.I want the json to be the exact same
    
    Each workout should:
    - Include at least **5 exercises per session**.
    - Focus on **full-body strength**, targeting all major muscle groups.
    - Include **sets**, **reps**, and **tempo** for each exercise.

    **Diet-Macros Breakdown**:
    Provide a **third JSON** to break down the **total calories** and **macronutrients** required:
    
    "diet_macros": {
        "total_calories_needed": x, 
        "macronutrients": {
            "protein": "yg",
            "carbohydrates": "zg",
            "fats": "wg"
        }
    }

    Each session should include the **focus**, **exercises**, **sets**, **reps**, and **tempo** for each exercise. Just give these **3 JSONs** and don't give anything extra.

    The x, y, z, w are the quantities required by the individual and these should be the **exact number** of calories and macronutrients to be included in the daily diet. The calories should be **exactly** the number calculated and match the **macronutrient breakdown**.
    You are a professional and you cannot mess up the diet part , so give the exact number of calories needed and these calories should add up as the total calories per day.
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