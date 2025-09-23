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
      const res = await loginUser({ email, password }, role);
       console.log("Login Response:", res);
      // Map API user to your local User type
      const user: User = {
        id: res.user._id,
        username: res.user.username,
        email: res.user.email,
        role: role.toLowerCase(), // "superadmin" | "companyadmin" | "trainer"
        token: res.token,
      };

      // ✅ Save to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", res.token);

      onLogin(user);

      toast({
        title: "Login Successful",
        description: `Welcome ${res.user.username}!`,
      });
    } catch (error: any) {
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
    <div className='min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 flex items-center justify-center p-4'>
      <div className='relative w-full max-w-md'>
        <Card className='backdrop-blur-xl bg-card/80 border-0 shadow-2xl'>
          <CardHeader className='text-center pb-8'>
            <div className='flex justify-center mb-4'>
              <div className='p-4 bg-primary/10 rounded-full'>
                <Shield className='w-8 h-8 text-primary' />
              </div>
            </div>
            <CardTitle className='text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
              NSQF Portal
            </CardTitle>
            <CardDescription className='text-lg text-muted-foreground'>
              Multi-Tenant Education Management System
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            <form onSubmit={handleLogin} className='space-y-4'>
              {/* Role Dropdown */}
              <div className='space-y-2'>
                <Label htmlFor='role' className='text-sm font-medium'>
                  Role
                </Label>
                <select
                  id='role'
                  value={role}
                  onChange={(e) => setRole(e.target.value as LoginRole)}
                  className='w-full h-12 px-3 border rounded-lg bg-background/50'
                >
                  <option value='superadmin'>SuperAdmin</option>
                  <option value='companyadmin'>CompanyAdmin</option>
                  <option value='trainer'>Trainer</option>
                </select>
              </div>

              {/* Email */}
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-sm font-medium'>
                  Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='h-12'
                  placeholder='Enter your email'
                  required
                />
              </div>

              {/* Password */}
              <div className='space-y-2'>
                <Label htmlFor='password' className='text-sm font-medium'>
                  Password
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='h-12 pr-10'
                    placeholder='Enter your password'
                    required
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type='submit'
                className='w-full h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
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

// import React, { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Building2, Shield, GraduationCap, Eye, EyeOff } from 'lucide-react';
// import { storage, User } from '@/lib/storage';
// import { useToast } from '@/hooks/use-toast';
// import { loginUser, LoginRole } from '../service/authApi';

// interface LoginPageProps {
//   onLogin: (user: User) => void;
// }

// const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { toast } = useToast();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const user = storage.authenticateUser(username, password);
//       if (user) {
//         onLogin(user);
//         toast({
//           title: "Login Successful",
//           description: `Welcome ${user.role === 'admin' ? 'Administrator' : user.role === 'trainer' ? user.trainerData?.name || 'Trainer' : 'Company User'}!`,
//         });
//       } else {
//         toast({
//           title: "Login Failed",
//           description: "Invalid username or password",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "An error occurred during login",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const quickLogin = (user: string, pass: string, role: string) => {
//     setUsername(user);
//     setPassword(pass);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-grid-primary/[0.02] bg-[size:60px_60px]" />

//       <div className="relative w-full max-w-md">
//         {/* Floating Background Elements */}
//         <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
//         <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />

//         <Card className="backdrop-blur-xl bg-card/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
//           <CardHeader className="text-center pb-8">
//             <div className="flex justify-center mb-4">
//               <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
//                 <Shield className="w-8 h-8 text-primary animate-pulse" />
//               </div>
//             </div>
//             <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//               NSQF Portal
//             </CardTitle>
//             <CardDescription className="text-lg text-muted-foreground">
//               Multi-Tenant Education Management System
//             </CardDescription>
//           </CardHeader>

//           <CardContent className="space-y-6">
//             <form onSubmit={handleLogin} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="username" className="text-sm font-medium">Username</Label>
//                 <div className="relative group">
//                   <Input
//                     id="username"
//                     type="text"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     className="pl-4 pr-4 h-12 bg-background/50 border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-all duration-300 rounded-lg"
//                     placeholder="Enter your username"
//                     required
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-sm font-medium">Password</Label>
//                 <div className="relative group">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="pl-4 pr-12 h-12 bg-background/50 border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-all duration-300 rounded-lg"
//                     placeholder="Enter your password"
//                     required
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </Button>
//                   <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <div className="flex items-center gap-2">
//                     <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
//                     Signing In...
//                   </div>
//                 ) : (
//                   "Sign In"
//                 )}
//               </Button>
//             </form>

//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-border/50" />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-card px-2 text-muted-foreground">Demo Credentials</span>
//               </div>
//             </div>

//             <div className="grid gap-3">
//               <div
//                 className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-destructive/5 to-destructive/10 border border-destructive/20 hover:border-destructive/40 transition-all duration-300 cursor-pointer hover:scale-[1.02] group"
//                 onClick={() => quickLogin('admin', 'admin123', 'admin')}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-destructive/10 rounded-lg group-hover:bg-destructive/20 transition-colors">
//                     <Shield className="w-4 h-4 text-destructive" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Administrator</p>
//                     <p className="text-xs text-muted-foreground">Full system access</p>
//                   </div>
//                 </div>
//                 <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
//                   admin / admin123
//                 </Badge>
//               </div>

//               <div
//                 className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer hover:scale-[1.02] group"
//                 onClick={() => quickLogin('techskills', 'tech123', 'company')}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
//                     <Building2 className="w-4 h-4 text-primary" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">TechSkills Institute</p>
//                     <p className="text-xs text-muted-foreground">Company dashboard</p>
//                   </div>
//                 </div>
//                 <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
//                   techskills / tech123
//                 </Badge>
//               </div>

//               <div
//                 className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 hover:border-accent/40 transition-all duration-300 cursor-pointer hover:scale-[1.02] group"
//                 onClick={() => quickLogin('industrial', 'ind123', 'company')}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
//                     <Building2 className="w-4 h-4 text-accent-foreground" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Industrial Training</p>
//                     <p className="text-xs text-muted-foreground">Company dashboard</p>
//                   </div>
//                 </div>
//                 <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
//                   industrial / ind123
//                 </Badge>
//               </div>

//               <div
//                 className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-secondary/5 to-secondary/10 border border-secondary/20 hover:border-secondary/40 transition-all duration-300 cursor-pointer hover:scale-[1.02] group"
//                 onClick={() => quickLogin('digital', 'dig123', 'company')}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
//                     <Building2 className="w-4 h-4 text-secondary-foreground" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Digital Learning Hub</p>
//                     <p className="text-xs text-muted-foreground">Company dashboard</p>
//                   </div>
//                 </div>
//                 <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
//                   digital / dig123
//                 </Badge>
//               </div>
//             </div>

//             <div className="text-center text-xs text-muted-foreground">
//               <p>Click on any credential card to auto-fill the form</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
