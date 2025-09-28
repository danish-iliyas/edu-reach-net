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
import { Badge } from "@/components/ui/badge";
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
  const [role, setRole] = useState<LoginRole>("SuperAdmin"); // default role
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
        username: res.user.fullName, // ✅ use fullName from API
        email: res.user.email,
        role: role.toLowerCase(),
        token: res.token,
        companyName: res.user.companyId?.name || undefined,
        schoolName: res.user.schoolId?.name || undefined,
        tradeName: res.user.tradeId?.name || undefined,
      };

      console.log("✅ Mapped User Object:", user);

      // ✅ Save to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", res.token);

      onLogin(user);

      toast({
        title: "Login Successful",
        description: `Welcome ${res.user.username}!`,
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <Card className="backdrop-blur-xl bg-card/80 border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NSQF Portal
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Multi-Tenant Education Management System
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Role Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role
                </Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as LoginRole)}
                  className="w-full h-12 px-3 border rounded-lg bg-background/50"
                >
                  <option value="superadmin">SuperAdmin</option>
                  <option value="companyadmin">CompanyAdmin</option>
                  <option value="trainer">Trainer</option>
                </select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  placeholder="Enter your email"
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
                    placeholder="Enter your password"
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
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
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
