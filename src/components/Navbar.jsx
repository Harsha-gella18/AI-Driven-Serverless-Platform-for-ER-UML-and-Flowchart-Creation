import { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa'; // Importing the human icon from react-icons
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all cookies
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });

    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();

    // Navigate to the home page
    navigate('/');
  };

  return (
    <nav className="w-full p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
      <div className="flex justify-between items-center">
        {/* App Name */}
        <div className="text-3xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          VIZCRAFT
        </div>

        {/* Human Icon on the top right */}
        <div className="relative">
          <FaUserCircle
            className="text-white text-3xl cursor-pointer"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          />
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
              <button
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                onClick={() => alert('Profile clicked')}
              >
                Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;