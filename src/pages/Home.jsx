import React, { useState } from "react";
import Login from "../components/login";
import Signup from "../components/signup";

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Navigation Bar */}
      <nav className="w-full p-6">
        <div className="flex justify-between items-center">
          <div className="text-3xl font-bold tracking-wide">VIZCRAFT</div>
          <div className="space-x-4">
            <button
              className="px-4 py-2 border border-white rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button
              className="px-4 py-2 border border-white rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300"
              onClick={() => setShowSignup(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 flex-grow">
        <h1 className="text-6xl font-extrabold mb-4 animate-fadeIn">
          Craft Your Visuals with Precision
        </h1>
        <p className="text-xl mb-8 animate-fadeIn delay-150">
          Transform ideas into stunning diagrams effortlessly.
        </p>
        <button className="px-6 py-3 bg-gray-800 text-white rounded-full text-lg font-medium hover:bg-gray-700 transition duration-300 animate-fadeIn delay-300">
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="w-full py-8 mt-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
            <h3 className="text-2xl font-semibold mb-3">Flowcharts</h3>
            <p>Create intuitive flowcharts with ease and clarity.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
            <h3 className="text-2xl font-semibold mb-3">ER Diagrams</h3>
            <p>Design comprehensive entity-relationship diagrams.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
            <h3 className="text-2xl font-semibold mb-3">UML Diagrams</h3>
            <p>Develop detailed UML diagrams for your projects.</p>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
    </div>
  );
};

export default Home;