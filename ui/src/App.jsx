import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Templates from './pages/Templates';
import Send from './pages/Send';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import WhatsAppSetup from './pages/WhatsAppSetup';
import { useWhatsAppStore } from './stores/whatsappStore';

function App() {
  const { isConnected, checkStatus } = useWhatsAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check WhatsApp status on app load
    checkStatus().finally(() => setLoading(false));
  }, [checkStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isConnected ? (
          <Route path="*" element={<WhatsAppSetup />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="templates" element={<Templates />} />
            <Route path="send" element={<Send />} />
            <Route path="logs" element={<Logs />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
