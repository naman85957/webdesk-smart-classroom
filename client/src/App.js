import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Assignments from './pages/Assignments';
import Classes from './pages/Classes';
import Doubts from './pages/Doubts';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';

const PrivateLayout = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loader" style={{ height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader" style={{ height: '100vh' }}><div className="spinner" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
      <Route path="/materials" element={<PrivateLayout><Materials /></PrivateLayout>} />
      <Route path="/assignments" element={<PrivateLayout><Assignments /></PrivateLayout>} />
      <Route path="/classes" element={<PrivateLayout><Classes /></PrivateLayout>} />
      <Route path="/doubts" element={<PrivateLayout><Doubts /></PrivateLayout>} />
      <Route path="/schedule" element={<PrivateLayout><Schedule /></PrivateLayout>} />
      <Route path="/profile" element={<PrivateLayout><Profile /></PrivateLayout>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a2235', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.1)' },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
