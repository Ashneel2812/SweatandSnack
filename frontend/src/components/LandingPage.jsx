import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import bgImg from '../../src/assets/hor_img1.jpeg'; // Adjust the path if needed
import abtbgImg from '../../src/assets/hor_img2.jpeg'; // Adjust the path if needed
import emailjs from 'emailjs-com'; // Import EmailJS
import { Helmet } from 'react-helmet';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [showArrow, setShowArrow] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs.send('service_rj8kpyo', 'template_tpto39p', formData, 'nCux8mV2_UFJV6LUq')
      .then((response) => {
        alert('Query sent!');
        setFormData({ name: '', email: '', message: '' });
      }, (err) => {
        console.error('FAILED...', err);
      });
  };

  // Handle scroll events to show/hide the arrow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowArrow(false);
      } else {
        setShowArrow(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Smooth scroll to section when hash changes
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    scrollToHash(); // Scroll on initial load
    window.addEventListener('hashchange', scrollToHash);

    return () => {
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, []);

  const aboutData = {
    paragraph: 'Get personalized meal and workout plans to reach your fitness goals with expert guidance and tailored routines!',
    benefits: [
      'Personalized Plans: Tailored diet and workout plans based on your individual needs and goals.',
      'User-Friendly Interface: Easily navigate through our platform to find the right plan for you.',
      'Progress Tracking: Monitor your progress with our built-in tracking tools to stay motivated.',
      'Flexible Options: Choose from a variety of meal plans and workout routines that fit your lifestyle.'
    ]
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <meta name="description" content="Get personalized meal and workout plans to reach your fitness goals with expert guidance and tailored routines!" />
        <title>SweatandSnack - Personalized Meal and Workout Plans</title>
        <meta property="og:image" content="../assets/only_logo.png" />
      </Helmet>
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center bg-gray-100 h-screen relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImg})` }}>
          <div className="flex flex-col items-center justify-center h-full bg-black bg-opacity-50">
            <h1 className="text-4xl font-bold text-white mb-4">Diet and Workout Planner</h1>
            <p className="text-xl text-white mb-8">Get your personalized diet and workout plan today!</p>
            <Link to="/questionnaire" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded mb-4 text-lg">
              Generate Diet and Workout Plan
            </Link>
          </div>
        </div>
      </main>

      {/* About Us Section */}
      <section id="about" className="bg-gray-200 p-8">
        <div className="container mx-auto flex flex-col md:flex-row items-center md:items-start">
          {/* Centered Image */}
          <div className="flex-shrink-0 mb-4 md:mb-0 md:w-1/2 flex justify-center">
          <img src={abtbgImg} className="w-full h-[450px] rounded-lg shadow-lg" alt="About Us" />
          </div>
          {/* Text on the right */}
          <div className="md:w-1/2 pl-4">
            <h2 className="text-2xl font-bold mb-4">About SweatandSnack</h2>
            <p className="mb-4">{aboutData.paragraph}</p>
            <h3 className="text-xl font-semibold mb-4">Why Choose SweatandSnack?</h3>
            <ul className="list-disc pl-5 mb-4">
              {aboutData.benefits.map((benefit, index) => (
                <li key={index} className="mb-2">{benefit}</li>
              ))}
            </ul>
            <h3 className="text-xl font-semibold mb-4">Our Commitment</h3>
            <p className="mb-4">We are dedicated to providing you with the best resources to enhance your fitness journey. Join us and take the first step towards a healthier you!</p>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="bg-gray-400 p-8">
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message:</label>
            <textarea id="message" name="message" rows="4" value={formData.message} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required></textarea>
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Send Message
          </button>
        </form>
      </section>

      {/* Arrow Button */}
      {showArrow && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <a href="#about" className="bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
