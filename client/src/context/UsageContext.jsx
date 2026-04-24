import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UsageContext = createContext(null);

const MAX_DAILY = 30;

export const UsageProvider = ({ children }) => {
  const [remaining, setRemaining] = useState(MAX_DAILY);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Listen for usage updates from the Axios interceptor
  useEffect(() => {
    const handleUsageUpdate = (e) => {
      if (typeof e.detail?.remaining === 'number') {
        setRemaining(e.detail.remaining);
      }
    };

    const handleLimitExceeded = () => {
      setRemaining(0);
      setShowUpgradeModal(true);
    };

    window.addEventListener('mentixo:usage-update', handleUsageUpdate);
    window.addEventListener('mentixo:limit-exceeded', handleLimitExceeded);

    return () => {
      window.removeEventListener('mentixo:usage-update', handleUsageUpdate);
      window.removeEventListener('mentixo:limit-exceeded', handleLimitExceeded);
    };
  }, []);

  const closeUpgradeModal = useCallback(() => setShowUpgradeModal(false), []);

  return (
    <UsageContext.Provider value={{
      remaining,
      maxDaily: MAX_DAILY,
      used: MAX_DAILY - remaining,
      showUpgradeModal,
      setShowUpgradeModal,
      closeUpgradeModal,
    }}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};
