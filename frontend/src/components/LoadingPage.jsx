import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import loadingVideo from './recording.mp4'; // Adjust the path if needed

const LoadingPage = () => {
  const [loadingMessage, setLoadingMessage] = useState("Checking job status...");
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();  // Get location state (which contains the responseData)

  const { responseData } = location.state || {}; // Destructure responseData from state

  useEffect(() => {
    // Ensure responseData is available
    if (!responseData) {
      setLoadingMessage("No job data found.");
      return;
    }

    const jobId = responseData.jobId; // Assuming jobId is in responseData

    // Function to call the API and check job status
    const checkJobStatus = async () => {
      try {
        // const response = await axios.get(`http://localhost:5000/api/job-status/${jobId}`);
        const response = await axios.get(`https://sweatand-snack.vercel.app/api/job-status/${jobId}`,{withCredentials: true});
        if (response.data.status === "completed") {
          setLoadingMessage("Job completed!");
          navigate("/results", { state: { aiGeneratedPlan: response.data.result.plan } });
        } else if (response.data.status === "failed") {
          setError(true);
          setLoadingMessage("Job failed.");
        }
      } catch (error) {
        console.error("Error fetching job status:", error);
        setError(true);
        setLoadingMessage("An error occurred while checking the job status.");
      }
    };

    // First API call after 5 seconds
    const firstCallTimeout = setTimeout(() => {
      checkJobStatus();  // First API call after 5 seconds
    }, 5000);

    // Start polling every 10 seconds after the first call
    const intervalId = setInterval(() => {
      checkJobStatus(); // Poll every 10 seconds
    }, 10000);

    // Cleanup the timeout and interval when the component is unmounted
    return () => {
      clearTimeout(firstCallTimeout);
      clearInterval(intervalId);
    };
  }, [location.state, navigate]); // Only run when responseData is passed as state

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Loading, please wait...</h1>
      <video
        className="w-full max-w-md"
        autoPlay
        loop
        muted
      >
        <source src={loadingVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p className="mt-4 text-lg">We are processing your request. This might take a few minutes. Thank you for your patience!</p>
    </div>
  );
};

export default LoadingPage; 
