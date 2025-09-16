import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  GraduationCap,
  MapPin,
  Briefcase,
  UserCheck,
  Plus,
  BarChart3,
  School,
  Filter,
  Eye,
} from "lucide-react";
import {
  storage,
  Company,
  User,
  State,
  District,
  Block,
  School as SchoolType,
  Trade,
  Trainer,
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import SchoolRegistrationForm from "./SchoolRegistrationForm";
import { createState } from "@/service/companyAdminApi";

interface CompanyDashboardProps {
  user: User;
  onLogout: () => void;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  user,
  onLogout,
}) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [filters, setFilters] = useState({
    stateId: "",
    districtId: "",
    blockId: "",
  });

  // Registration forms state
  const [newState, setNewState] = useState({ name: "" });
  const [newDistrict, setNewDistrict] = useState({ name: "", stateId: "" });
  const [newBlock, setNewBlock] = useState({ name: "", districtId: "" });
  const [showSchoolForm, setShowSchoolForm] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (user.companyId) {
      loadData();
    }
  }, [user.companyId, filters]);

  const loadData = () => {
    if (!user.companyId) return;

    const companyData = storage.getCompanyById(user.companyId);
    setCompany(companyData);

    const statesData = storage.getStates(user.companyId);
    const districtsData = storage.getDistricts(user.companyId);
    const blocksData = storage.getBlocks(user.companyId);
    const schoolsData = storage.getSchools(user.companyId);
    const tradesData = storage.getTrades(user.companyId);
    const trainersData = storage.getTrainers(user.companyId);
    const stats = storage.getStatistics(user.companyId);

    setStates(statesData);
    setDistricts(districtsData);
    setBlocks(blocksData);
    setSchools(schoolsData);
    setTrades(tradesData);
    setTrainers(trainersData);
    setStatistics(stats);
  };

  const filteredData = () => {
    let filteredStates = states;
    let filteredDistricts = districts;
    let filteredBlocks = blocks;
    let filteredSchools = schools;

    if (filters.stateId) {
      filteredStates = states.filter((s) => s.id === filters.stateId);
      filteredDistricts = districts.filter(
        (d) => d.stateId === filters.stateId
      );
      filteredBlocks = blocks.filter((b) =>
        filteredDistricts.some((d) => d.id === b.districtId)
      );
      filteredSchools = schools.filter((s) => s.stateId === filters.stateId);
    }

    if (filters.districtId) {
      filteredDistricts = filteredDistricts.filter(
        (d) => d.id === filters.districtId
      );
      filteredBlocks = blocks.filter(
        (b) => b.districtId === filters.districtId
      );
      filteredSchools = schools.filter(
        (s) => s.districtId === filters.districtId
      );
    }

    if (filters.blockId) {
      filteredBlocks = filteredBlocks.filter((b) => b.id === filters.blockId);
      filteredSchools = schools.filter((s) => s.blockId === filters.blockId);
    }

    return {
      states: filteredStates,
      districts: filteredDistricts,
      blocks: filteredBlocks,
      schools: filteredSchools,
    };
  };

  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newState.name) return;

    try {
      const response = await createState({ name: newState.name });
      setStates((prev) => [
        ...prev,
        {
          id: response._id, // map Mongo _id → frontend id
          name: response.name,
          companyId: response.companyId,
          createdAt: response.createdAt,
        },
      ]);

      setNewState({ name: "" });

      toast({
        title: "✅ Success",
        description: "State registered successfully",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to register state",
        variant: "destructive",
      });
    }
  };

  const handleAddDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrict.name || !newDistrict.stateId || !user.companyId) return;

    const district: District = {
      id: `district-${Date.now()}`,
      name: newDistrict.name,
      stateId: newDistrict.stateId,
      companyId: user.companyId,
      createdAt: new Date().toISOString(),
    };

    storage.addDistrict(district);
    setNewDistrict({ name: "", stateId: "" });
    loadData();
    toast({ title: "Success", description: "District added successfully" });
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlock.name || !newBlock.districtId || !user.companyId) return;

    const block: Block = {
      id: `block-${Date.now()}`,
      name: newBlock.name,
      districtId: newBlock.districtId,
      companyId: user.companyId,
      createdAt: new Date().toISOString(),
    };

    storage.addBlock(block);
    setNewBlock({ name: "", districtId: "" });
    loadData();
    toast({ title: "Success", description: "Block added successfully" });
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    gradient,
  }: any) => (
    <Card
      className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${gradient}`}
    >
      <div className='absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10' />
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-white/90'>
          {title}
        </CardTitle>
        <Icon className='h-4 w-4 text-white/80' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold text-white'>{value}</div>
        <p className='text-xs text-white/70'>{description}</p>
      </CardContent>
    </Card>
  );

  const filtered = filteredData();

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10'>
      {/* Header */}
      <div className='bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <Building2 className='w-6 h-6 text-primary' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-foreground'>
                  {company?.name || "Company Dashboard"}
                </h1>
                <p className='text-sm text-muted-foreground'>
                  Educational Management Portal
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              onClick={onLogout}
              className='hover:bg-destructive hover:text-destructive-foreground transition-colors'
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-6 py-8'>
        <Tabs defaultValue='dashboard' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm'>
            <TabsTrigger
              value='dashboard'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              <BarChart3 className='w-4 h-4 mr-2' />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value='register'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              <Plus className='w-4 h-4 mr-2' />
              Register
            </TabsTrigger>
            <TabsTrigger
              value='data'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              <Eye className='w-4 h-4 mr-2' />
              View Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value='dashboard' className='space-y-6'>
            {/* Statistics */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <StatCard
                title='Total States'
                value={statistics.totalStates || 0}
                icon={MapPin}
                description='Registered states'
                gradient='bg-gradient-to-br from-primary to-primary/80'
              />
              <StatCard
                title='Total Schools'
                value={statistics.totalSchools || 0}
                icon={School}
                description='Educational institutions'
                gradient='bg-gradient-to-br from-accent to-accent/80'
              />
              <StatCard
                title='Total Trades'
                value={statistics.totalTrades || 0}
                icon={Briefcase}
                description='Available courses'
                gradient='bg-gradient-to-br from-secondary to-secondary/80'
              />
              <StatCard
                title='Total Trainers'
                value={statistics.totalTrainers || 0}
                icon={Users}
                description='Active instructors'
                gradient='bg-gradient-to-br from-destructive to-destructive/80'
              />
            </div>

            {/* State-wise Statistics */}
            {statistics.stateWiseStats?.length > 0 && (
              <Card className='backdrop-blur-sm bg-card/80'>
                <CardHeader>
                  <CardTitle>State-wise Distribution</CardTitle>
                  <CardDescription>
                    School and infrastructure breakdown by state
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {statistics.stateWiseStats.map((state: any) => (
                      <div
                        key={state.id}
                        className='p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors'
                      >
                        <h3 className='font-semibold text-lg mb-2'>
                          {state.name}
                        </h3>
                        <div className='grid grid-cols-3 gap-2 text-center'>
                          <div>
                            <div className='text-xl font-bold text-primary'>
                              {state.districts}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              Districts
                            </div>
                          </div>
                          <div>
                            <div className='text-xl font-bold text-accent-foreground'>
                              {state.blocks}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              Blocks
                            </div>
                          </div>
                          <div>
                            <div className='text-xl font-bold text-secondary-foreground'>
                              {state.schools}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              Schools
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value='register' className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2'>
              {/* Register State */}
              <Card className='backdrop-blur-sm bg-card/80'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <MapPin className='w-5 h-5' />
                    Register State
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddState} className='space-y-4'>
                    <div>
                      <Label htmlFor='stateName'>State Name</Label>
                      <Input
                        id='stateName'
                        value={newState.name}
                        onChange={(e) => setNewState({ name: e.target.value })}
                        placeholder='Enter state name'
                        className='mt-1'
                      />
                    </div>
                    <Button type='submit' className='w-full'>
                      <Plus className='w-4 h-4 mr-2' />
                      Add State
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Register District */}
              <Card className='backdrop-blur-sm bg-card/80'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <MapPin className='w-5 h-5' />
                    Register District
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddDistrict} className='space-y-4'>
                    <div>
                      <Label htmlFor='districtState'>Select State</Label>
                      <Select
                        value={newDistrict.stateId}
                        onValueChange={(value) =>
                          setNewDistrict({ ...newDistrict, stateId: value })
                        }
                      >
                        <SelectTrigger className='mt-1'>
                          <SelectValue placeholder='Choose state' />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.id}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor='districtName'>District Name</Label>
                      <Input
                        id='districtName'
                        value={newDistrict.name}
                        onChange={(e) =>
                          setNewDistrict({
                            ...newDistrict,
                            name: e.target.value,
                          })
                        }
                        placeholder='Enter district name'
                        className='mt-1'
                      />
                    </div>
                    <Button
                      type='submit'
                      className='w-full'
                      disabled={!newDistrict.stateId}
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add District
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Register Block */}
              <Card className='backdrop-blur-sm bg-card/80'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <MapPin className='w-5 h-5' />
                    Register Block
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBlock} className='space-y-4'>
                    <div>
                      <Label htmlFor='blockDistrict'>Select District</Label>
                      <Select
                        value={newBlock.districtId}
                        onValueChange={(value) =>
                          setNewBlock({ ...newBlock, districtId: value })
                        }
                      >
                        <SelectTrigger className='mt-1'>
                          <SelectValue placeholder='Choose district' />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor='blockName'>Block Name</Label>
                      <Input
                        id='blockName'
                        value={newBlock.name}
                        onChange={(e) =>
                          setNewBlock({ ...newBlock, name: e.target.value })
                        }
                        placeholder='Enter block name'
                        className='mt-1'
                      />
                    </div>
                    <Button
                      type='submit'
                      className='w-full'
                      disabled={!newBlock.districtId}
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Block
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Register School */}
              <Card className='backdrop-blur-sm bg-card/80'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <School className='w-5 h-5' />
                    Register School
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowSchoolForm(true)}
                    className='w-full'
                    disabled={blocks.length === 0}
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Register School with Trades & Trainers
                  </Button>
                  {blocks.length === 0 && (
                    <p className='text-sm text-muted-foreground mt-2'>
                      Please add at least one block first
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='data' className='space-y-6'>
            {/* Filters */}
            <Card className='backdrop-blur-sm bg-card/80'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Filter className='w-5 h-5' />
                  Data Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <Label>Filter by State</Label>
                    <Select
                      value={filters.stateId}
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          stateId: value === "all" ? "" : value,
                          districtId: "",
                          blockId: "",
                        })
                      }
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue placeholder='All states' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All States</SelectItem>
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Filter by District</Label>
                    <Select
                      value={filters.districtId}
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          districtId: value === "all" ? "" : value,
                          blockId: "",
                        })
                      }
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue placeholder='All districts' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Districts</SelectItem>
                        {districts
                          .filter(
                            (d) =>
                              !filters.stateId || d.stateId === filters.stateId
                          )
                          .map((district) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Filter by Block</Label>
                    <Select
                      value={filters.blockId}
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          blockId: value === "all" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue placeholder='All blocks' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Blocks</SelectItem>
                        {blocks
                          .filter(
                            (b) =>
                              !filters.districtId ||
                              b.districtId === filters.districtId
                          )
                          .map((block) => (
                            <SelectItem key={block.id} value={block.id}>
                              {block.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schools Data */}
            <Card className='backdrop-blur-sm bg-card/80'>
              <CardHeader>
                <CardTitle>Schools & Trainers</CardTitle>
                <CardDescription>
                  Showing {filtered.schools.length} schools
                  {filters.stateId &&
                    ` in ${states.find((s) => s.id === filters.stateId)?.name}`}
                  {filters.districtId &&
                    ` in ${
                      districts.find((d) => d.id === filters.districtId)?.name
                    }`}
                  {filters.blockId &&
                    ` in ${blocks.find((b) => b.id === filters.blockId)?.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {filtered.schools.map((school) => {
                    const schoolTrades = trades.filter(
                      (t) => t.schoolId === school.id
                    );
                    const schoolTrainers = trainers.filter(
                      (t) => t.schoolId === school.id
                    );
                    const state = states.find((s) => s.id === school.stateId);
                    const district = districts.find(
                      (d) => d.id === school.districtId
                    );
                    const block = blocks.find((b) => b.id === school.blockId);

                    return (
                      <div
                        key={school.id}
                        className='p-4 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors'
                      >
                        <div className='flex items-center justify-between mb-3'>
                          <div>
                            <h3 className='font-semibold text-lg'>
                              {school.name}
                            </h3>
                            <p className='text-sm text-muted-foreground'>
                              {state?.name} → {district?.name} → {block?.name}
                            </p>
                          </div>
                          <div className='flex gap-2'>
                            <Badge variant='outline'>
                              {schoolTrades.length} Trades
                            </Badge>
                            <Badge variant='outline'>
                              {schoolTrainers.length} Trainers
                            </Badge>
                          </div>
                        </div>

                        {schoolTrades.length > 0 && (
                          <div className='space-y-2'>
                            <h4 className='font-medium text-sm'>
                              Trades & Trainers:
                            </h4>
                            <div className='grid gap-2 md:grid-cols-2'>
                              {schoolTrades.map((trade) => {
                                const tradeTrainers = schoolTrainers.filter(
                                  (t) => t.tradeId === trade.id
                                );
                                return (
                                  <div
                                    key={trade.id}
                                    className='p-2 rounded bg-background/50'
                                  >
                                    <div className='font-medium text-sm text-primary'>
                                      {trade.name}
                                    </div>
                                    {tradeTrainers.length > 0 ? (
                                      <div className='text-xs text-muted-foreground'>
                                        Trainers:{" "}
                                        {tradeTrainers
                                          .map((t) => t.name)
                                          .join(", ")}
                                      </div>
                                    ) : (
                                      <div className='text-xs text-muted-foreground'>
                                        No trainers assigned
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filtered.schools.length === 0 && (
                    <div className='text-center py-8 text-muted-foreground'>
                      No schools found with current filters
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* School Registration Modal */}
      {showSchoolForm && (
        <SchoolRegistrationForm
          companyId={user.companyId!}
          states={states}
          districts={districts}
          blocks={blocks}
          onClose={() => setShowSchoolForm(false)}
          onSuccess={() => {
            setShowSchoolForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default CompanyDashboard;
