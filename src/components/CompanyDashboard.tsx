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
  HardDriveDownload,
} from "lucide-react";
import * as XLSX from 'xlsx';
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
import ChartMapView from "./ChartMapView";
import { StateWiseTable } from "./StateWiseTable";
// FIX: Added getBlocks to the import list
import { createState, getStates, createDistrict, getDistricts, createBlock, getBlocks, getSchools, getTrades, getSchoolDetailsByBlock, getAllDetailsByCompany, getCompanyDetailsByBlockIdDistrictIdStateId } from "@/service/companyAdminApi";


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
  // Filtered company details (schools + trainers) via unified API
  const [companyDetails, setCompanyDetails] = useState<any[]>([]);
  const [isLoadingCompanyDetails, setIsLoadingCompanyDetails] = useState(false);
  const [companyDetailsError, setCompanyDetailsError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    stateId: "",
    districtId: "",
    blockId: "",
  });

  // Registration forms state
  const [newState, setNewState] = useState({ name: "" });
  const [newDistrict, setNewDistrict] = useState({ name: "", stateId: "" });
  const [newBlock, setNewBlock] = useState({
    name: "",
    districtId: "",
    pincode: "",
  });
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
    
    const trainersData = storage.getTrainers(user.companyId);
    setTrainers(trainersData);
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
          id: response._id,
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

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const data = await getStates();
        const formattedData = data.map((item: any) => ({ ...item, id: item._id }));
        setStates(formattedData);
        setStatistics((prev: any) => ({
          ...prev,
          totalStates: data.length,
        }));
      } catch (error) {
        console.error("Failed to fetch states", error);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const data = await getDistricts();
        // Normalize nested stateId object to primitive id for filtering
        const formattedData = data.map((item: any) => ({
          id: item._id,
          name: item.name,
          stateId: typeof item.stateId === 'object' ? item.stateId?._id : item.stateId,
          stateName: typeof item.stateId === 'object' ? item.stateId?.name : undefined,
          companyId: item.companyId,
          createdAt: item.createdAt,
        }));
        setDistricts(formattedData);
      } catch (error) {
        console.error("Failed to fetch districts", error);
      }
    };
    fetchDistricts();
  }, []);
  
  // FIX: Added a useEffect to fetch existing blocks when the component loads.
  // This ensures the "Register School" button has the correct state after a page refresh.
  useEffect(() => {
    const fetchBlocks = async () => {
        try {
            const data = await getBlocks();
            // Normalize nested district/state ids
            const formattedData = data.map((item: any) => ({
              id: item._id,
              name: item.name,
              districtId: typeof item.districtId === 'object' ? item.districtId?._id : item.districtId,
              districtName: typeof item.districtId === 'object' ? item.districtId?.name : undefined,
              stateId: typeof item.districtId === 'object'
                ? (typeof item.districtId.stateId === 'object'
                    ? item.districtId.stateId?._id
                    : item.districtId.stateId)
                : undefined,
              pincode: item.pincode,
              companyId: item.companyId,
              createdAt: item.createdAt,
            }));
            setBlocks(formattedData);
        } catch (error) {
            console.error("Failed to fetch blocks", error);
        }
    };
    fetchBlocks();
  }, []);


 useEffect(() => {
  const fetchSchools = async () => {
    try {
      const data = await getSchools();
      const formattedData = data.map((item: any) => ({ ...item, id: item._id }));
      setSchools(formattedData);

      setStatistics((prev: any) => ({
        ...prev,
        totalSchools: data.length,
      }));
    } catch (error) {
      console.error("Failed to fetch schools", error);
    }
  };

  fetchSchools();
}, []);

