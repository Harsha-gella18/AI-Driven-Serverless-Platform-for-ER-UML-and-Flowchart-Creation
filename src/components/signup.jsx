import React, { useState } from "react";
import VerifyOTP from "./verifyOTP";

const Signup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showVerifyOTP, setShowVerifyOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true); // Start loading
    setError("");
    try {
      const response = await fetch(
        import.meta.env.VITE_API_SIGNUP_URL,
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
        setError(data.error || "Signup failed");
      }
    } catch (error) {
      setError("An error occurred during signup.");
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
        {error && (
          <div className="mb-4 p-2 bg-red-800 text-white rounded text-sm">
            {error}
          </div>
        )}
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
          className="border border-gray-700 bg-gray-800 text-white p-3 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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