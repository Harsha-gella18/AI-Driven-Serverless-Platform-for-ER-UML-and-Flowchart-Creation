import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Trash2, ArrowRight, Save, Loader2, Download, Wand2 } from "lucide-react";

const FlowchartGenerator = () => {
  const navigate = useNavigate();
  
  // State for both AI and manual generation
  const [activeTab, setActiveTab] = useState("ai");
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Manual editor state
  const [nodes, setNodes] = useState([
    { id: "1", label: "Start", type: "start" },
    { id: "2", label: "End", type: "end" }
  ]);
  const [edges, setEdges] = useState([]);
  const [newNode, setNewNode] = useState({ label: "", type: "process" });
  const [newEdge, setNewEdge] = useState({ from: "", to: "", label: "" });
  const [selectedManualTab, setSelectedManualTab] = useState("nodes");
  
  // Output state
  const [svgContent, setSvgContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingToS3, setIsSavingToS3] = useState(false);
  
  // Current user email (mock)
  const currentUser = { email: localStorage.getItem('userEmail') || '' };  // AI Generation handler  // AI Generation handler
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

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
      console.log("AI Generation Response:", data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flowchart');
      }

      // Update manual editor with AI-generated nodes and edges
      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
        setSvgContent(data.svg);
      } else {
        throw new Error("Invalid response format - missing nodes and edges");
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Switch to manual tab after generation
      setActiveTab("manual");
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Manual editor functions
  const addNode = () => {
    if (!newNode.label) {
      setError("Node label is required");
      return;
    }
    
    const id = (nodes.length + 1).toString();
    setNodes([...nodes, { ...newNode, id }]);
    setNewNode({ label: "", type: "process" });
    setError(null);
  };

  const removeNode = (id) => {
    if (nodes.find(node => node.id === id)?.type === 'start' || 
        nodes.find(node => node.id === id)?.type === 'end') {
      setError("Start and End nodes cannot be removed");
      return;
    }
    
    setNodes(nodes.filter(node => node.id !== id));
    setEdges(edges.filter(edge => edge.from !== id && edge.to !== id));
    setError(null);
  };

  const addEdge = () => {
    if (!newEdge.from || !newEdge.to) {
      setError("Both 'From' and 'To' nodes are required");
      return;
    }
    
    if (newEdge.from === newEdge.to) {
      setError("Cannot connect a node to itself");
      return;
    }
    
    setEdges([...edges, newEdge]);
    setNewEdge({ from: "", to: "", label: "" });
    setError(null);
  };

  const removeEdge = (index) => {
    setEdges(edges.filter((_, i) => i !== index));
  };

  // Save flowchart handler (for preview)
  const saveFlowchart = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (!currentUser.email) {
        setError("User email not found. Please log in again.");
        return;
      }
      const response = await fetch(
        'https://b3gf3vw5tf.execute-api.us-east-1.amazonaws.com/dev/flowchartgenman',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: currentUser.email,
            flowchart_data: { nodes, edges }
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save flowchart');
      }

      setSvgContent(data.svg);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Save flowchart to S3 and DynamoDB
  const saveToS3 = async () => {
    if (!svgContent) {
      setError("No flowchart to save");
      return;
    }
  
    setIsSavingToS3(true);
    setError(null);
    setSuccess(false);
  
    try {
      // Convert SVG content to base64
      const svgBase64 = btoa(unescape(encodeURIComponent(svgContent)));
  
      // Create the request payload
      const payload = {
        email: currentUser.email,
        svg: svgBase64,
        type: 'flowchart',
        isBase64Encoded: true
      };
  
      console.log("Sending payload:", payload); // Debug log
  
      const response = await fetch(
        'https://b3gf3vw5tf.execute-api.us-east-1.amazonaws.com/dev/savenupload',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
  
      console.log("Response status:", response.status); // Debug log
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          errorData.message ||
          `Server returned ${response.status} status`
        );
      }
  
      const data = await response.json();
      console.log("Success response:", data); // Debug log
  
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      return data.s3_url;
    } catch (err) {
      console.error('Full error details:', err);
      setError(err.message || 'Failed to save flowchart. Please try again.');
      throw err;
    } finally {
      setIsSavingToS3(false);
    }
  };
  
  const downloadSVG = () => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowchart.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-4">
        <div className="mb-6">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="h-5 w-5 mr-2 transform rotate-180" />
            Back to Dashboard
          </button>
        </div>

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Flowchart Generator</h1>
          <p className="text-gray-400">
            {activeTab === "ai" 
              ? "Describe your flowchart in natural language and let AI generate it for you"
              : "Edit the generated flowchart or create one manually"}
          </p>
        </header>

        {/* Tab selector */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`py-3 px-6 font-medium flex items-center ${activeTab === "ai" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("ai")}
          >
            <Wand2 className="w-5 h-5 mr-2" />
            AI Generator
          </button>
          <button
            className={`py-3 px-6 font-medium flex items-center ${activeTab === "manual" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("manual")}
          >
            <Plus className="w-5 h-5 mr-2" />
            Manual Editor
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 pb-8">
          {/* Output Section - Moved to left */}
          <div className="lg:w-2/3">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Flowchart Preview</h2>
                {svgContent && (
                  <button
                    onClick={downloadSVG}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" /> Download SVG
                  </button>
                )}
              </div>

              {(isGenerating || isSaving || isSavingToS3) && !svgContent ? (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-lg">
                  <Loader2 className="h-12 w-12 text-white mb-4 animate-spin" />
                  <p className="text-gray-400">
                    {activeTab === "ai" ? "Generating" : "Saving"} your flowchart...
                  </p>
                </div>
              ) : svgContent ? (
                <div className="bg-white rounded-lg overflow-hidden flex justify-center items-center min-h-[500px]">
                  <div 
                    className="p-4 w-full h-full overflow-auto flex justify-center"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-lg">
                  <ArrowRight className="h-16 w-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-center max-w-md">
                    {activeTab === "ai" 
                      ? "Enter a description of your flowchart and click 'Generate' to create your diagram."
                      : "Add nodes and connections to build your flowchart, then click 'Save' to generate the diagram."}
                  </p>
                </div>
              )}

              {/* Save buttons moved under the diagram */}
              {activeTab === "manual" && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={saveFlowchart}
                    disabled={isSaving || nodes.length === 0}
                    className="py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Preview
                      </>
                    )}
                  </button>

                  <button
                    onClick={saveToS3}
                    disabled={isSavingToS3 || !svgContent}
                    className="py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {isSavingToS3 ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Flowchart
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Input Section - Moved to right side */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              {activeTab === "ai" ? (
                <>
                  <h2 className="text-xl font-semibold mb-4">Generate with AI</h2>
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

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50"
                      disabled={isGenerating || !prompt.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Flowchart'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex border-b border-gray-700 mb-4">
                    <button
                      className={`py-2 px-4 font-medium ${selectedManualTab === "nodes" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
                      onClick={() => setSelectedManualTab("nodes")}
                    >
                      Nodes
                    </button>
                    <button
                      className={`py-2 px-4 font-medium ${selectedManualTab === "edges" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
                      onClick={() => setSelectedManualTab("edges")}
                    >
                      Connections
                    </button>
                  </div>

                  {selectedManualTab === "nodes" ? (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Add New Node</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Label*</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newNode.label}
                            onChange={(e) => setNewNode({...newNode, label: e.target.value})}
                            placeholder="Node label"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type*</label>
                          <select
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newNode.type}
                            onChange={(e) => setNewNode({...newNode, type: e.target.value})}
                            required
                          >
                            <option value="process">Process</option>
                            <option value="decision">Decision</option>
                            <option value="input">Input</option>
                            <option value="output">Output</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <motion.button
                            onClick={addNode}
                            whileHover={{ scale: 1.05 }}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Node
                          </motion.button>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold mt-6 mb-4">Current Nodes</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {nodes.map((node) => (
                          <div key={node.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-3 ${
                                node.type === 'start' ? 'bg-green-500' : 
                                node.type === 'end' ? 'bg-red-500' : 
                                node.type === 'decision' ? 'bg-blue-500' : 
                                node.type === 'input' || node.type === 'output' ? 'bg-purple-500' : 'bg-yellow-500'
                              }`}></div>
                              <span>
                                <span className="font-mono text-blue-300">#{node.id}</span>: {node.label} 
                                <span className="text-gray-400 ml-2">({node.type})</span>
                              </span>
                            </div>
                            {!['start', 'end'].includes(node.type) && (
                              <button
                                onClick={() => removeNode(node.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Add New Connection</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">From Node*</label>
                          <select
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newEdge.from}
                            onChange={(e) => setNewEdge({...newEdge, from: e.target.value})}
                            required
                          >
                            <option value="">Select source</option>
                            {nodes.map(node => (
                              <option key={`from-${node.id}`} value={node.id}>
                                #{node.id}: {node.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">To Node*</label>
                          <select
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newEdge.to}
                            onChange={(e) => setNewEdge({...newEdge, to: e.target.value})}
                            required
                          >
                            <option value="">Select target</option>
                            {nodes.map(node => (
                              <option key={`to-${node.id}`} value={node.id}>
                                #{node.id}: {node.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Label (optional)</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newEdge.label}
                            onChange={(e) => setNewEdge({...newEdge, label: e.target.value})}
                            placeholder="Connection label"
                          />
                        </div>
                        <div className="flex items-end">
                          <motion.button
                            onClick={addEdge}
                            whileHover={{ scale: 1.05 }}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center"
                            disabled={!newEdge.from || !newEdge.to}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Connection
                          </motion.button>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold mt-6 mb-4">Current Connections</h3>
                      {edges.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {edges.map((edge, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                              <div className="flex items-center">
                                <span className="font-mono text-blue-300">
                                  #{edge.from} → #{edge.to}
                                </span>
                                {edge.label && (
                                  <span className="ml-2 text-gray-400">[{edge.label}]</span>
                                )}
                              </div>
                              <button
                                onClick={() => removeEdge(index)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">No connections added yet</p>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="mt-4 space-y-2">
                {error && (
                  <div className="p-2 bg-red-900/50 border border-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-2 bg-green-900/50 border border-green-700 rounded-lg text-sm">
                    {activeTab === "ai" ? "Flowchart generated! Switch to Manual tab to edit." : "Flowchart saved successfully!"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartGenerator;