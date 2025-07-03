import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import SignIn from './components/SignIn';
import LaunchDAO from './components/LaunchDAO';
import Settings from './components/Settings';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/launch" element={<LaunchDAO />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;