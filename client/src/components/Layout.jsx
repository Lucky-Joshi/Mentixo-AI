import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UpgradeModal from './UpgradeModal';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { showUpgradeModal, setShowUpgradeModal } = useAuth();

  // Listen for the custom event fired by the axios interceptor
  useEffect(() => {
    const handler = () => setShowUpgradeModal(true);
    window.addEventListener('mentixo:limit-exceeded', handler);
    return () => window.removeEventListener('mentixo:limit-exceeded', handler);
  }, [setShowUpgradeModal]);

  return (
    <div className="flex min-h-screen bg-background text-text-main">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};

export default Layout;
