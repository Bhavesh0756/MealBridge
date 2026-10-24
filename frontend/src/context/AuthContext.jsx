import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  { role: 'DONOR', label: 'Food Donor', org: 'The Green Bistro', email: 'greenbistro@mealbridge.org', password: 'Password@123' },
  { role: 'NGO', label: 'NGO / Recipient', org: 'HopeShare Food Bank', email: 'hopeshare@mealbridge.org', password: 'Password@123' },
  { role: 'VOLUNTEER', label: 'Volunteer', org: 'Alex Rivera (Bike)', email: 'volunteer.alex@mealbridge.org', password: 'Password@123' },
  { role: 'ADMIN', label: 'Administrator', org: 'MealBridge HQ', email: 'admin@mealbridge.org', password: 'Password@123' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mealbridge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await authApi.getCurrentUser();
      setUser(data);
      localStorage.setItem('mealbridge_user', JSON.stringify(data));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('mealbridge_access_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }

    const handleLogoutEvent = () => logout();
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('mealbridge_access_token', data.access);
    localStorage.setItem('mealbridge_refresh_token', data.refresh);
    await fetchProfile();
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    localStorage.setItem('mealbridge_access_token', res.tokens.access);
    localStorage.setItem('mealbridge_refresh_token', res.tokens.refresh);
    setUser(res.user);
    localStorage.setItem('mealbridge_user', JSON.stringify(res.user));
    return res;
  };

  const logout = () => {
    localStorage.removeItem('mealbridge_access_token');
    localStorage.removeItem('mealbridge_refresh_token');
    localStorage.removeItem('mealbridge_user');
    setUser(null);
  };

  const switchDemoAccount = async (email, password) => {
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchDemoAccount,
        refreshProfile: fetchProfile,
        refreshUser: fetchProfile,
        isAuthenticated: !!user,
        isDonor: user?.role === 'DONOR',
        isNgo: user?.role === 'NGO',
        isVolunteer: user?.role === 'VOLUNTEER',
        isAdmin: user?.role === 'ADMIN' || user?.is_staff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
