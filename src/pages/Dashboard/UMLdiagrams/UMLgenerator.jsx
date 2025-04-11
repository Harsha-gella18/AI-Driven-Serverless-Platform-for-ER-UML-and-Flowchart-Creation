import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Trash2, ArrowRight, Save, Loader2, Download, Wand2, Edit, Maximize2, Minimize2 } from "lucide-react";
import Cookies from "js-cookie";

const UMLGenerator = () => {
  const navigate = useNavigate();
  const diagramContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // State for both AI and manual generation
  const [activeTab, setActiveTab] = useState("ai");
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Manual editor state
  const [classes, setClasses] = useState([
    { 
      id: "1", 
      name: "User", 
      attributes: ["- id: String", "- name: String"], 
      methods: ["+ login()", "+ logout()"],
      x: 100,
      y: 100
    }
  ]);
  const [relationships, setRelationships] = useState([]);
  const [newClass, setNewClass] = useState({ 
    name: "", 
    attributes: [], 
    methods: [],
    newAttribute: "",
    newMethod: ""
  });
  const [editingClass, setEditingClass] = useState(null);
  const [newRelationship, setNewRelationship] = useState({ 
    from: "", 
    to: "", 
    type: "association",
    label: ""
  });
  const [selectedManualTab, setSelectedManualTab] = useState("classes");
  
  // Output state
  const [svgContent, setSvgContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingToS3, setIsSavingToS3] = useState(false);
  
  // Current user email (mock)
  const currentUser = { email: localStorage.getItem('userEmail') || '' };

  // Fullscreen toggle function
  const toggleFullscreen = () => {
    if (!diagramContainerRef.current) return;

    if (!isFullscreen) {
      if (diagramContainerRef.current.requestFullscreen) {
        diagramContainerRef.current.requestFullscreen();
      } else if (diagramContainerRef.current.webkitRequestFullscreen) {
        diagramContainerRef.current.webkitRequestFullscreen();
      } else if (diagramContainerRef.current.msRequestFullscreen) {
        diagramContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // AI Generation handler
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
        import.meta.env.VITE_API_UML_AI_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('authToken')}`,
          },
          body: JSON.stringify({
            email: currentUser.email,
            prompt: prompt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate UML diagram');
      }

      if (data.classes && data.relationships) {
        setClasses(data.classes);
        setRelationships(data.relationships);
        setSvgContent(data.svg);
      } else {
        throw new Error("Invalid response format - missing classes and relationships");
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setActiveTab("manual");
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Class editing functions
  const startEditingClass = (cls) => {
    setEditingClass(cls);
    setNewClass({
      name: cls.name,
      attributes: [...cls.attributes],
      methods: [...cls.methods],
      newAttribute: "",
      newMethod: ""
    });
  };

  const cancelEditing = () => {
    setEditingClass(null);
    setNewClass({ 
      name: "", 
      attributes: [], 
      methods: [],
      newAttribute: "",
      newMethod: ""
    });
  };

  const updateClass = () => {
    if (!newClass.name) {
      setError("Class name is required");
      return;
    }

    setClasses(classes.map(cls => 
      cls.id === editingClass.id ? { 
        ...cls, 
        name: newClass.name,
        attributes: [...newClass.attributes],
        methods: [...newClass.methods]
      } : cls
    ));
    cancelEditing();
  };

  const addClass = () => {
    if (!newClass.name) {
      setError("Class name is required");
      return;
    }
    
    const id = (classes.length + 1).toString();
    setClasses([...classes, { 
      id, 
      name: newClass.name, 
      attributes: [...newClass.attributes],
      methods: [...newClass.methods],
      x: 100,
      y: 100 + (classes.length * 150)
    }]);
    setNewClass({ 
      name: "", 
      attributes: [], 
      methods: [],
      newAttribute: "",
      newMethod: ""
    });
    setError(null);
  };

  const removeClass = (id) => {
    setClasses(classes.filter(cls => cls.id !== id));
    setRelationships(relationships.filter(rel => 
      rel.from !== id && rel.to !== id
    ));
  };

  const addAttribute = () => {
    if (!newClass.newAttribute) {
      setError("Attribute cannot be empty");
      return;
    }
    setNewClass({
      ...newClass,
      attributes: [...newClass.attributes, newClass.newAttribute],
      newAttribute: ""
    });
    setError(null);
  };

  const removeAttribute = (index) => {
    const newAttributes = [...newClass.attributes];
    newAttributes.splice(index, 1);
    setNewClass({
      ...newClass,
      attributes: newAttributes
    });
  };

  const addMethod = () => {
    if (!newClass.newMethod) {
      setError("Method cannot be empty");
      return;
    }
    setNewClass({
      ...newClass,
      methods: [...newClass.methods, newClass.newMethod],
      newMethod: ""
    });
    setError(null);
  };

  const removeMethod = (index) => {
    const newMethods = [...newClass.methods];
    newMethods.splice(index, 1);
    setNewClass({
      ...newClass,
      methods: newMethods
    });
  };

  const addRelationship = () => {
    if (!newRelationship.from || !newRelationship.to) {
      setError("Both 'From' and 'To' classes are required");
      return;
    }
    
    if (newRelationship.from === newRelationship.to) {
      setError("Cannot connect a class to itself");
      return;
    }
    
    setRelationships([...relationships, {
      ...newRelationship,
      id: `rel-${relationships.length + 1}`
    }]);
    setNewRelationship({ 
      from: "", 
      to: "", 
      type: "association",
      label: ""
    });
    setError(null);
  };

  const removeRelationship = (id) => {
    setRelationships(relationships.filter(rel => rel.id !== id));
  };

  // Save UML handler
  const saveUML = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch(
        import.meta.env.VITE_API_UML_MANUAL_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('authToken')}`,
          },
          body: JSON.stringify({
            email: currentUser.email,
            uml_data: { classes, relationships }
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save UML diagram');
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

  // Save UML to S3 and DynamoDB
  const saveToS3 = async () => {
    if (!svgContent) {
      setError("No UML diagram to save");
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
        type: "uml",
        isBase64Encoded: true
      };
  
      console.log("Sending payload:", payload); // Debug log
  
      const response = await fetch(
        import.meta.env.VITE_API_SAVE_UPLOAD_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('authToken')}`,
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
      setError(err.message || 'Failed to save UML diagram. Please try again.');
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
    link.download = 'uml-diagram.svg';
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
          <h1 className="text-4xl font-bold mb-2">UML Diagram Generator</h1>
          <p className="text-gray-400">
            {activeTab === "ai" 
              ? "Describe your system in natural language and let AI generate a UML diagram"
              : "Edit the generated diagram or create one manually"}
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
            <div 
              className={`bg-gray-800 rounded-lg p-6 shadow-lg h-full ${isFullscreen ? 'fixed inset-0 z-50 p-0 m-0 bg-gray-900' : ''}`}
              ref={diagramContainerRef}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">UML Diagram Preview</h2>
                <div className="flex gap-2">
                  {svgContent && (
                    <>
                      <button
                        onClick={toggleFullscreen}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-4 h-4 mr-1" />
                        ) : (
                          <Maximize2 className="w-4 h-4 mr-1" />
                        )}
                        {isFullscreen ? "Exit" : "Fullscreen"}
                      </button>
                      <button
                        onClick={downloadSVG}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" /> Download SVG
                      </button>
                    </>
                  )}
                </div>
              </div>

              {(isGenerating || isSaving || isSavingToS3) && !svgContent ? (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-lg">
                  <Loader2 className="h-12 w-12 text-white mb-4 animate-spin" />
                  <p className="text-gray-400">
                    {activeTab === "ai" ? "Generating" : "Saving"} your UML diagram...
                  </p>
                </div>
              ) : svgContent ? (
                <div className={`bg-white rounded-lg overflow-hidden ${isFullscreen ? 'h-[calc(100vh-100px)]' : 'min-h-[500px]'}`}>
                  <div 
                    className={`p-4 w-full h-full overflow-auto flex justify-center ${isFullscreen ? 'h-[calc(100vh-100px)]' : ''}`}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-lg">
                  <ArrowRight className="h-16 w-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-center max-w-md">
                    {activeTab === "ai" 
                      ? "Describe your system and click 'Generate' to create a UML diagram."
                      : "Add classes and relationships to build your diagram, then click 'Save' to generate it."}
                  </p>
                </div>
              )}

              {/* Save buttons moved under the diagram */}
              {activeTab === "manual" && !isFullscreen && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={saveUML}
                    disabled={isSaving || classes.length === 0}
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
                        Save UML Diagram
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Input Section - Moved to right side */}
          {!isFullscreen && (
            <div className="lg:w-1/3 space-y-6">
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                {activeTab === "ai" ? (
                  <>
                    <h2 className="text-xl font-semibold mb-4">Generate with AI</h2>
                    <form onSubmit={handleGenerate}>
                      <div className="mb-4">
                        <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                          Describe your system
                        </label>
                        <textarea
                          id="prompt"
                          rows="5"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                          placeholder="Example: Create a class diagram for an e-commerce system with User, Product, Order and Payment classes"
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
                          'Generate UML Diagram'
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="flex border-b border-gray-700 mb-4">
                      <button
                        className={`py-2 px-4 font-medium ${selectedManualTab === "classes" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
                        onClick={() => setSelectedManualTab("classes")}
                      >
                        Classes
                      </button>
                      <button
                        className={`py-2 px-4 font-medium ${selectedManualTab === "relationships" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
                        onClick={() => setSelectedManualTab("relationships")}
                      >
                        Relationships
                      </button>
                    </div>

                    {selectedManualTab === "classes" ? (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">
                          {editingClass ? `Edit ${editingClass.name}` : 'Add New Class'}
                        </h3>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Class Name*</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newClass.name}
                            onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                            placeholder="Class name"
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Attributes</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={newClass.newAttribute}
                              onChange={(e) => setNewClass({...newClass, newAttribute: e.target.value})}
                              placeholder="e.g., - id: String"
                            />
                            <button
                              onClick={addAttribute}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {newClass.attributes.map((attr, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                                <span className="font-mono text-sm">{attr}</span>
                                <button
                                  onClick={() => removeAttribute(index)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Methods</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={newClass.newMethod}
                              onChange={(e) => setNewClass({...newClass, newMethod: e.target.value})}
                              placeholder="e.g., + getName(): String"
                            />
                            <button
                              onClick={addMethod}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {newClass.methods.map((method, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                                <span className="font-mono text-sm">{method}</span>
                                <button
                                  onClick={() => removeMethod(index)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {editingClass ? (
                            <>
                              <button
                                onClick={updateClass}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center"
                              >
                                <Save className="w-4 h-4 mr-1" /> Update Class
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium flex items-center justify-center"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={addClass}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center"
                              disabled={!newClass.name}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add Class
                            </button>
                          )}
                        </div>

                        <h3 className="text-xl font-semibold mt-6 mb-4">Current Classes</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {classes.map((cls) => (
                            <div key={cls.id} className="bg-gray-700 p-3 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-blue-300">{cls.name}</h4>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => startEditingClass(cls)}
                                    className="text-blue-400 hover:text-blue-300 p-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => removeClass(cls.id)}
                                    className="text-red-400 hover:text-red-300 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-sm">
                                {cls.attributes.length > 0 && (
                                  <div className="mb-2">
                                    <div className="text-gray-400 text-xs mb-1">Attributes:</div>
                                    {cls.attributes.map((attr, i) => (
                                      <div key={i} className="font-mono text-xs">{attr}</div>
                                    ))}
                                  </div>
                                )}
                                {cls.methods.length > 0 && (
                                  <div>
                                    <div className="text-gray-400 text-xs mb-1">Methods:</div>
                                    {cls.methods.map((method, i) => (
                                      <div key={i} className="font-mono text-xs">{method}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Add New Relationship</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">From Class*</label>
                            <select
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={newRelationship.from}
                              onChange={(e) => setNewRelationship({...newRelationship, from: e.target.value})}
                              required
                            >
                              <option value="">Select source</option>
                              {classes.map(cls => (
                                <option key={`from-${cls.id}`} value={cls.id}>
                                  {cls.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">To Class*</label>
                            <select
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={newRelationship.to}
                              onChange={(e) => setNewRelationship({...newRelationship, to: e.target.value})}
                              required
                            >
                              <option value="">Select target</option>
                              {classes.map(cls => (
                                <option key={`to-${cls.id}`} value={cls.id}>
                                  {cls.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Type*</label>
                            <select
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={newRelationship.type}
                              onChange={(e) => setNewRelationship({...newRelationship, type: e.target.value})}
                              required
                            >
                              <option value="association">Association</option>
                              <option value="inheritance">Inheritance</option>
                              <option value="composition">Composition</option>
                              <option value="aggregation">Aggregation</option>
                              <option value="dependency">Dependency</option>
                            </select>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Label (optional)</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newRelationship.label}
                            onChange={(e) => setNewRelationship({...newRelationship, label: e.target.value})}
                            placeholder="e.g., owns, uses"
                          />
                        </div>
                        <motion.button
                          onClick={addRelationship}
                          whileHover={{ scale: 1.05 }}
                          className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center"
                          disabled={!newRelationship.from || !newRelationship.to}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Relationship
                        </motion.button>

                        <h3 className="text-xl font-semibold mt-6 mb-4">Current Relationships</h3>
                        {relationships.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {relationships.map((rel) => {
                              const fromClass = classes.find(c => c.id === rel.from);
                              const toClass = classes.find(c => c.id === rel.to);
                              return (
                                <div key={rel.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                                  <div className="flex items-center">
                                    <span className="font-bold text-blue-300">{fromClass?.name}</span>
                                    <span className="mx-2 text-gray-400">
                                      {rel.type === 'inheritance' ? '◁———' : 
                                       rel.type === 'composition' ? '◆———' : 
                                       rel.type === 'aggregation' ? '◇———' : '———>'}
                                    </span>
                                    <span className="font-bold text-blue-300">{toClass?.name}</span>
                                    {rel.label && (
                                      <span className="ml-2 text-gray-400">[{rel.label}]</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeRelationship(rel.id)}
                                    className="text-red-400 hover:text-red-300 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-400 italic">No relationships added yet</p>
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
                      {activeTab === "ai" ? "UML diagram generated! Switch to Manual tab to edit." : "UML diagram saved successfully!"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UMLGenerator;