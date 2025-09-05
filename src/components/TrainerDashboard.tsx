import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  GraduationCap, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  School,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { storage, User as UserType, Attendance, School as SchoolType, Trade, Company } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface TrainerDashboardProps {
  user: UserType;
  onLogout: () => void;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ user, onLogout }) => {
  const [trainer, setTrainer] = useState<any>(null);
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [trade, setTrade] = useState<Trade | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    loadTrainerData();
  }, [user]);

  const loadTrainerData = () => {
    if (!user.trainerData || !user.companyId) return;

    // Get trainer details
    const trainers = storage.getTrainers(user.companyId);
    const trainerData = trainers.find(t => t.username === user.username);
    setTrainer(trainerData);

    if (trainerData) {
      // Get school and trade info
      const schools = storage.getSchools(user.companyId);
      const schoolData = schools.find(s => s.id === trainerData.schoolId);
      setSchool(schoolData);

      const trades = storage.getTrades(user.companyId);
      const tradeData = trades.find(t => t.id === trainerData.tradeId);
      setTrade(tradeData);

      // Get company info
      const companyData = storage.getCompanyById(user.companyId);
      setCompany(companyData);

      // Load attendance
      const attendanceData = storage.getAttendance(user.companyId, trainerData.id);
      setAttendance(attendanceData);

      // Check today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceData.find(a => a.date === today);
      setTodayAttendance(todayRecord || null);
    }
  };

  const markAttendance = (status: 'present' | 'absent') => {
    if (!trainer || !user.companyId) return;

    const today = new Date().toISOString().split('T')[0];
    const attendanceRecord: Attendance = {
      id: `attendance-${trainer.id}-${today}`,
      trainerId: trainer.id,
      date: today,
      status,
      companyId: user.companyId,
      createdAt: new Date().toISOString()
    };

    storage.addAttendance(attendanceRecord);
    setTodayAttendance(attendanceRecord);
    loadTrainerData();

    toast({
      title: "Attendance Marked",
      description: `You have been marked ${status} for today`,
      variant: status === 'present' ? 'default' : 'destructive'
    });
  };

  const getAttendanceForDate = (date: Date): Attendance | null => {
    const dateStr = date.toISOString().split('T')[0];
    return attendance.find(a => a.date === dateStr) || null;
  };

  const getAttendanceStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyAttendance = attendance.filter(a => {
      const attendanceDate = new Date(a.date);
      return attendanceDate.getMonth() === currentMonth && attendanceDate.getFullYear() === currentYear;
    });

    const presentDays = monthlyAttendance.filter(a => a.status === 'present').length;
    const totalDays = monthlyAttendance.length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return {
      presentDays,
      totalDays,
      percentage,
      absentDays: totalDays - presentDays
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Trainer Portal</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {trainer?.name || user.trainerData?.name}
                </p>
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
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Info & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{trainer?.name || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{company?.name || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">School</p>
                  <p className="font-medium">{school?.name || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trade</p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {trade?.name || 'Loading...'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Today's Attendance */}
            <Card className="backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Today's Attendance
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayAttendance ? (
                  <div className={`flex items-center gap-3 p-4 rounded-lg ${
                    todayAttendance.status === 'present' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {todayAttendance.status === 'present' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        todayAttendance.status === 'present' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Marked {todayAttendance.status === 'present' ? 'Present' : 'Absent'}
                      </p>
                      <p className={`text-sm ${
                        todayAttendance.status === 'present' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Recorded at {new Date(todayAttendance.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm">Mark your attendance for today:</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => markAttendance('present')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Present
                      </Button>
                      <Button 
                        onClick={() => markAttendance('absent')}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Absent
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Stats */}
            <Card className="backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Attendance Rate</span>
                    <Badge variant="outline" className={`${
                      stats.percentage >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                      stats.percentage >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {stats.percentage}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Present Days</span>
                      <span className="font-medium text-green-600">{stats.presentDays}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Absent Days</span>
                      <span className="font-medium text-red-600">{stats.absentDays}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Days</span>
                      <span className="font-medium">{stats.totalDays}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stats.percentage >= 80 ? 'bg-green-600' :
                        stats.percentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-card/80 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Attendance Calendar
                </CardTitle>
                <CardDescription>
                  View your attendance history by date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                      modifiers={{
                        present: (date) => getAttendanceForDate(date)?.status === 'present',
                        absent: (date) => getAttendanceForDate(date)?.status === 'absent',
                      }}
                      modifiersStyles={{
                        present: { 
                          backgroundColor: 'rgb(34 197 94)', 
                          color: 'white',
                          fontWeight: 'bold'
                        },
                        absent: { 
                          backgroundColor: 'rgb(239 68 68)', 
                          color: 'white',
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  </div>

                  <div className="lg:w-64 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Selected Date</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>

                    {(() => {
                      const dateAttendance = getAttendanceForDate(selectedDate);
                      return dateAttendance ? (
                        <div className={`p-3 rounded-lg ${
                          dateAttendance.status === 'present' 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            {dateAttendance.status === 'present' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-medium ${
                              dateAttendance.status === 'present' ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {dateAttendance.status === 'present' ? 'Present' : 'Absent'}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 ${
                            dateAttendance.status === 'present' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            Recorded: {new Date(dateAttendance.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-sm text-muted-foreground">No attendance record</p>
                        </div>
                      );
                    })()}

                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">Legend</h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-600 rounded"></div>
                          <span>Present</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-600 rounded"></div>
                          <span>Absent</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-200 rounded border"></div>
                          <span>No record</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;