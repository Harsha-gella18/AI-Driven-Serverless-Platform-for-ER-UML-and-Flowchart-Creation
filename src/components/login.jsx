import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const Login = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://b3gf3vw5tf.execute-api.us-east-1.amazonaws.com/dev/login_tcg",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Store the token in cookies
        Cookies.set("authToken", data.id_token, {
          expires: 1,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        // Decode the ID token to get user details
        const decoded = jwtDecode(data.id_token);
        const userEmail = decoded.email;
        const userAID = decoded["cognito:username"];

        // Store user info in localStorage
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("userAID", userAID);

        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred during login. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
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
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-700 bg-gray-800 text-white p-3 w-full rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-between items-center">
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition duration-300 flex items-center justify-center min-w-20"
            disabled={loading}
          >
            {loading ? (
              <span className="loader border-t-2 border-white border-solid rounded-full w-5 h-5 animate-spin"></span>
            ) : (
              "Login"
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

export default Login;
