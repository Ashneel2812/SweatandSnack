import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600">Diet & Workout Planner</Link>
      <nav>
        <ul className="flex space-x-4">
          <li><Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link></li>
          <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
          <li><Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
}