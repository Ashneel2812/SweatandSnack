import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import axios from 'axios';
import { saveToSession, getFromSession } from '../utils/sessionStorage';
import bgImg from '../../src/assets/hor_img1.jpeg'; // Adjust the path if needed

export default function QuestionnairePage({ onLoadingStart, onLoadingEnd }) {
  const [formData, setFormData] = useState(() => getFromSession('formData') || {
    allergies: [],
    meals: '',
    cuisine: '',
    cookingTime: '',
    proteinSources: [],
    supplements: '',
    workoutDays: '',
    gymDays: '',
    equipment: [],
    dailyTime: '',
    mobility: '',
    gender: '',
    weight: '',
    weightUnit: 'kg',
    height: '',
    heightUnit: 'cm',
    heightFt: '',
    heightIn: '',
    goalWeight: '',
    goalWeightUnit: 'kg',
    timeSpan: '',
    workoutGoal: [],
    age: '',
    diet: '',
    lifestyle: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    saveToSession('formData', formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (checked) {
        setFormData({ ...formData, [name]: [...formData[name], value] });
      } else {
        setFormData({ ...formData, [name]: formData[name].filter(item => item !== value) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoadingStart();

    try {
      const response = await axios.post('http://localhost:5000/api/submit-questionnaire', formData);
      console.log('Response from submit-questionnaire:', response.data);
      
      // Navigate to LoadingPage and pass the response data
      navigate('/loading', { state: { responseData: response.data } });
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
    } finally {
      onLoadingEnd();
    }
  };

  const calculateHealthyWeightLossPeriod = () => {
    const weightDifference = parseFloat(formData.weight) - parseFloat(formData.goalWeight);
    const weeks = weightDifference / 0.5; // 0.5 kg per week
    const months = weeks / 4; // Approximate weeks in a month
    return Math.floor(months); // Return months as an integer
  };

  const renderWeightLossWarning = () => {
    if (!formData.weight || !formData.goalWeight) return null; // Only render if both weights are provided

    const weightUnitCurrent = formData.weightUnit;
    const weightUnitGoal = formData.goalWeightUnit;

    // Only show the warning if both weights are in the same unit
    if (weightUnitCurrent !== weightUnitGoal) return null;

    const weightDifference = parseFloat(formData.weight) - parseFloat(formData.goalWeight);

    // Only show the warning if the goal weight is less than the current weight
    if (weightDifference <= 0) return null;

    const healthyPeriod = calculateHealthyWeightLossPeriod();
    
    let healthyWeightLossMessage;
    if (weightUnitCurrent === 'kg') {
      healthyWeightLossMessage = `A healthy weight loss period for losing ${weightDifference} kg is approximately ${healthyPeriod} months (0.25-0.5 kg per week).`;
    } else {
      const weightDifferenceLbs = weightDifference; // Convert kg to lbs
      const healthyPeriodLbs = Math.round(weightDifferenceLbs / 0.5); // Calculate months for lbs
      healthyWeightLossMessage = `A healthy weight loss period for losing ${Math.round(weightDifferenceLbs)} lbs is approximately ${Math.floor(healthyPeriodLbs / 4)} months (0.5-1 lbs per week).`;
    }

    return <p className="text-red-500">{healthyWeightLossMessage}</p>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow relative">
        {/* Set the background image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImg})` }}>
          <div className="flex flex-col items-center justify-center h-full bg-black bg-opacity-50"> {/* Optional overlay for better text visibility */}
            <h2 className="text-2xl font-bold text-white mb-4">Questionnaire</h2>
            <form id="questionnaire-form" onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 bg-white bg-opacity-90 p-8 rounded shadow-lg w-[50%]">
              <h3 className="text-xl font-semibold">Diet-Related</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">Common Dietary Allergies:</label>
                {['peanuts', 'gluten', 'milk', 'shellfish', 'soy_products'].map((allergy) => (
                  <div key={allergy} className="flex items-center">
                    <input type="checkbox" id={allergy} name="allergies" value={allergy} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor={allergy} className="ml-2 block text-sm text-gray-900">{allergy.replace('_', ' ')}</label>
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="meals" className="block text-sm font-medium text-gray-700">Preferred Number of Meals:</label>
                <input type="number" id="meals" name="meals" value={formData.meals} onChange={handleChange} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              </div>

              <div>
                <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700">Preferred Cuisine:</label>
                <input type="text" id="cuisine" name="cuisine" value={formData.cuisine} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              </div>

              <div>
                <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">Available Cooking Time (in hours):</label>
                <input type="number" id="cookingTime" name="cookingTime" value={formData.cookingTime} step="0.5" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Protein Sources:</label>
                <strong>Animal-Based Proteins:</strong>
                {['chicken', 'eggs', 'red_meat', 'fish'].map((protein) => (
                  <div key={protein} className="flex items-center">
                    <input type="checkbox" id={protein} name="proteinSources" value={protein} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor={protein} className="ml-2 block text-sm text-gray-900">{protein.replace('_', ' ')}</label>
                  </div>
                ))}
                <strong>Plant-Based Proteins:</strong>
                {['lentils', 'tofu', 'paneer'].map((protein) => (
                  <div key={protein} className="flex items-center">
                    <input type="checkbox" id={protein} name="proteinSources" value={protein} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor={protein} className="ml-2 block text-sm text-gray-900">{protein}</label>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Taking Protein Powder:</label>
                <div className="flex items-center">
                  <input type="radio" id="supplements-yes" name="supplements" value="yes" onChange={handleChange} checked={formData.supplements === 'yes'} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <label htmlFor="supplements-yes" className="ml-2 block text-sm text-gray-900">Yes</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="supplements-no" name="supplements" value="no" onChange={handleChange} checked={formData.supplements === 'no'} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <label htmlFor="supplements-no" className="ml-2 block text-sm text-gray-900">No</label>
                </div>
              </div>

              <h3 className="text-xl font-semibold">Workout-Related</h3>

              <div>
                <label htmlFor="workoutDays" className="block text-sm font-medium text-gray-700">Number of Workout Days:</label>
                <input type="number" id="workoutDays" name="workoutDays" value={formData.workoutDays} onChange={handleChange} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              </div>

              <div>
                <label htmlFor="gymDays" className="block text-sm font-medium text-gray-700">Number of Gym Days:</label>
                <input type="number" id="gymDays" name="gymDays" value={formData.gymDays} onChange={handleChange} min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Equipment Available:</label>
                {['dumbbells', 'kettlebells', 'barbells', 'machines', 'yoga_mat', 'foam_roller', 'stretch_band'].map((equipment) => (
                  <div key={equipment} className="flex items-center">
                    <input type="checkbox" id={equipment} name="equipment" value={equipment} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor={equipment} className="ml-2 block text-sm text-gray-900">{equipment.replace('_', ' ')}</label>
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="dailyTime" className="block text-sm font-medium text-gray-700">Time Available Per Day (hours):</label>
                <input type="number" id="dailyTime" name="dailyTime" value={formData.dailyTime} step="0.5" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mobility/Flexibility:</label>
                <div className="flex items-center">
                  <input type="radio" id="mobility-yes" name="mobility" value="yes" onChange={handleChange} checked={formData.mobility === 'yes'} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <label htmlFor="mobility-yes" className="ml-2 block text-sm text-gray-900">Yes</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="mobility-no" name="mobility" value="no" onChange={handleChange} checked={formData.mobility === 'no'} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <label htmlFor="mobility-no" className="ml-2 block text-sm text-gray-900">No</label>
                </div>
              </div>

              <h3 className="text-xl font-semibold">Personal</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender:</label>
                <div className="flex items-center">
                  <input type="radio" id="gender-male" name="gender" value="male" onChange={handleChange} checked={formData.gender === 'male'} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <label htmlFor="gender-male" className="ml-2 block text-sm text-gray-900">Male</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="gender-female" name="gender" value="female" onChange={handleChange} checked={formData.gender === 'female'} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <label htmlFor="gender-female" className="ml-2 block text-sm text-gray-900">Female</label>
                </div>
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Body Weight:</label>
                <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              </div>

              <div>
                <label htmlFor="weightUnit" className="block text-sm font-medium text-gray-700">Weight Unit:</label>
                <select id="weightUnit" name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Height:</label>
                {formData.heightUnit === 'cm' ? (
                  <input type="number" id="height" name="height" value={formData.height} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                ) : (
                  <div className="flex space-x-2">
                    <input type="number" id="heightFt" name="heightFt" value={formData.heightFt} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" placeholder="ft" />
                    <input type="number" id="heightIn" name="heightIn" value={formData.heightIn} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" placeholder="in" />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="heightUnit" className="block text-sm font-medium text-gray-700">Height Unit:</label>
                <select id="heightUnit" name="heightUnit" value={formData.heightUnit} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                  <option value="cm">Centimeters (cm)</option>
                  <option value="ft">Feet/Inches (ft/in)</option>
                </select>
              </div>

              <div>
                <label htmlFor="goalWeight" className="block text-sm font-medium text-gray-700">Goal Weight:</label>
                <input type="number" id="goalWeight" name="goalWeight" value={formData.goalWeight} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              </div>

              <div>
                <label htmlFor="goalWeightUnit" className="block text-sm font-medium text-gray-700">Goal Weight Unit:</label>
                <select id="goalWeightUnit" name="goalWeightUnit" value={formData.goalWeightUnit} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                </select>
              </div>

              <div>
                <label htmlFor="timeSpan" className="block text-sm font-medium text-gray-700">Time Span for Goal:</label>
                <input type="text" id="timeSpan" name="timeSpan" value={formData.timeSpan} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              </div>

              {renderWeightLossWarning()}

              <div>
                <label className="block text-sm font-medium text-gray-700">Workout Goal:</label>
                {['muscle_gain', 'weight_loss', 'maintenance'].map((goal) => (
                  <div key={goal} className="flex items-center">
                    <input type="checkbox" id={goal} name="workoutGoal" value={goal} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor={goal} className="ml-2 block text-sm text-gray-900">{goal.replace('_', ' ')}</label>
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age:</label>
                <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Diet Preference:</label>
                {['veg', 'non-veg', 'vegan'].map((diet) => (
                  <div key={diet} className="flex items-center">
                    <input type="radio" id={`diet-${diet}`} name="diet" value={diet} onChange={handleChange} checked={formData.diet === diet} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <label htmlFor={`diet-${diet}`} className="ml-2 block text-sm text-gray-900">{diet}</label>
                  </div>
                ))}
              </div>

              <div>
              <h3 className="block text-sm font-medium text-gray-700">Lifestyle:</h3>
              {['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'super_active'].map((lifestyle) => (
                <div key={lifestyle} className="flex items-center">
                  <input type="radio" id={`lifestyle-${lifestyle}`} name="lifestyle" value={lifestyle} onChange={handleChange} checked={formData.lifestyle === lifestyle} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <label htmlFor={`lifestyle-${lifestyle}`} className="ml-2 block text-sm text-gray-900">{lifestyle.replace('_', ' ')}</label>
                </div>
              ))}
              </div>

              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4">
                Submit
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}