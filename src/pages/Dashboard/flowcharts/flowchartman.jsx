import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Trash2, ArrowRight, Save, Loader2, Download } from "lucide-react";

const FlowchartMan = () => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([
    { id: "1", label: "Start", type: "start" },
    { id: "2", label: "End", type: "end" }
  ]);
  const [edges, setEdges] = useState([]);
  const [newNode, setNewNode] = useState({ label: "", type: "process" });
  const [newEdge, setNewEdge] = useState({ from: "", to: "", label: "" });
  const [selectedTab, setSelectedTab] = useState("nodes");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [svgContent, setSvgContent] = useState('');
  const [s3Url, setS3Url] = useState('');

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

  const saveFlowchart = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const email = "hgella91@gmail.com";
      const flowchartData = { nodes, edges };
      
      const response = await fetch(
        'https://b3gf3vw5tf.execute-api.us-east-1.amazonaws.com/dev/flowchartgenman',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            flowchart_data: flowchartData
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save flowchart');
      }

      setSvgContent(data.svg);
      setS3Url(data.s3_url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
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
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="h-5 w-5 mr-2 transform rotate-180" />
            Back to Dashboard
          </button>
        </div>

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manual Flowchart Builder</h1>
          <p className="text-gray-400">Create your flowchart by adding nodes and connections</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex border-b border-gray-700 mb-4">
                <button
                  className={`py-2 px-4 font-medium ${selectedTab === "nodes" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
                  onClick={() => setSelectedTab("nodes")}
                >
                  Nodes
                </button>
                <button
                  className={`py-2 px-4 font-medium ${selectedTab === "edges" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
                  onClick={() => setSelectedTab("edges")}
                >
                  Connections
                </button>
              </div>

              {selectedTab === "nodes" ? (
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
                  <div className="space-y-2">
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
                    <div className="space-y-2">
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

              <div className="mt-6 space-y-2">
                {error && (
                  <div className="p-2 bg-red-900/50 border border-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-2 bg-green-900/50 border border-green-700 rounded-lg text-sm">
                    Flowchart saved successfully!
                  </div>
                )}
                <button
                  onClick={saveFlowchart}
                  disabled={isSaving}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Flowchart'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section - Modified for centered display */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Flowchart Preview</h2>
                {svgContent && (
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadSVG}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" /> Download SVG
                    </button>
                    {s3Url && (
                      <a
                        href={s3Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center"
                      >
                        View in S3
                      </a>
                    )}
                  </div>
                )}
              </div>

              {isSaving && !svgContent ? (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-lg">
                  <Loader2 className="h-12 w-12 text-white mb-4 animate-spin" />
                  <p className="text-gray-400">Generating your flowchart...</p>
                </div>
              ) : svgContent ? (
                <div className="bg-white rounded-lg overflow-hidden flex justify-center items-center min-h-[400px]">
                  <div 
                    className="p-4 w-full max-w-full overflow-auto flex justify-center"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-lg">
                  <ArrowRight className="h-16 w-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-center max-w-md">
                    Build your flowchart and click "Generate" to create your diagram.
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

export default FlowchartMan;