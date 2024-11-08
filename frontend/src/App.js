import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import QuestionnairePage from './components/QuestionarriePage';
import ResultsPage from './components/ResultsPage';
import FinalResultsPage from './components/FinalResultsPage';
import LoadingPage from './components/LoadingPage';

export default function App() {
  const [loading, setLoading] = useState(false);

  const handleLoadingStart = () => {
    setLoading(true);
  };

  const handleLoadingEnd = () => {
    setLoading(false);
  };

  return (
    <Router>
      {loading && <LoadingPage />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage onLoadingStart={handleLoadingStart} onLoadingEnd={handleLoadingEnd} />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/final-results" element={<FinalResultsPage />} />
      </Routes>
    </Router>
  );
}