import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DAODashboard from './components/DAODashboard';
import DAOManagement from './components/DAOManagement';
import SignIn from './components/SignIn';
import ExplorePage from './components/ExplorePage';
import LaunchDAO from './components/LaunchDAO';
import Settings from './components/Settings';
import DAOStatus from './components/DAOStatus';
import Diagnostics from './components/Diagnostics';
import Navbar from './components/Navbar';
import MetricsDashboard from './components/MetricsDashboard';
import UserRegistrationHandler from './components/UserRegistrationHandler';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import { DAOManagementProvider } from './context/DAOManagementContext';
import { ToastProvider } from './context/ToastContext';
import Overview from './components/management/Overview';
import ManagementGovernance from './components/management/ManagementGovernance';
import ManagementStaking from './components/management/ManagementStaking';
import ManagementTreasury from './components/management/ManagementTreasury';
import ManagementProposals from './components/management/ManagementProposals';
import ManagementAssets from './components/management/ManagementAssets';
import ManagementAdmins from './components/management/ManagementAdmins';
import BackgroundParticles from './components/BackgroundParticles';
import './app.css';

function App() {
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <DAOManagementProvider>
          <Router>
          <ScrollToTop />
          <UserRegistrationHandler />
          {/* Create a stacking context so the fixed background sits behind everything */}
          <div className="App relative" style={{ isolation: 'isolate', minHeight: '100vh' }}>
            {/* Background mounted once, never re-mounts across routes */}
            <BackgroundParticles zIndex={-1} />

            {/* Foreground UI (Navbar + Routes) */}
            <div className="relative z-0">
              <Navbar />
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DAODashboard />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/metrics" element={<MetricsDashboard />} />
              <Route path="/status" element={<DAOStatus />} />
              <Route path="/admin/diagnostics" element={<Diagnostics />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/launch" element={<LaunchDAO />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dao/:daoId/manage" element={<DAOManagement />}>
                <Route index element={<Overview />} />
                <Route path="overview" element={<Overview />} />
                <Route path="governance" element={<ManagementGovernance />} />
                <Route path="staking" element={<ManagementStaking />} />
                <Route path="treasury" element={<ManagementTreasury />} />
                <Route path="proposals" element={<ManagementProposals />} />
                <Route path="assets" element={<ManagementAssets />} />
                <Route path="admins" element={<ManagementAdmins />} />
              </Route>
              </Routes>
            </div>
          </div>
        </Router>
      </DAOManagementProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
