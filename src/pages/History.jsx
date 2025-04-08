import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const History = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { email, type } = location.state || {};

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!email) {
          throw new Error("No email provided");
        }

        const body = { email };
        if (type) body.type = type;

        const response = await fetch(
          `https://b3gf3vw5tf.execute-api.us-east-1.amazonaws.com/dev/history`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        const data = await response.json();
        if (response.ok && data.success) {
          setHistoryItems(data.items);
        } else {
          throw new Error(data.error || "Failed to fetch history");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [email, type]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Navbar */}
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-blue-400 hover:underline"
        >
          Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold mb-8 text-center">Your History</h1>

        {loading ? (
          <div className="flex justify-center items-center">
            <p className="text-lg text-gray-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="flex justify-center items-center">
            <p className="text-lg text-gray-400">No history found.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyItems.map((item) => (
              <li
                key={item.diagram_id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <p className="text-sm text-gray-400 mb-2">
                  Created At: {new Date(item.created_at).toLocaleString()}
                </p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-lg font-semibold"
                >
                  {item.diagram_type?.toUpperCase()} Diagram - {item.diagram_id}
                </a>
                <button
                  onClick={() => window.open(item.s3_link, "_blank")}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition duration-300"
                >
                  S3 Link
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default History;