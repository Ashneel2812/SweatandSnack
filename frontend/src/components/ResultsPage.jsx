import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import axios from 'axios';
import { getFromSession, saveToSession } from '../utils/sessionStorage';

const PlanDisplay = ({ plan }) => {
  if (!plan || !plan.diet_plan || !plan.workout_plan) {
    return <p>Plan data is incomplete or not available.</p>;
  }

  const renderMeal = (meal) => {
    if (!meal) return null;
    return (
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h4 className="font-bold">{meal.meal_name} ({meal.calories} calories)</h4>
        <p><strong>Macros:</strong> Protein: {meal.macros?.protein}, Carbs: {meal.macros?.carbs}, Fats: {meal.macros?.fats}</p>
        <p><strong>Recipe:</strong></p>
        <ul>
          {Array.isArray(meal.recipe) ? meal.recipe.map((step, index) => (
            <li key={index}>{step}</li>
          )) : <li>{meal.recipe}</li>}
        </ul>
      </div>
    );
  };

  const renderExercise = (exercise) => {
    if (!exercise) return null;
    return (
      <div className="mb-2">
        <p><strong>{exercise.exercise}</strong>: {exercise.sets} sets x {exercise.reps} reps (Tempo: {exercise.tempo})</p>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Diet Plan</h3>
      {Object.entries(plan.diet_plan).map(([day, meals]) => (
        <div key={day} className="mb-6">
          <h4 className="text-lg font-semibold">{day.replace('_', ' ')}</h4>
          {Object.entries(meals).filter(([key]) => key !== 'total_calories').map(([mealKey, meal]) => (
            <div key={mealKey}>{renderMeal(meal)}</div>
          ))}
        </div>
      ))}

      <h3 className="text-xl font-bold mb-4 mt-8">Workout Plan</h3>
      {Object.entries(plan.workout_plan).map(([day, workout]) => (
        <div key={day} className="mb-6">
          <h4 className="text-lg font-semibold">{day.replace('_', ' ')} - {workout.session}</h4>
          {workout.exercises && workout.exercises.map((exercise, index) => (
            <div key={index}>{renderExercise(exercise)}</div>
          ))}
        </div>
      ))}

      <h3 className="text-xl font-bold mb-4 mt-8">Diet Macros</h3>
      {plan.diet_macros ? (
        <>
          <p>Total Calories: {plan.diet_macros.calories_needed || plan.diet_macros.total_calories_needed || 'N/A'}</p>
          {plan.diet_macros.macronutrients ? (
            <>
              <p>Protein: {plan.diet_macros.macronutrients.protein || 'N/A'}</p>
              <p>Carbohydrates: {plan.diet_macros.macronutrients.carbs || plan.diet_macros.macronutrients.carbohydrates || 'N/A'}</p>
              <p>Fats: {plan.diet_macros.macronutrients.fats || 'N/A'}</p>
            </>
          ) : (
            <p>Macronutrient information not available</p>
          )}
        </>
      ) : (
        <p>Diet macros information not available</p>
      )}

      {plan.plan_adjustments && (
        <>
          <h3 className="text-xl font-bold mb-4 mt-8">Plan Adjustments</h3>
          <ul>
            {plan.plan_adjustments.map((adjustment, index) => (
              <li key={index}>{adjustment}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default function ResultsPage() {
  const [feedback, setFeedback] = useState('');
  const [showTextbox, setShowTextbox] = useState(false);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadPlan = () => {
      let planData;
      if (location.state && location.state.aiGeneratedPlan) {
        planData = location.state.aiGeneratedPlan;
        saveToSession('aiGeneratedPlan', JSON.stringify(planData));
      } else {
        planData = getFromSession('aiGeneratedPlan');
      }

      if (planData) {
        try {
          let parsedPlan;
          if (typeof planData === 'string') {
            // Remove Markdown code blocks and combine JSON objects
            const jsonStrings = planData.match(/```json\n([\s\S]*?)\n```/g);
            if (jsonStrings) {
              parsedPlan = jsonStrings.reduce((acc, jsonString) => {
                const cleanJson = jsonString.replace(/```json\n|\n```/g, '').trim();
                return { ...acc, ...JSON.parse(cleanJson) };
              }, {});
            } else {
              parsedPlan = JSON.parse(planData);
            }
          } else {
            parsedPlan = planData;
          }
          setPlan(parsedPlan);
        } catch (error) {
          setError('Error loading plan. Please try again.');
        }
      }
    };

    loadPlan();
  }, [location.state]);

  const handleHappy = () => {
    navigate('/final-results', { state: { finalPlan: plan } });
  };

  const handleNotHappy = () => {
    setShowTextbox(true);
  };

  const handleSubmitFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = getFromSession('formData');
      const previousPlan = getFromSession('aiGeneratedPlan');

      // const response = await axios.post('http://localhost:5000/api/regenerate-plan', {
      const response = await axios.post('https://sweatand-snack.vercel.app/api/regenerate-plan', {
        formData,
        feedback,
        aiGeneratedPlan: previousPlan
      });

      // if (response.data && response.data.aiGeneratedPlan) {
      //   let newPlan = response.data.aiGeneratedPlan;
      //   if (typeof newPlan === 'string') {
      //     try {
      //       // Remove any potential Markdown code block syntax
      //       newPlan = newPlan.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      //       newPlan = JSON.parse(newPlan);
      //     } catch (error) {
      //       setError(`Error parsing the regenerated plan: ${error.message}. Please try again.`);
      //       return;
      //     }
      //   }
      //   saveToSession('aiGeneratedPlan', JSON.stringify(newPlan));
      //   setPlan(newPlan);
        
        // Navigate to the loading page, passing the response data
        navigate('/loading', { state: { responseData: response.data } });
        
    //     setShowTextbox(false);
    //     setFeedback('');
    //   } else {
    //     setError('Failed to regenerate plan. Please try again.');
    //   }
    // } catch (error) {
    //   console.error('Error submitting feedback:', error);
    //   if (error.response && error.response.data) {
    //     setError(`Error: ${error.response.data.error}. ${error.response.data.details || ''}`);
    //   } else {
    //     setError('An unexpected error occurred. Please try again.');
    //   }
    // } finally {
    //   setIsLoading(false);
    // }
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
  }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="bg-white bg-opacity-90 p-8 rounded shadow-lg max-w-4xl w-full">
          <h2 className="text-2xl font-bold mb-4">Your Personalized Plan</h2>
          
          {isLoading ? (
            <p>Regenerating your plan... Please wait!</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : plan ? (
            <PlanDisplay plan={plan} />
          ) : (
            <p>No plan available. Please try again.</p>
          )}

          <div className="mt-4">
            <p className="mb-2">Are you happy with these results?</p>
            <button onClick={handleHappy} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
              Happy
            </button>
            <button onClick={handleNotHappy} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Not Happy
            </button>
          </div>
          {showTextbox && (
            <div className="mt-4">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Please provide your feedback"
                rows={4}
              />
              <button 
                onClick={handleSubmitFeedback} 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
