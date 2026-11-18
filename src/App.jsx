import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import TeamPage from "./pages/TeamPage";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import Admin from "./pages/Admin";

import ProtectedRoute from "./protected/ProtectedRoute";
import AdminRoute from "./protected/AdminRoute";

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
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
