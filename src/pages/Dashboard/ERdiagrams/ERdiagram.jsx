import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Trash2, ArrowRight, Save, Loader2, Download, Wand2, Edit2, Check } from "lucide-react";

const ERDiagramGenerator = () => {
  const navigate = useNavigate();
  
  // State for both AI and manual generation
  const [activeTab, setActiveTab] = useState("ai");
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Manual editor state
  const [entities, setEntities] = useState([
    { 
      id: "1", 
      name: "User", 
      attributes: [
        { name: "user_id", isKey: true, isMultivalued: false, isDerived: false },
        { name: "username", isKey: false, isMultivalued: false, isDerived: false },
        { name: "email", isKey: false, isMultivalued: false, isDerived: false }
      ],
      isWeak: false,
      x: 100,
      y: 100
    }
  ]);
  const [relationships, setRelationships] = useState([]);
  const [newEntity, setNewEntity] = useState({ 
    name: "", 
    attributes: [], 
    newAttribute: "",
    isKey: false,
    isMultivalued: false,
    isDerived: false,
    isWeak: false
  });
  const [newRelationship, setNewRelationship] = useState({ 
    from: "", 
    to: "", 
    type: "one-to-many",
    label: "",
    isIdentifying: false,
    isTotalParticipation: false
  });
  const [selectedManualTab, setSelectedManualTab] = useState("entities");
  
  // Editing state
  const [editingEntity, setEditingEntity] = useState(null);
  const [editingAttribute, setEditingAttribute] = useState(null);
  
  // Output state
  const [svgContent, setSvgContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Current user email (mock)
  const currentUser = { email: 'hgella91@gmail.com' };

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
        'https://b3gf3vw5tf.execute-api.us-east-1.amazonaws.com/dev/ERDiagramGenCSC',
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
        throw new Error(data.error || 'Failed to generate ER diagram');
      }

      // Update manual editor with AI-generated entities and relationships
      if (data.entities && data.relationships) {
        setEntities(data.entities);
        setRelationships(data.relationships);
        setSvgContent(data.svg);
      } else {
        throw new Error("Invalid response format - missing entities and relationships");
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
  const addEntity = () => {
    if (!newEntity.name) {
      setError("Entity name is required");
      return;
    }
    
    const id = (entities.length + 1).toString();
    setEntities([...entities, { 
      id, 
      name: newEntity.name, 
      attributes: [...newEntity.attributes],
      isWeak: newEntity.isWeak,
      x: 100,
      y: 100 + (entities.length * 150)
    }]);
    setNewEntity({ 
      name: "", 
      attributes: [], 
      newAttribute: "",
      isKey: false,
      isMultivalued: false,
      isDerived: false,
      isWeak: false
    });
    setError(null);
  };

  const removeEntity = (id) => {
    setEntities(entities.filter(entity => entity.id !== id));
    setRelationships(relationships.filter(rel => 
      rel.from !== id && rel.to !== id
    ));
  };

  const startEditEntity = (entity) => {
    setEditingEntity(entity);
    setNewEntity({
      name: entity.name,
      attributes: [...entity.attributes],
      newAttribute: "",
      isKey: false,
      isMultivalued: false,
      isDerived: false,
      isWeak: entity.isWeak
    });
  };

  const saveEditedEntity = () => {
    if (!editingEntity) return;
    
    const updatedEntities = entities.map(entity => {
      if (entity.id === editingEntity.id) {
        return {
          ...entity,
          name: newEntity.name,
          attributes: [...newEntity.attributes],
          isWeak: newEntity.isWeak
        };
      }
      return entity;
    });
    
    setEntities(updatedEntities);
    setEditingEntity(null);
    setNewEntity({ 
      name: "", 
      attributes: [], 
      newAttribute: "",
      isKey: false,
      isMultivalued: false,
      isDerived: false,
      isWeak: false
    });
  };

  const addAttribute = () => {
    if (!newEntity.newAttribute) {
      setError("Attribute cannot be empty");
      return;
    }
    setNewEntity({
      ...newEntity,
      attributes: [...newEntity.attributes, {
        name: newEntity.newAttribute,
        isKey: newEntity.isKey,
        isMultivalued: newEntity.isMultivalued,
        isDerived: newEntity.isDerived
      }],
      newAttribute: "",
      isKey: false,
      isMultivalued: false,
      isDerived: false
    });
    setError(null);
  };

  const startEditAttribute = (attribute, index) => {
    setEditingAttribute(index);
    setNewEntity({
      ...newEntity,
      newAttribute: attribute.name,
      isKey: attribute.isKey,
      isMultivalued: attribute.isMultivalued,
      isDerived: attribute.isDerived
    });
  };

  const saveEditedAttribute = () => {
    if (editingAttribute === null || !newEntity.newAttribute) return;
    
    const updatedAttributes = [...newEntity.attributes];
    updatedAttributes[editingAttribute] = {
      name: newEntity.newAttribute,
      isKey: newEntity.isKey,
      isMultivalued: newEntity.isMultivalued,
      isDerived: newEntity.isDerived
    };
    
    setNewEntity({
      ...newEntity,
      attributes: updatedAttributes,
      newAttribute: "",
      isKey: false,
      isMultivalued: false,
      isDerived: false
    });
    setEditingAttribute(null);
  };

  const removeAttribute = (index) => {
    const newAttributes = [...newEntity.attributes];
    newAttributes.splice(index, 1);
    setNewEntity({
      ...newEntity,
      attributes: newAttributes
    });
  };

  const addRelationship = () => {
    if (!newRelationship.from || !newRelationship.to) {
      setError("Both 'From' and 'To' entities are required");
      return;
    }
    
    if (newRelationship.from === newRelationship.to) {
      setError("Cannot connect an entity to itself");
      return;
    }
    
    setRelationships([...relationships, {
      ...newRelationship,
      id: `rel-${relationships.length + 1}`
    }]);
    setNewRelationship({ 
      from: "", 
      to: "", 
      type: "one-to-many",
      label: "",
      isIdentifying: false,
      isTotalParticipation: false
    });
    setError(null);
  };

  const removeRelationship = (id) => {
    setRelationships(relationships.filter(rel => rel.id !== id));
  };

  // Save ER diagram handler
  const saveERDiagram = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch(
        'https://b3gf3vw5tf.execute-api.us-east-1.amazonaws.com/dev/ERDiagramGenMan',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: currentUser.email,
            er_data: { entities, relationships }
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save ER diagram');
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

  const downloadSVG = () => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'er-diagram.svg';
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
          <h1 className="text-4xl font-bold mb-2">ER Diagram Generator</h1>
          <p className="text-gray-400">
            {activeTab === "ai" 
              ? "Describe your database schema in natural language and let AI generate an ER diagram"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              {activeTab === "ai" ? (
                <>
                  <h2 className="text-xl font-semibold mb-4">Generate with AI</h2>
                  <form onSubmit={handleGenerate}>
                    <div className="mb-4">
                      <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                        Describe your database schema
                      </label>
                      <textarea
                        id="prompt"
                        rows="5"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                        placeholder="Example: Create an ER diagram for an e-commerce system with Users, Products, Orders and Payments"
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
                        'Generate ER Diagram'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex border-b border-gray-700 mb-4">
                    <button
                      className={`py-2 px-4 font-medium ${selectedManualTab === "entities" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
                      onClick={() => setSelectedManualTab("entities")}
                    >
                      Entities
                    </button>
                    <button
                      className={`py-2 px-4 font-medium ${selectedManualTab === "relationships" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
                      onClick={() => setSelectedManualTab("relationships")}
                    >
                      Relationships
                    </button>
                  </div>

                  {selectedManualTab === "entities" ? (
                    <div>
                      {editingEntity ? (
                        <>
                          <h3 className="text-xl font-semibold mb-4">Edit Entity: {editingEntity.name}</h3>
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Entity Name*</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={newEntity.name}
                              onChange={(e) => setNewEntity({...newEntity, name: e.target.value})}
                              placeholder="Entity name"
                              required
                            />
                          </div>

                          <div className="mb-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={newEntity.isWeak}
                                onChange={(e) => setNewEntity({...newEntity, isWeak: e.target.checked})}
                              />
                              <span className="text-sm">Weak Entity (double border)</span>
                            </label>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                              {editingAttribute !== null ? "Edit Attribute" : "Add Attribute"}
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newEntity.newAttribute}
                                onChange={(e) => setNewEntity({...newEntity, newAttribute: e.target.value})}
                                placeholder="Attribute name"
                              />
                              {editingAttribute !== null ? (
                                <button
                                  onClick={saveEditedAttribute}
                                  className="px-3 bg-green-600 hover:bg-green-700 rounded-lg"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              ) : null}
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-1"
                                  checked={newEntity.isKey}
                                  onChange={(e) => setNewEntity({...newEntity, isKey: e.target.checked})}
                                />
                                Key
                              </label>
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-1"
                                  checked={newEntity.isMultivalued}
                                  onChange={(e) => setNewEntity({...newEntity, isMultivalued: e.target.checked})}
                                />
                                Multivalued
                              </label>
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-1"
                                  checked={newEntity.isDerived}
                                  onChange={(e) => setNewEntity({...newEntity, isDerived: e.target.checked})}
                                />
                                Derived
                              </label>
                            </div>
                            {editingAttribute === null && (
                              <button
                                onClick={addAttribute}
                                className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center"
                                disabled={!newEntity.newAttribute}
                              >
                                <Plus className="w-4 h-4 mr-1" /> Add Attribute
                              </button>
                            )}
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Current Attributes</label>
                            <div className="space-y-1">
                              {newEntity.attributes.map((attr, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                                  <div>
                                    <span className="font-mono text-sm">
                                      {attr.isKey ? <span className="underline">{attr.name}</span> : attr.name}
                                      {attr.isMultivalued && <span className="text-xs text-gray-400 ml-1">(M)</span>}
                                      {attr.isDerived && <span className="text-xs text-gray-400 ml-1">(D)</span>}
                                    </span>
                                  </div>
                                  <div className="flex">
                                    <button
                                      onClick={() => startEditAttribute(attr, index)}
                                      className="text-blue-400 hover:text-blue-300 p-1 mr-1"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => removeAttribute(index)}
                                      className="text-red-400 hover:text-red-300 p-1"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              onClick={saveEditedEntity}
                              whileHover={{ scale: 1.05 }}
                              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center"
                              disabled={!newEntity.name}
                            >
                              <Save className="w-4 h-4 mr-1" /> Save Changes
                            </motion.button>
                            <button
                              onClick={() => setEditingEntity(null)}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold mb-4">Add New Entity</h3>
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Entity Name*</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={newEntity.name}
                              onChange={(e) => setNewEntity({...newEntity, name: e.target.value})}
                              placeholder="Entity name"
                              required
                            />
                          </div>

                          <div className="mb-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={newEntity.isWeak}
                                onChange={(e) => setNewEntity({...newEntity, isWeak: e.target.checked})}
                              />
                              <span className="text-sm">Weak Entity (double border)</span>
                            </label>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Add Attribute</label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newEntity.newAttribute}
                                onChange={(e) => setNewEntity({...newEntity, newAttribute: e.target.value})}
                                placeholder="Attribute name"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-1"
                                  checked={newEntity.isKey}
                                  onChange={(e) => setNewEntity({...newEntity, isKey: e.target.checked})}
                                />
                                Key
                              </label>
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-1"
                                  checked={newEntity.isMultivalued}
                                  onChange={(e) => setNewEntity({...newEntity, isMultivalued: e.target.checked})}
                                />
                                Multivalued
                              </label>
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-1"
                                  checked={newEntity.isDerived}
                                  onChange={(e) => setNewEntity({...newEntity, isDerived: e.target.checked})}
                                />
                                Derived
                              </label>
                            </div>
                            <button
                              onClick={addAttribute}
                              className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center"
                              disabled={!newEntity.newAttribute}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add Attribute
                            </button>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Current Attributes</label>
                            <div className="space-y-1">
                              {newEntity.attributes.map((attr, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                                  <div>
                                    <span className="font-mono text-sm">
                                      {attr.isKey ? <span className="underline">{attr.name}</span> : attr.name}
                                      {attr.isMultivalued && <span className="text-xs text-gray-400 ml-1">(M)</span>}
                                      {attr.isDerived && <span className="text-xs text-gray-400 ml-1">(D)</span>}
                                    </span>
                                  </div>
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

                          <motion.button
                            onClick={addEntity}
                            whileHover={{ scale: 1.05 }}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center"
                            disabled={!newEntity.name}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Entity
                          </motion.button>

                          <h3 className="text-xl font-semibold mt-6 mb-4">Current Entities</h3>
                          <div className="space-y-2">
                            {entities.map((entity) => (
                              <div key={entity.id} className="bg-gray-700 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className={`font-bold ${entity.isWeak ? 'text-purple-300' : 'text-blue-300'}`}>
                                    {entity.name}
                                    {entity.isWeak && <span className="text-xs text-gray-400 ml-2">(Weak)</span>}
                                  </h4>
                                  <div className="flex">
                                    <button
                                      onClick={() => startEditEntity(entity)}
                                      className="text-blue-400 hover:text-blue-300 p-1 mr-1"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => removeEntity(entity.id)}
                                      className="text-red-400 hover:text-red-300 p-1"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-sm">
                                  {entity.attributes.length > 0 && (
                                    <div>
                                      <div className="text-gray-400 text-xs mb-1">Attributes:</div>
                                      {entity.attributes.map((attr, i) => (
                                        <div key={i} className="font-mono text-xs">
                                          {attr.isKey ? <span className="underline">{attr.name}</span> : attr.name}
                                          {attr.isMultivalued && <span className="text-xs text-gray-400 ml-1">(M)</span>}
                                          {attr.isDerived && <span className="text-xs text-gray-400 ml-1">(D)</span>}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Add New Relationship</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">From Entity*</label>
                          <select
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newRelationship.from}
                            onChange={(e) => setNewRelationship({...newRelationship, from: e.target.value})}
                            required
                          >
                            <option value="">Select source</option>
                            {entities.map(entity => (
                              <option key={`from-${entity.id}`} value={entity.id}>
                                {entity.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">To Entity*</label>
                          <select
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={newRelationship.to}
                            onChange={(e) => setNewRelationship({...newRelationship, to: e.target.value})}
                            required
                          >
                            <option value="">Select target</option>
                            {entities.map(entity => (
                              <option key={`to-${entity.id}`} value={entity.id}>
                                {entity.name}
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
                            <option value="one-to-one">One-to-One</option>
                            <option value="one-to-many">One-to-Many</option>
                            <option value="many-to-many">Many-to-Many</option>
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
                          placeholder="e.g., places, contains"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={newRelationship.isIdentifying}
                            onChange={(e) => setNewRelationship({...newRelationship, isIdentifying: e.target.checked})}
                          />
                          <span className="text-sm">Identifying Relationship</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={newRelationship.isTotalParticipation}
                            onChange={(e) => setNewRelationship({...newRelationship, isTotalParticipation: e.target.checked})}
                          />
                          <span className="text-sm">Total Participation</span>
                        </label>
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
                        <div className="space-y-2">
                          {relationships.map((rel) => {
                            const fromEntity = entities.find(e => e.id === rel.from);
                            const toEntity = entities.find(e => e.id === rel.to);
                            return (
                              <div key={rel.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                                <div className="flex items-center">
                                  <span className="font-bold text-blue-300">{fromEntity?.name}</span>
                                  <span className="mx-2 text-gray-400">
                                    {rel.type === 'one-to-one' ? '1 — 1' : 
                                     rel.type === 'one-to-many' ? '1 — M' : 
                                     'M — M'}
                                  </span>
                                  <span className="font-bold text-blue-300">{toEntity?.name}</span>
                                  {rel.label && (
                                    <span className="ml-2 text-gray-400">[{rel.label}]</span>
                                  )}
                                  {rel.isIdentifying && (
                                    <span className="ml-2 text-xs text-purple-300">(ID)</span>
                                  )}
                                  {rel.isTotalParticipation && (
                                    <span className="ml-2 text-xs text-green-300">(Total)</span>
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

              <div className="mt-6 space-y-2">
                {error && (
                  <div className="p-2 bg-red-900/50 border border-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-2 bg-green-900/50 border border-green-700 rounded-lg text-sm">
                    {activeTab === "ai" ? "ER diagram generated! Switch to Manual tab to edit." : "ER diagram saved successfully!"}
                  </div>
                )}
                
                {activeTab === "manual" && (
                  <button
                    onClick={saveERDiagram}
                    disabled={isSaving || entities.length === 0}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Update ER Diagram'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">ER Diagram Preview</h2>
                {svgContent && (
                  <button
                    onClick={downloadSVG}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" /> Download SVG
                  </button>
                )}
              </div>

              {(isGenerating || isSaving) && !svgContent ? (
                <div className="flex flex-col items-center justify-center h-96 bg-gray-900/50 rounded-lg">
                  <Loader2 className="h-12 w-12 text-white mb-4 animate-spin" />
                  <p className="text-gray-400">
                    {activeTab === "ai" ? "Generating" : "Saving"} your ER diagram...
                  </p>
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
                    {activeTab === "ai" 
                      ? "Describe your database schema and click 'Generate' to create an ER diagram."
                      : "Add entities and relationships to build your diagram, then click 'Save' to generate it."}
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

export default ERDiagramGenerator;