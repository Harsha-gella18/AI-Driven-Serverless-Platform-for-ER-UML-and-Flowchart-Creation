import React, { useState } from "react";
import Login from "../components/login";
import Signup from "../components/signup";
import { BarChart, Database, Layers } from "lucide-react";

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Navigation Bar */}
      <nav className="w-full p-6 bg-gray-800 shadow-lg">
        <div className="flex justify-between items-center px-6">
          <div className="text-3xl font-bold tracking-wide text-blue-400">
            VIZCRAFT
          </div>
          <div className="space-x-4">
            <button
              className="px-4 py-2 border border-blue-400 rounded-full bg-gray-900 hover:bg-blue-700 hover:text-white transition duration-300"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button
              className="px-4 py-2 border border-blue-400 rounded-full bg-gray-900 hover:bg-blue-700 hover:text-white transition duration-300"
              onClick={() => setShowSignup(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 flex-grow bg-gradient-to-r from-blue-800 to-purple-800">
        <h1 className="text-6xl font-extrabold mb-4 text-white">
          Craft Your Visuals with Precision
        </h1>
        <p className="text-xl text-gray-200 mb-8">
          Transform ideas into stunning diagrams effortlessly.
        </p>
        <button className="px-8 py-4 bg-blue-700 text-white rounded-full text-lg font-medium hover:bg-blue-600 transition duration-300">
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-blue-400">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 text-center">
              <BarChart className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Flowcharts</h3>
              <p className="text-gray-400">
                Create intuitive flowcharts with ease and clarity.
              </p>
            </div>
            <div className="p-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 text-center">
              <Database className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">ER Diagrams</h3>
              <p className="text-gray-400">
                Design comprehensive entity-relationship diagrams.
              </p>
            </div>
            <div className="p-8 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 text-center">
              <Layers className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">UML Diagrams</h3>
              <p className="text-gray-400">
                Develop detailed UML diagrams for your projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-8 text-center text-gray-400">
        <p>© 2025 VIZCRAFT. All rights reserved.</p>
      </footer>

      {/* Modals */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
    </div>
  );
};

export default Home;