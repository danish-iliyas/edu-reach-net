import React, { useState, useEffect } from "react";
import { User } from "@/lib/storage";
import LoginPage from "@/components/LoginPage";
import AdminDashboard from "@/components/AdminDashboard";
import CompanyDashboard from "@/components/CompanyDashboard";
import TrainerDashboard from "@/components/TrainerDashboard";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Restore user from localStorage on refresh
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem("user", JSON.stringify(authenticatedUser));
    localStorage.setItem("token", authenticatedUser.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading NSQF Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }


  // Route to appropriate dashboard based on user role
  if (user.role === "superadmin") {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  } else if (user.role === "companyadmin") {
    return <CompanyDashboard user={user} onLogout={handleLogout} />;
  } else if (user.role === "trainer") {
    return <TrainerDashboard user={user} onLogout={handleLogout} />;
  }

  // fallback
  return <LoginPage onLogin={handleLogin} />;
};

export default Index;
