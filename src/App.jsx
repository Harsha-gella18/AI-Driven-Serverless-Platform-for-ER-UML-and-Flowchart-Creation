import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UserDashboard from "./pages/Dashboard/userdashboard";
import FlowchartGenerator from "./pages/Dashboard/flowcharts/flowchartai";
// import FlowchartMan from "./pages/Dashboard/flowcharts/flowchartman";
import ProtectedRoute from "./protected";
import UMLGenerator from "./pages/Dashboard/UMLdiagrams/UMLgenerator";
import ERDiagramGenerator from "./pages/Dashboard/ERdiagrams/ERdiagram";
import History from "./pages/History";
import Profile from "./pages/profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } /> 
        <Route path="/flowcharts" element={
          <ProtectedRoute>
            <FlowchartGenerator />
          </ProtectedRoute>
        } />
        <Route path="/umldiagrams" element={
          <ProtectedRoute>
            <UMLGenerator />
          </ProtectedRoute>
        } />
        <Route path="/ERdiagrams" element={
          <ProtectedRoute>
            <ERDiagramGenerator />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;