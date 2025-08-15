import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import SignIn from './components/SignIn';
import LaunchDAO from './components/LaunchDAO';
import Settings from './components/Settings';
import Proposals from './components/Proposals';
import Staking from './components/Staking';
import Treasury from './components/Treasury';
import Governance from './components/Governance';
import DAOStatus from './components/DAOStatus';
import Navbar from './components/Navbar';
import Assets from './components/Assets';
import UserRegistrationHandler from './components/UserRegistrationHandler';
import './app.css';

function App() {
  
  return (
    <Router>
      <UserRegistrationHandler />
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/status" element={<DAOStatus />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/launch" element={<LaunchDAO />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/treasury" element={<Treasury />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/assets" element={<Assets />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
