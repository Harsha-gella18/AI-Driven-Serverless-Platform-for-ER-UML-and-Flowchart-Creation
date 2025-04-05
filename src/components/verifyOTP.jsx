import React, { useState } from "react";

const VerifyOTP = ({ email, onClose }) => {
  const [otp, setOtp] = useState("");

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch(
        "https://b3gf3vw5tf.execute-api.us-east-1.amazonaws.com/dev/verifyotp_tcg",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("OTP verified successfully!");
        onClose();
      } else {
        alert(data.error || "OTP verification failed");
      }
    } catch (error) {
      alert("An error occurred during OTP verification.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Verify OTP</h2>
        <p className="text-white mb-4 text-center">Email: {email}</p>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border border-gray-700 bg-gray-800 text-white p-3 w-full rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-between">
          <button
            onClick={handleVerifyOTP}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition duration-300"
          >
            Verify OTP
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;