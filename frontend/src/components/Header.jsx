import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../src/assets/logo.png'; // Adjust the path if needed

export default function Header() {
  const navigate = useNavigate();

  const handleLinkClick = (e, sectionId) => {
    e.preventDefault();
    navigate(`#${sectionId}`); // This will update the URL hash

    // Delay the scroll action to allow the URL to change
    setTimeout(() => {
      const element = document.querySelector(`#${sectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  };

  return (
    <header style={{ backgroundColor: '#EFEFEF' }} className="top-0 left-0 right-0 shadow-md p-4 flex justify-between items-center z-50">
      <Link to="/" className="flex items-center">
      <img 
        src={logo} 
        alt="Diet and Workout Planner Logo" 
        className="h-auto max-h-12" 
        title="Diet and Workout Planner Logo"
        loading="lazy" 
        width="120" 
        height="48" 
      />
      </Link>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <a href="https://www.sweatandsnack.com/#about" onClick={(e) => handleLinkClick(e, 'about')} className="text-gray-600 hover:text-gray-900">
              About
            </a>
          </li>
          <li>
            <a href="https://www.sweatandsnack.com/#contact" onClick={(e) => handleLinkClick(e, 'contact')} className="text-gray-600 hover:text-gray-900">
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
