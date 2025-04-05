import { useState } from 'react';

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="w-full p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
      <div className="flex justify-between items-center">
        <div className="text-3xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          VIZCRAFT
        </div>
        <div className="relative">
          <button
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition-colors"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {/* Profile icon or content would go here */}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;