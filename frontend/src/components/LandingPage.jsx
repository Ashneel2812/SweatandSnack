import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Diet and Workout Planner</h1>
          <p className="text-xl mb-8">Get your personalized diet and workout plan today!</p>
          <Link 
            to="/questionnaire" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Generate Diet and Workout Plan
          </Link>
        </div>
      </main>
    </div>
  );
}