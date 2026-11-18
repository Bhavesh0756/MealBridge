import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NotificationDrawer } from './components/NotificationDrawer';

import { LandingPage } from './pages/LandingPage';
import { BrowseFeedPage } from './pages/BrowseFeedPage';
import { SmartMatchmakerPage } from './pages/SmartMatchmakerPage';
import { ImpactAnalyticsPage } from './pages/ImpactAnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { NgoDashboard } from './pages/NgoDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function getRoleDashboardPath(role) {
  if (role === 'DONOR') return '/dashboard/donor';
  if (role === 'NGO') return '/dashboard/ngo';
  if (role === 'VOLUNTEER') return '/dashboard/volunteer';
  if (role === 'ADMIN') return '/dashboard/admin';
  return '/';
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }
  return children;
}

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getRoleDashboardPath(user.role)} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <NotificationDrawer />
            <main className="flex-1">
              <Routes>
                {/* Public & Core Discovery Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/browse" element={<BrowseFeedPage />} />
                <Route path="/matchmaker" element={<SmartMatchmakerPage />} />
                <Route path="/impact" element={<ImpactAnalyticsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Generic Dashboard Route */}
                <Route path="/dashboard" element={<DashboardRedirect />} />

                {/* Role Specific Dashboard Consoles */}
                <Route
                  path="/dashboard/donor"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/ngo"
                  element={
                    <ProtectedRoute allowedRoles={['NGO']}>
                      <NgoDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/volunteer"
                  element={
                    <ProtectedRoute allowedRoles={['VOLUNTEER']}>
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
