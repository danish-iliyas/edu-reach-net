import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff } from "lucide-react";
import { User } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { loginUser, LoginRole } from "../service/authApi";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<LoginRole>("superadmin"); // default role
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔹 Attempting login with role:", role);
      console.log("🔹 Credentials:", { email, password });

      const res = await loginUser({ email, password }, role);

      console.log("✅ API Response:", res);

      // Map API user to your local User type
      const user: User = {
        id: res.user._id,
        username: res.user.fullName,
        email: res.user.email,
        role: role.toLowerCase(),
        token: res.token,
        companyName: res.user.companyId?.name || undefined,
        schoolName: res.user.schoolId?.name || undefined,
        tradeName: res.user.tradeId?.name || undefined,
      };

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", res.token);

      onLogin(user);

      toast({
        title: "Login Successful",
        description: `Welcome ${res.user.fullName}!`,
      });
    } catch (error: any) {
      console.error("❌ Login Error:", error);

      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20">
      {/* Left Branding Section */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-primary/10 relative overflow-hidden">
        <div className="text-center space-y-6 p-12 max-w-lg">
          <div className="inline-block p-6 bg-white/30 rounded-full backdrop-blur-md shadow-lg">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            NSQF Portal
          </h1>
          <p className="text-lg text-muted-foreground">
            A Multi-Tenant Education Management System for SuperAdmins,
            CompanyAdmins, and Trainers to manage schools, companies, and
            training programs seamlessly.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-xl bg-card/80">
          <CardHeader className="text-center space-y-2 pb-8">
            <CardTitle className="text-2xl font-semibold">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Role Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Select Role
                </Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as LoginRole)}
                  className="w-full h-12 px-3 border rounded-lg bg-background/50 focus:ring-2 focus:ring-primary"
                >
                  <option value="superadmin">SuperAdmin</option>
                  <option value="companyadmin">CompanyAdmin</option>
                  <option value="trainer">Trainer</option>
                </select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  placeholder="yourname@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
