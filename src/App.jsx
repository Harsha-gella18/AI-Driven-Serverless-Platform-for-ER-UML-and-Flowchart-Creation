import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UserDashboard from "./pages/Dashboard/userdashboard";
import FlowchartGenerator from "./pages/Dashboard/flowcharts/flowchartai";
import FlowchartMan from "./pages/Dashboard/flowcharts/flowchartman";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<UserDashboard />} /> 
        <Route path="/flowchart-ai" element={<FlowchartGenerator />} />
        <Route path='/flowchart-manual' element={<FlowchartMan />} />
      </Routes>
    </Router>
  );
}

export default App;