import React, { useState, useEffect } from 'react';
import { storage, User } from '@/lib/storage';
import LoginPage from '@/components/LoginPage';
import AdminDashboard from '@/components/AdminDashboard';
import CompanyDashboard from '@/components/CompanyDashboard';
import TrainerDashboard from '@/components/TrainerDashboard';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize storage with default data
    storage.initialize();
    setLoading(false);
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading NSQF Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Route to appropriate dashboard based on user role
  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  } else if (user.role === 'company') {
    return <CompanyDashboard user={user} onLogout={handleLogout} />;
  } else if (user.role === 'trainer') {
    return <TrainerDashboard user={user} onLogout={handleLogout} />;
  }

  return <LoginPage onLogin={handleLogin} />;
};

export default Index;