useEffect(() => {
  const fetchTrades = async () => {
    try {
      const data = await getTrades();
      const formattedData = data.map((item: any) => ({ ...item, id: item._id }));
      setTrades(formattedData);

      setStatistics((prev: any) => ({
        ...prev,
        totalTrades: data.length,
      }));
    } catch (error) {
      console.error("Failed to fetch trades", error);
    }
  };

  fetchTrades();
}, []);



  const handleAddDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrict.name || !newDistrict.stateId) return;

    try {
      await createDistrict({
        stateId: newDistrict.stateId,
        name: newDistrict.name,
      });

      const data = await getDistricts();
      const formattedData = data.map((item: any) => ({
        id: item._id,
        name: item.name,
        stateId: typeof item.stateId === 'object' ? item.stateId?._id : item.stateId,
        stateName: typeof item.stateId === 'object' ? item.stateId?.name : undefined,
        companyId: item.companyId,
        createdAt: item.createdAt,
      }));
      setDistricts(formattedData);

      setNewDistrict({ name: "", stateId: "" });
      toast({ title: "✅ Success", description: "District registered!" });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to register district",
        variant: "destructive",
      });
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlock.name || !newBlock.districtId || !newBlock.pincode) return;

    try {
      const response = await createBlock({
        name: newBlock.name,
        districtId: newBlock.districtId,
        pincode: newBlock.pincode,
      });

      setBlocks((prev) => [
        ...prev,
        {
          id: response._id,
          name: response.name,
          districtId: response.districtId._id,
          companyId: response.companyId,
          pincode: response.pincode,
          createdAt: response.createdAt,
        },
      ]);

      setNewBlock({ name: "", districtId: "", pincode: "" });

      toast({
        title: "✅ Success",
        description: "Block registered successfully",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to register block",
        variant: "destructive",
      });
    }
  };

 useEffect(() => {
  const fetchCompanyDetails = async () => {
    try {
      const data = await getAllDetailsByCompany();

      // Format to match StateWiseTable props
      const formattedStats = data.map((item: any) => ({
        id: item._id,
        name: item.name,
        districts: item.districtCount || 0,
        blocks: item.blockCount || 0,
        schools: item.schoolCount || 0,
      }));

      setStatistics((prev: any) => ({
        ...prev,
        stateWiseStats: formattedStats,
        totalStates: data.length,
        totalSchools: formattedStats.reduce((sum: number, s: any) => sum + s.schools, 0),
        totalTrainers: trainers.length, // still from storage
        totalTrades: trades.length,     // still from trades API
      }));
    } catch (error) {
      console.error("Failed to fetch company details", error);
    }
  };

  fetchCompanyDetails();
}, [trainers, trades]);

  // Fetch filtered company details (schools with trainers & trades) when filters applied
  useEffect(() => {
    const { stateId, districtId, blockId } = filters;
    // If no filters selected, clear companyDetails (we'll rely on generic schools list)
    if (!stateId && !districtId && !blockId) {
      setCompanyDetails([]);
      setCompanyDetailsError(null);
      return;
    }

    const run = async () => {
      setIsLoadingCompanyDetails(true);
      setCompanyDetailsError(null);
      try {
        const data = await getCompanyDetailsByBlockIdDistrictIdStateId(
          blockId || undefined,
          districtId || undefined,
          stateId || undefined
        );
        setCompanyDetails(data || []);
      } catch (err: any) {
        setCompanyDetailsError(err.message || 'Failed to fetch filtered data');
        setCompanyDetails([]);
      } finally {
        setIsLoadingCompanyDetails(false);
      }
    };
    run();
  }, [filters.stateId, filters.districtId, filters.blockId]);


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

  // Prepare & download Excel for currently visible school data
  const handleDownloadSchools = () => {
    try {
      const anyFilter = !!(filters.stateId || filters.districtId || filters.blockId);
      let rows: any[] = [];

      if (anyFilter) {
        // Use companyDetails shape from filtered API
        rows = companyDetails.map((item: any) => {
          const trainerNames = (item.trainers || []).map((t: any) => t.fullName || t.name).filter(Boolean);
          // Collect distinct trade names from trainers (if present) OR from grouped data if any
            const tradeNamesSet = new Set<string>();
            (item.trainers || []).forEach((t: any) => {
              if (t.tradeName) tradeNamesSet.add(t.tradeName);
            });
          return {
            School_ID: item._id,
            School_Name: item.name,
            Address: item.address || '',
            State: item.stateName || '',
            District: item.districtName || '',
            Block: item.blockName || '',
            Trades: Array.from(tradeNamesSet).join(', '),
            Trainers: trainerNames.join(', '),
            Total_Trainers: trainerNames.length,
            Total_Trades: tradeNamesSet.size,
          };
        });
      } else {
        // Use local schools state (already enriched partly)
        rows = filtered.schools.map((school: any) => {
          const apiTrades = Array.isArray(school.trades) ? school.trades : [];
          const legacyTrades = trades.filter((t) => t.schoolId === school.id);
          const schoolTrades = apiTrades.length ? apiTrades : legacyTrades;
          const schoolTrainers = trainers.filter(
            (t: any) => t.schoolId === school.id || t.schoolId === school._id
          );

          // Resolve hierarchy
          let block: any = null;
          let district: any = null;
          let state: any = null;
          if (school.blockId) {
            if (typeof school.blockId === 'object') {
              block = blocks.find((b) => b.id === school.blockId._id) || {
                id: school.blockId._id,
                name: school.blockId.name,
              };
            } else {
              block = blocks.find((b) => b.id === school.blockId);
            }
          } else if (school.block) {
            block = school.block;
          }
          if (block) {
            district = districts.find((d) => d.id === block.districtId);
            if (district) state = states.find((s) => s.id === district.stateId);
          }

          const tradeNames = schoolTrades.map((t: any) => t.name).filter(Boolean);
          const trainerNames = schoolTrainers.map((t: any) => t.fullName || t.name).filter(Boolean);
          return {
            School_ID: school.id || school._id,
            School_Name: school.name,
            Address: school.address || '',
            State: state?.name || '',
            District: district?.name || '',
            Block: block?.name || '',
            Trades: tradeNames.join(', '),
            Trainers: trainerNames.join(', '),
            Total_Trainers: trainerNames.length,
            Total_Trades: tradeNames.length,
          };
        });
      }

      if (!rows.length) {
        toast({
          title: 'No Data',
            description: 'There are no schools to export for current selection.'
        });
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Schools');
      XLSX.writeFile(workbook, 'schools-trainers-data.xlsx');
    } catch (err: any) {
      console.error('Export failed', err);
      toast({ title: 'Export Failed', description: err.message || 'Could not generate file', variant: 'destructive' });
    }
  };

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
                gradient='bg-gradient-to-br from-orange-500 to-orange-400/80'
              />
              <StatCard
                title='Total Trainers'
                value={statistics.totalTrainers || 0}
                icon={Users}
                description='Active instructors'
                gradient='bg-gradient-to-br from-destructive to-destructive/80'
              />
            </div>

            {/* Chart & Map Section */}
            <ChartMapView
              schools={schools}
              states={states}
              districts={districts}
              trades={trades}
              trainers={trainers}
            />
            

            {/* State-wise Table Statistics */}
            <StateWiseTable data={statistics.stateWiseStats || []} />
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
                            <SelectItem
                              key={state.id}
                              value={state.id}
                            >
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
                          setNewDistrict((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
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
                    {/* District Select */}
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
                            <SelectItem
                              key={district.id}
                              value={district.id}
                            >
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Block Name */}
                    <div>
                      <Label htmlFor='blockName'>Block Name</Label>
                      <Input
                        id='blockName'
                        placeholder='Enter block name'
                        value={newBlock.name}
                        onChange={(e) =>
                          setNewBlock({ ...newBlock, name: e.target.value })
                        }
                      />
                    </div>

                    {/* Pincode */}
                    <div>
                      <Label htmlFor='blockPincode'>Pincode</Label>
                      <Input
                        id='blockPincode'
                        placeholder='Enter pincode'
                        value={newBlock.pincode || ""}
                        onChange={(e) =>
                          setNewBlock({ ...newBlock, pincode: e.target.value })
                        }
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type='submit'
                      disabled={
                        !newBlock.name ||
                        !newBlock.districtId ||
                        !newBlock.pincode
                      }
                      className='w-full'
                    >
                      + Add Block
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

            {/* Schools Data (uses unified API when filters selected) */}
            <Card className='backdrop-blur-sm bg-card/80'>
              <CardHeader className='flex flex-row items-start justify-between gap-4'>
                <div className='space-y-1'>
                  <CardTitle className='flex items-center gap-3'>
                    <span>Schools & Trainers</span>
                  </CardTitle>
                  <CardDescription>
                  {(() => {
                    const anyFilter = !!(filters.stateId || filters.districtId || filters.blockId);
                    const count = anyFilter ? companyDetails.length : filtered.schools.length;
                    return `Showing ${count} schools`;
                  })()}
                  {filters.stateId && ` in ${states.find((s) => s.id === filters.stateId)?.name}`}
                  {filters.districtId && ` in ${districts.find((d) => d.id === filters.districtId)?.name}`}
                  {filters.blockId && ` in ${blocks.find((b) => b.id === filters.blockId)?.name}`}
                  </CardDescription>
                </div>
                <div className='pt-1'>
                  <Button variant='outline' size='icon' onClick={handleDownloadSchools} title='Download Excel'>
                    <HardDriveDownload className='h-4 w-4' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingCompanyDetails && (
                  <div className='text-center py-6 text-sm text-muted-foreground'>Loading filtered data...</div>
                )}
                {companyDetailsError && (
                  <div className='text-center py-6 text-sm text-destructive'>{companyDetailsError}</div>
                )}
                <div className='space-y-4'>
                  {(() => {
                    const anyFilter = !!(filters.stateId || filters.districtId || filters.blockId);
                    if (anyFilter) {
                      // Render from companyDetails API response
                      return companyDetails.map((item) => {
                        // Group trainers by tradeName
                        const trainersByTrade: Record<string, any[]> = {};
                        (item.trainers || []).forEach((t: any) => {
                          if (!trainersByTrade[t.tradeName || 'Unknown']) trainersByTrade[t.tradeName || 'Unknown'] = [];
                          trainersByTrade[t.tradeName || 'Unknown'].push(t);
                        });
                        const tradeEntries = Object.entries(trainersByTrade);
                        return (
                          <div key={item._id} className='p-4 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors'>
                            <div className='flex items-center justify-between mb-3'>
                              <div>
                                <h3 className='font-semibold text-lg'>{item.name}</h3>
                                <p className='text-sm text-muted-foreground'>
                                  {item.stateName} → {item.districtName} → {item.blockName}
                                </p>
                                <p className='text-xs text-muted-foreground mt-1'>{item.address}</p>
                              </div>
                              <div className='flex gap-2'>
                                <Badge variant='outline'>{tradeEntries.length} Trades</Badge>
                                <Badge variant='outline'>{(item.trainers || []).length} Trainers</Badge>
                              </div>
                            </div>
                            {tradeEntries.length > 0 && (
                              <div className='space-y-2'>
                                <h4 className='font-medium text-sm'>Trades & Trainers:</h4>
                                <div className='grid gap-2 md:grid-cols-2'>
                                  {tradeEntries.map(([trade, tlist]) => (
                                    <div key={trade} className='p-2 rounded bg-background/50'>
                                      <div className='font-medium text-sm text-primary'>{trade}</div>
                                      {tlist.length > 0 ? (
                                        <div className='text-xs text-muted-foreground'>
                                          Trainers: {tlist.map((t: any) => t.fullName).join(', ')}
                                        </div>
                                      ) : (
                                        <div className='text-xs text-muted-foreground'>No trainers assigned</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    }
                    // Fallback to original local data listing
                    return filtered.schools.map((school: any) => {
                      // API getSchools already returns trades array on each school (see user sample)
                      const apiTrades = Array.isArray(school.trades) ? school.trades : [];
                      // Fallback to legacy trades state (by schoolId) if apiTrades missing/empty
                      const legacyTrades = trades.filter((t) => t.schoolId === school.id);
                      const schoolTrades = apiTrades.length ? apiTrades : legacyTrades;

                      // Trainers sourced from trainers state (storage) – match by schoolId / school.id / school._id
                      const schoolTrainers = trainers.filter(
                        (t: any) => t.schoolId === school.id || t.schoolId === school._id
                      );

                      // Derive hierarchy names (State → District → Block) using block→district→state relations if not directly on school
                      let block: any = null;
                      let district: any = null;
                      let state: any = null;

                      // Some API responses embed blockId as object
                      if (school.blockId) {
                        if (typeof school.blockId === 'object') {
                          block = blocks.find((b) => b.id === school.blockId._id) || {
                            id: school.blockId._id,
                            name: school.blockId.name,
                          };
                        } else {
                          block = blocks.find((b) => b.id === school.blockId);
                        }
                      } else if (school.block) {
                        block = school.block;
                      }

                      if (block) {
                        district = districts.find((d) => d.id === block.districtId);
                        if (district) {
                          state = states.find((s) => s.id === district.stateId);
                        }
                      }

                      // Group trainers by trade (prefer tradeName, else match trade id)
                      const trainersByTrade: Record<string, any[]> = {};
                      schoolTrainers.forEach((t: any) => {
                        const tradeName =
                          t.tradeName ||
                          (schoolTrades.find((tr: any) => tr._id === t.tradeId || tr.id === t.tradeId)?.name) ||
                          'Unknown';
                        if (!trainersByTrade[tradeName]) trainersByTrade[tradeName] = [];
                        trainersByTrade[tradeName].push(t);
                      });
                      const tradeEntries = Object.entries(trainersByTrade);

                      return (
                        <div
                          key={school.id || school._id}
                          className='p-4 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors'
                        >
                          <div className='flex items-center justify-between mb-3'>
                            <div>
                              <h3 className='font-semibold text-lg'>{school.name}</h3>
                              <p className='text-sm text-muted-foreground'>
                                {state?.name || '—'} → {district?.name || '—'} → {block?.name || '—'}
                              </p>
                              {school.address && (
                                <p className='text-xs text-muted-foreground mt-1'>{school.address}</p>
                              )}
                            </div>
                            <div className='flex gap-2'>
                              <Badge variant='outline'>{schoolTrades.length} Trades</Badge>
                              <Badge variant='outline'>{schoolTrainers.length} Trainers</Badge>
                            </div>
                          </div>

                          {/* Trades & Trainers detail (show either grouping by trainer trade OR fallback list of trades) */}
                          {(tradeEntries.length > 0 || schoolTrades.length > 0) && (
                            <div className='space-y-2'>
                              <h4 className='font-medium text-sm'>Trades & Trainers:</h4>
                              <div className='grid gap-2 md:grid-cols-2'>
                                {/* Show grouped trainers by trade if available */}
                                {tradeEntries.length > 0
                                  ? tradeEntries.map(([tradeName, tlist]) => (
                                      <div key={tradeName} className='p-2 rounded bg-background/50'>
                                        <div className='font-medium text-sm text-primary'>{tradeName}</div>
                                        {tlist.length > 0 ? (
                                          <div className='text-xs text-muted-foreground'>
                                            Trainers: {tlist.map((t: any) => t.fullName || t.name).join(', ')}
                                          </div>
                                        ) : (
                                          <div className='text-xs text-muted-foreground'>No trainers assigned</div>
                                        )}
                                      </div>
                                    ))
                                  : // Fallback: list trades with their trainers filtered by trade id
                                    schoolTrades.map((trade: any) => {
                                      const tradeId = trade._id || trade.id;
                                      const tradeTrainers = schoolTrainers.filter(
                                        (t: any) => t.tradeId === tradeId
                                      );
                                      return (
                                        <div key={tradeId} className='p-2 rounded bg-background/50'>
                                          <div className='font-medium text-sm text-primary'>{trade.name}</div>
                                          {tradeTrainers.length > 0 ? (
                                            <div className='text-xs text-muted-foreground'>
                                              Trainers: {tradeTrainers.map((t: any) => t.fullName || t.name).join(', ')}
                                            </div>
                                          ) : (
                                            <div className='text-xs text-muted-foreground'>No trainers assigned</div>
                                          )}
                                        </div>
                                      );
                                    })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}

                  {(() => {
                    const anyFilter = !!(filters.stateId || filters.districtId || filters.blockId);
                    const currentLength = anyFilter ? companyDetails.length : filtered.schools.length;
                    if (!isLoadingCompanyDetails && currentLength === 0) {
                      return (
                        <div className='text-center py-8 text-muted-foreground'>No schools found with current filters</div>
                      );
                    }
                    return null;
                  })()}
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