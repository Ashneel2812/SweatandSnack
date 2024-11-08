import React from 'react';
import loadingVideo from './recording.mp4'; // Adjust the path if needed

const LoadingPage = () => {
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