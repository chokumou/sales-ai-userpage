import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import VoiceRegistration from './pages/VoiceRegistration';
import Memory from './pages/Memory';
import Friends from './pages/Friends';
import Alarm from './pages/Alarm';
import Upgrade from './pages/Upgrade';
import PaymentHistory from './pages/PaymentHistory';
import Admin from './pages/Admin';
import DeviceRegistration from './pages/DeviceRegistration';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginForm />} />
      <Route path="/RegisterDevice" element={<DeviceRegistration />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="voice" element={<VoiceRegistration />} />
        <Route path="memory" element={<Memory />} />
        <Route path="friends" element={<Friends />} />
        <Route path="alarm" element={<Alarm />} />
        <Route path="upgrade" element={<Upgrade />} />
        <Route path="payments" element={<PaymentHistory />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;