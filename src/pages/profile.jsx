import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          setError("User email not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          import.meta.env.VITE_API_PROFILE_URL, // Use environment variable
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setProfile(data.profile);
          setHistory(data.history);
        } else {
          setError(data.error || "Failed to fetch profile.");
        }
      } catch (err) {
        setError("An error occurred while fetching the profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getNameFromUrl = (url) => {
    try {
      const parts = url.split("/");
      return parts[parts.length - 1].replace(".svg", "").slice(0, 8);
    } catch {
      return "Diagram";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
        <p className="text-2xl font-semibold animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900 text-red-500 text-xl font-medium text-center px-4">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <Navbar />

      {/* Back link at top-left under navbar */}
      <div className="px-6 mt-2">
        <span
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer text-sm text-white hover:underline"
        >
          &lt; Back to Dashboard
        </span>
      </div>

      <div className="flex flex-col items-center justify-start min-h-screen p-6 space-y-12">
        {/* Profile Info */}
        {profile && (
          <div className="w-full max-w-3xl bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-4xl font-bold mb-6 text-center text-white">
              👤 <span className="text-yellow-400">{profile.username}</span>
            </h2>
            <div className="space-y-3 text-lg">
              <p><strong className="text-white">📧 Email:</strong> {profile.email}</p>
              <p><strong className="text-white">🧾 Username:</strong> {profile.username}</p>
              <p>
                <strong className="text-white">🕒 Account Created:</strong>{" "}
                {new Date(profile.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Diagram History */}
        <div className="w-full max-w-6xl bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-4xl font-bold mb-6 text-center text-white">📚 Diagram History</h2>

          {Object.keys(history).length === 0 ? (
            <p className="text-center text-lg">No diagram history available.</p>
          ) : (
            Object.entries(history).map(([type, urls]) => (
              <div key={type} className="mb-10">
                <h3 className="text-3xl font-semibold capitalize mb-4 text-yellow-400">
                  {type}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {urls
                    .slice()
                    .reverse()
                    .map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow px-4 py-6 text-center transition duration-200 block"
                      >
                        <div className="text-lg font-bold mb-1 break-words">
                          {getNameFromUrl(url)}
                        </div>
                        <div className="text-sm text-gray-300">Open Diagram</div>
                      </a>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;