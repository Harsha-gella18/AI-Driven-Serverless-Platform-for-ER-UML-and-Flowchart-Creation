import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
const FlowchartGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [s3Url, setS3Url] = useState('');
  const navigate = useNavigate();

  // Mock user email - replace with your actual auth logic later
  const currentUser = { email: 'hgella91@gmail.com' };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        'https://b3gf3vw5tf.execute-api.us-east-1.amazonaws.com/dev/FlowChartGenCSC',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: currentUser.email,
            prompt: prompt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flowchart');
      }

      setSvgContent(data.svg);
      setS3Url(data.s3_url);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <Navbar />
      
      {/* Main Content Container */}
      <div className="container mx-auto px-4 pt-4">
        {/* Back Button - positioned right below Navbar */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Flowchart Generator</h1>
          <p className="text-gray-400">Describe your flowchart in natural language and let AI generate it for you</p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Generate Flowchart</h2>
              
              <form onSubmit={handleGenerate}>
                <div className="mb-4">
                  <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                    Describe your flowchart
                  </label>
                  <textarea
                    id="prompt"
                    rows="5"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Example: Create a flowchart for user login process with success and failure paths"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50"
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate Flowchart'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Generated Flowchart</h2>
              </div>

              {isGenerating && !svgContent ? (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-lg">
                  <svg className="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-400">Generating your flowchart...</p>
                </div>
              ) : svgContent ? (
                <div className="bg-white rounded-lg overflow-hidden">
                  <div 
                    className="p-4 w-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 text-center max-w-md">
                    Enter a description of your flowchart and click "Generate" to create your diagram.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartGenerator;