import React from "react";
import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import { BarChart, Database, Layers, ChevronRight, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: "📊 Flowcharts",
      description: "Visualize your workflows and ideas with clear, concise flowcharts.",
      buttonLabel: "Start Designing",
      action: () => navigate("/flowcharts"),
      icon: <BarChart className="w-20 h-20 text-blue-400" />,
      type: "flowchart",
    },
    {
      title: "🗃️ ER Diagrams",
      description: "Design and structure your databases with intuitive ER diagrams.",
      buttonLabel: "Start Designing",
      action: () => navigate("/ERdiagrams"),
      icon: <Database className="w-20 h-20 text-yellow-400" />,
      type: "erdiagram",
    },
    {
      title: "📐 UML Diagrams",
      description: "Map out software systems using professional UML diagrams.",
      buttonLabel: "Start Designing",
      action: () => navigate("/umldiagrams"),
      icon: <Layers className="w-20 h-20 text-purple-400" />,
      type: "uml",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      <Navbar />

      <div className="flex flex-col items-center justify-center flex-grow py-10 w-full h-full">
        <motion.div
          className="text-center mb-10 px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-400 flex items-center justify-center space-x-2">
            <BarChart className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
            <span>Your Creative Playground</span>
          </h1>
          <p className="text-gray-400 mt-4 text-sm md:text-base">
            Choose a tool and bring your ideas to life—clean, clear, and creative.
          </p>
        </motion.div>

        {/* Scrollable Cards Container */}
        <div className="flex justify-center w-full px-4 md:px-10 overflow-x-auto pb-6">
          <div className="flex flex-wrap gap-6 md:gap-12 justify-center">
            {options.map((option, index) => (
              <motion.div
                key={index}
                className="p-6 md:p-8 w-full max-w-[300px] md:max-w-[400px] bg-gradient-to-r from-gray-800 to-gray-700 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
              >
                {/* Icon at the top */}
                <div className="mb-6">{option.icon}</div>

                <div className="flex-1 text-center mb-6">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center justify-center space-x-2">
                    <span>{option.title}</span>
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base mb-6">{option.description}</p>
                </div>

                <div className="flex flex-col w-full space-y-4">
                  <motion.button
                    className="w-full px-4 md:px-6 py-3 md:py-4 bg-blue-700 text-white rounded-xl hover:bg-blue-600 transition duration-300 flex items-center justify-between"
                    whileHover={{ x: 5 }}
                    onClick={option.action}
                  >
                    <span>{option.buttonLabel}</span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    className="w-full px-4 md:px-6 py-3 md:py-4 bg-purple-700 text-white rounded-xl hover:bg-purple-600 transition duration-300 flex items-center justify-center space-x-3"
                    whileHover={{ x: 5 }}
                    onClick={() =>
                      navigate("/history", {
                        state: {
                          email: localStorage.getItem("userEmail"),
                          type: option.type,
                        },
                      })
                    }
                  >
                    <History className="w-5 h-5" />
                    <span>History</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;