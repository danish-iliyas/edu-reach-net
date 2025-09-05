import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  UserCheck,
  Plus,
  Shield,
  BarChart3,
  School,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { storage, Company, User } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompany, setNewCompany] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [overallStats, setOverallStats] = useState<any>({});
  const [companyWiseData, setCompanyWiseData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const companiesData = storage.getCompanies();
    setCompanies(companiesData);

    // Get overall statistics
    const allStats = storage.getStatistics();
    setOverallStats(allStats);

    // Get company-wise detailed data
    const companyData = companiesData.map(company => {
      const stats = storage.getStatistics(company.id);
      const states = storage.getStates(company.id);
      const schools = storage.getSchools(company.id);
      const trainers = storage.getTrainers(company.id);
      const attendance = storage.getAttendance(company.id);
      
      return {
        ...company,
        stats,
        states,
        schools,
        trainers,
        todayAttendance: attendance.filter(a => a.date === new Date().toISOString().split('T')[0])
      };
    });
    setCompanyWiseData(companyData);
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCompany.name || !newCompany.username || !newCompany.password) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    const newCompanyData: Company = {
      id: `comp-${Date.now()}`,
      name: newCompany.name,
      username: newCompany.username,
      password: newCompany.password,
      createdAt: new Date().toISOString()
    };

    storage.addCompany(newCompanyData);
    storage.addUser({
      id: `user-${newCompanyData.id}`,
      username: newCompanyData.username,
      password: newCompanyData.password,
      role: 'company',
      companyId: newCompanyData.id
    });

    setNewCompany({ name: '', username: '', password: '' });
    loadData();
    
    toast({
      title: "Success",
      description: "Company registered successfully",
    });
  };

  const StatCard = ({ title, value, icon: Icon, description, gradient }: any) => (
    <Card className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${gradient}`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
        <Icon className="h-4 w-4 text-white/80" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className="text-xs text-white/70">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">System Administrator Portal</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Building2 className="w-4 h-4 mr-2" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Companies"
                value={companies.length}
                icon={Building2}
                description="Active organizations"
                gradient="bg-gradient-to-br from-primary to-primary/80"
              />
              <StatCard
                title="Total States"
                value={overallStats.totalStates || 0}
                icon={MapPin}
                description="Across all companies"
                gradient="bg-gradient-to-br from-accent to-accent/80"
              />
              <StatCard
                title="Total Schools"
                value={overallStats.totalSchools || 0}
                icon={School}
                description="Educational institutions"
                gradient="bg-gradient-to-br from-secondary to-secondary/80"
              />
              <StatCard
                title="Total Trainers"
                value={overallStats.totalTrainers || 0}
                icon={Users}
                description="Active instructors"
                gradient="bg-gradient-to-br from-destructive to-destructive/80"
              />
            </div>

            {/* Company-wise Overview */}
            <Card className="backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company-wise Data Overview
                </CardTitle>
                <CardDescription>Detailed breakdown by organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyWiseData.map((company) => (
                    <div key={company.id} className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{company.name}</h3>
                          <p className="text-sm text-muted-foreground">Login: {company.username}</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {company.stats.totalSchools} Schools
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl font-bold text-primary">{company.stats.totalStates}</div>
                          <div className="text-xs text-muted-foreground">States</div>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl font-bold text-accent-foreground">{company.stats.totalDistricts}</div>
                          <div className="text-xs text-muted-foreground">Districts</div>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl font-bold text-secondary-foreground">{company.stats.totalTrades}</div>
                          <div className="text-xs text-muted-foreground">Trades</div>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="text-2xl font-bold text-destructive">{company.stats.totalTrainers}</div>
                          <div className="text-xs text-muted-foreground">Trainers</div>
                        </div>
                      </div>

                      {/* State-wise breakdown */}
                      {company.states.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">State-wise Distribution:</h4>
                          <div className="flex flex-wrap gap-2">
                            {company.stats.stateWiseStats.map((state: any) => (
                              <Badge key={state.id} variant="secondary" className="text-xs">
                                {state.name}: {state.schools} schools
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            {/* Add New Company */}
            <Card className="backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Register New Company
                </CardTitle>
                <CardDescription>Add a new organization to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCompany} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                      placeholder="Enter company name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyUsername">Username</Label>
                    <Input
                      id="companyUsername"
                      value={newCompany.username}
                      onChange={(e) => setNewCompany({...newCompany, username: e.target.value})}
                      placeholder="Login username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPassword">Password</Label>
                    <Input
                      id="companyPassword"
                      type="password"
                      value={newCompany.password}
                      onChange={(e) => setNewCompany({...newCompany, password: e.target.value})}
                      placeholder="Login password"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Button type="submit" className="w-full md:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Register Company
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Companies List */}
            <Card className="backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle>Registered Companies</CardTitle>
                <CardDescription>All organizations in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>States</TableHead>
                      <TableHead>Schools</TableHead>
                      <TableHead>Trainers</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyWiseData.map((company) => (
                      <TableRow key={company.id} className="hover:bg-background/50">
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{company.username}</Badge>
                        </TableCell>
                        <TableCell>{company.stats.totalStates}</TableCell>
                        <TableCell>{company.stats.totalSchools}</TableCell>
                        <TableCell>{company.stats.totalTrainers}</TableCell>
                        <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Trainer Distribution */}
              <Card className="backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Trainer Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {companyWiseData.map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-3 rounded bg-background/30">
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.trainers.length} trainers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{company.todayAttendance.length} present today</p>
                          <p className="text-xs text-muted-foreground">
                            {company.trainers.length > 0 ? Math.round((company.todayAttendance.length / company.trainers.length) * 100) : 0}% attendance
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    System Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded bg-primary/5">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Companies Registered</p>
                        <p className="text-xs text-muted-foreground">{companies.length} total</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded bg-accent/5">
                      <div className="w-2 h-2 bg-accent-foreground rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Active Schools</p>
                        <p className="text-xs text-muted-foreground">{overallStats.totalSchools || 0} across all companies</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded bg-secondary/5">
                      <div className="w-2 h-2 bg-secondary-foreground rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Total Trainers</p>
                        <p className="text-xs text-muted-foreground">{overallStats.totalTrainers || 0} instructors</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;