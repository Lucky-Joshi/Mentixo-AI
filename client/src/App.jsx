import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UsageProvider } from './context/UsageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import UpgradeModal from './components/UpgradeModal';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Notes from './pages/Notes';
import Quiz from './pages/Quiz';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useUsage } from './context/UsageContext';

// Thin wrapper so UpgradeModal can read context
const UpgradeModalWrapper = () => {
  const { showUpgradeModal, closeUpgradeModal } = useUsage();
  return <UpgradeModal isOpen={showUpgradeModal} onClose={closeUpgradeModal} />;
};

function App() {
  return (
    <AuthProvider>
      <UsageProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="chat" element={<Chat />} />
                <Route path="notes" element={<Notes />} />
                <Route path="quiz" element={<Quiz />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>
          </Routes>
        </Router>
        <UpgradeModalWrapper />
      </UsageProvider>
    </AuthProvider>
  );
}

export default App;
