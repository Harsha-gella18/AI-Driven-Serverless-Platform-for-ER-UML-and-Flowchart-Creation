import React from "react";
import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Star, History } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Add this import

const UserDashboard = () => {
  const navigate = useNavigate(); // Initialize navigate

  const options = [
    {
      title: "📊 Flowcharts",
      description: "Visualize your processes effortlessly with diagrams that speak clarity.",
      subOptions: [
        { 
          label: "📝 Manual", 
          action: () => navigate("/flowchart-manual") 
        },
        { 
          label: "🤖 Generate with AI", 
          action: () => navigate("/flowchart-ai") // Add navigation
        }
      ],
      sampleImage: "/FlowChart.png"
    },
    {
      title: "🗃️ ER Diagrams",
      description: "Design complex databases with ease and precision.",
      subOptions: [
        { label: "📝 Manual", action: () => console.log("Manual ER Diagram clicked") },
        { label: "🤖 Generate with AI", action: () => console.log("ER Diagram AI clicked") }
      ],
      sampleImage: "/path/to/erdiagram-sample.jpg"
    },
    {
      title: "📐 UML Diagrams",
      description: "Create software architecture blueprints like a pro.",
      subOptions: [
        { label: "📝 Manual", action: () => console.log("Manual UML clicked") },
        { label: "🤖 Generate with AI", action: () => console.log("UML AI clicked") }
      ],
      sampleImage: "/UMLimage.png"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      <Navbar />

      <div className="flex flex-col items-center justify-center flex-grow py-10 w-full h-full">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-blue-400 flex items-center justify-center space-x-2">
            <Sparkles className="w-8 h-8 animate-pulse" />
            <span>Your Creative Playground</span>
          </h1>
          <p className="text-gray-400 mt-4">Explore, design, and build with powerful tools.</p>
        </motion.div>

        {/* Scrollable Container */}
        <div className="flex justify-center w-full px-10 overflow-x-auto pb-6">
          <div className="flex gap-10 min-w-[1200px]">
            {options.map((option, index) => (
              <motion.div
                key={index}
                className="p-6 w-[350px] bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
              >
                <img src={option.sampleImage} alt="Sample Diagram" className="w-full h-48 object-cover rounded mb-4" />

                <div className="flex-1 text-center mb-4">
                  <h3 className="text-2xl font-semibold mb-2 flex items-center justify-center space-x-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <span>{option.title}</span>
                  </h3>
                  <p className="text-gray-400 mb-4">{option.description}</p>
                </div>

                <div className="flex flex-col w-full space-y-2">
                  {option.subOptions.map((subOption, subIndex) => (
                    <motion.button
                      key={subIndex}
                      className="w-full px-5 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-600 transition duration-300 flex items-center justify-between"
                      whileHover={{ x: 5 }}
                      onClick={subOption.action} // Add onClick handler
                    >
                      <span>{subOption.label}</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  ))}

                  <motion.button
                    className="w-full px-5 py-3 mt-4 bg-purple-700 text-white rounded-xl hover:bg-purple-600 transition duration-300 flex items-center justify-center space-x-2"
                    whileHover={{ x: 5 }}
                  >
                    <History className="w-4 h-4" />
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