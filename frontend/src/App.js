import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import QuestionnairePage from './components/QuestionarriePage';
import ResultsPage from './components/ResultsPage';
import FinalResultsPage from './components/FinalResultsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/final-results" element={<FinalResultsPage />} />
      </Routes>
    </Router>
  );
}