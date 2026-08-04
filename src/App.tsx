import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { useIsMobile } from './hooks/useMediaQuery';
import { DesktopApp } from './components/desktop/DesktopApp';
import { MobileApp } from './components/mobile/MobileApp';
import { AdminPortal } from './admin/AdminPortal';
import { VendorPortal } from './vendor/VendorPortal';

const MainLayout: React.FC = () => {
  const isMobile = useIsMobile();

  return isMobile ? <MobileApp /> : <DesktopApp />;
};

function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (hash.startsWith('#/admin')) {
    return <AdminPortal />;
  }

  if (hash.startsWith('#/vendor')) {
    return <VendorPortal />;
  }

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;


