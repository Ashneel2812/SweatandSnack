import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';
import axios from 'axios';
import EmailPopup from './EmailPopup'; // Import the EmailPopup component

const PlanDisplay = ({ plan }) => {
  if (!plan || !plan.diet_plan || !plan.workout_plan) {
    return <p>Plan data is incomplete or not available.</p>;
  }

  const renderMeal = (meal) => {
    if (!meal) return null;
    return (
      <div className="mb-4">
        <h4 className="font-bold">{meal.meal_name} ({meal.calories} calories)</h4>
        <p><strong>Macros:</strong> Protein: {meal.macros?.protein}, Carbs: {meal.macros?.carbs}, Fats: {meal.macros?.fats}</p>
        <p><strong>Recipe:</strong> {meal.recipe}</p>
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
      {plan.diet_macros && (
        <>
          <p>Total Calories: {plan.diet_macros.total_calories_needed}</p>
          <p>Protein: {plan.diet_macros.macronutrients.protein}</p>
          <p>Carbohydrates: {plan.diet_macros.macronutrients.carbohydrates}</p>
          <p>Fats: {plan.diet_macros.macronutrients.fats}</p>
        </>
      )}
    </div>
  );
};

export default function FinalResultsPage() {
  const location = useLocation();
  const finalPlan = location.state?.finalPlan;
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const handleEmailSubmit = async (email) => {
    setIsLoading(true); // Set loading to true
    try {
      const response = await axios.post('http://localhost:5000/api/email-plan', {
        email,
        dietPlan: finalPlan.diet_plan,
        workoutPlan: finalPlan.workout_plan,
        dietMacros: finalPlan.diet_macros
      });
      console.log('Plan saved:', response.data);
      alert('Your plan has been saved and will be emailed to you shortly!');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save your plan. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state
      setIsPopupOpen(false); // Close the popup
    }
  };

  const handleGenerateGoogleSheet = async () => {
    setIsPopupOpen(true); // Open the email popup
  };

  return (
    <div className={`min-h-screen flex flex-col ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="bg-white bg-opacity-90 p-8 rounded shadow-lg max-w-4xl w-full">
          <h2 className="text-2xl font-bold mb-4">Your Final Diet and Workout Plan</h2>
          <p className="mb-4">Congratulations! Here's your personalized plan based on your inputs and feedback.</p>
          
          {finalPlan ? (
            <PlanDisplay plan={finalPlan} />
          ) : (
            <p>No plan data available. Please go back and generate a plan.</p>
          )}

          <div className="mt-4 flex flex-wrap justify-between items-center">
            <Link to="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block mb-2">
              Back to Home
            </Link>
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-block mb-2"
              disabled={isLoading} // Disable button if loading
            >
              Email My Plan
            </button>
            <button
              onClick={handleGenerateGoogleSheet}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded inline-block mb-2"
              disabled={isLoading} // Disable button if loading
            >
              Generate Google Sheet
            </button>
          </div>
        </div>
      </main>
      <EmailPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleEmailSubmit}
      />
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <h1 className="text-black text-2xl">Processing your request...</h1>
        </div>
      )}
    </div>
  );
}
