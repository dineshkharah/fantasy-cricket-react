import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import TeamPage from "./pages/TeamPage";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import ProtectedRoute from "./protected/ProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/players" element={<Players />} />
        <Route path="/team-selection" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
