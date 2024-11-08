import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../src/assets/logo.png'; // Adjust the path if needed

export default function Header() {
  return (
    <header style={{ backgroundColor: '#EFEFEF' }} className="top-0 left-0 right-0 shadow-md p-4 flex justify-between items-center z-50">
      <Link to="/" className="flex items-center">
        <img src={logo} alt="Diet and Workout Planner Logo" className="h-[30%] w-[30%] mr-2" />
      </Link>
      <nav>
        <ul className="flex space-x-4">
          <li><Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link></li>
          <li><Link to="#about" className="text-gray-600 hover:text-gray-900">About</Link></li>
          <li><Link to="#contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
}