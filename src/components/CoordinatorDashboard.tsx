import React from "react";
import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";

interface CoordinatorDashboardProps {
  user: User;
  onLogout: () => void;
}

const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">State Coordinator Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">{user.username}</div>
            <Button onClick={onLogout} variant="ghost">Logout</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-lg font-medium mb-2">Overview</h2>
            <p className="text-sm text-muted-foreground">Quick stats and actions for the state coordinator will appear here.</p>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-lg font-medium mb-2">Actions</h2>
            <p className="text-sm text-muted-foreground">Manage districts, view schools, and coordinate with company admins.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
