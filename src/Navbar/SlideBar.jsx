import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import signIn from "../assets/SignIn.svg";

export default function SlideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'profile', label: 'Profile', path: '/profile' }, // Example path, adjust as needed
    { id: 'review', label: 'Review', path: '/ReviewPage' },
    { id: 'about', label: 'About Us', path: '/AboutSection' }, // Example path
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        className="flex flex-col space-y-1.5 cursor-pointer p-2 hover:bg-gray-800 rounded-md transition-colors"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span className="w-6 h-[3px] bg-white rounded"></span>
        <span className="w-6 h-[3px] bg-white rounded"></span>
        <span className="w-6 h-[3px] bg-white rounded"></span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#131212] text-white transition-all duration-300 ease-in-out overflow-hidden z-50`}
        style={{
          width: isOpen ? '280px' : '0px',
        }}
      >
        <div className="p-6 h-full flex flex-col min-w-[280px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold tracking-tight">Menu</h2>
            <button
              className="bg-red-600 px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              onClick={toggleSidebar}
            >
              Close
            </button>
          </div>

          <ul className="space-y-2 flex-grow">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path} // Use Link with the path
                  className={`flex items-center text-lg p-2 rounded-md transition-all duration-200 ease-in-out
                    ${activeItem === item.id
                      ? 'bg-gray-700 text-white transform scale-105'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:transform hover:scale-102'
                    }`}
                  onClick={() => handleItemClick(item.id)}
                >
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="h-6 w-6 mr-3"
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}