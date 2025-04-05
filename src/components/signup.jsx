import React, { useState } from "react";
import VerifyOTP from "./verifyOTP";

const Signup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showVerifyOTP, setShowVerifyOTP] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch(
        "https://b3gf3vw5tf.execute-api.us-east-1.amazonaws.com/dev/signup_tcg",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Signup successful! Please verify your OTP.");
        setShowVerifyOTP(true);
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (error) {
      alert("An error occurred during signup.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return showVerifyOTP ? (
    <VerifyOTP email={email} onClose={onClose} />
  ) : (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-700 bg-gray-800 text-white p-3 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-700 bg-gray-800 text-white p-3 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-700 bg-gray-800 text-white p-3 w-full rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-between items-center">
          <button
            onClick={handleSignup}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition duration-300"
            disabled={loading}
          >
            {loading ? (
              <div className="loader border-t-2 border-white border-solid rounded-full w-5 h-5 animate-spin"></div>
            ) : (
              "Sign Up"
            )}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition duration-300"
            disabled={loading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;