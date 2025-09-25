import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Components & Mocks (Normally in separate files) ---
// To make this a single runnable file, we'll mock the UI components and hooks.

const Card = ({ children, className = '' }) => <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl shadow-md transition-all duration-300 ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = '' }) => <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>{children}</p>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Button = ({ children, className = '', ...props }) => <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2 ${className}`} {...props}>{children}</button>;
const Badge = ({ children, className = '' }) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>;

// A simple mock for the Calendar component (react-day-picker)
const Calendar = ({ className, modifiers, modifiersStyles, selected, onSelect }) => {
    // This is a simplified representation. A real implementation is complex.
    // For demonstration, we'll just show a placeholder.
    return (
        <div className={`p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 ${className}`}>
            <p className="text-center font-bold text-gray-800 dark:text-gray-200 mb-2">
                {selected.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => <div key={`${d}-${index}`}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
                {/* Dummy calendar days */}
                {[...Array(31).keys()].map(i => {
                    const day = i + 1;
                    const isSelected = selected.getDate() === day;
                    const date = new Date(selected.getFullYear(), selected.getMonth(), day);
                    const isPresent = modifiers.present(date);
                    const isAbsent = modifiers.absent(date);

                    let style = {};
                    if (isPresent) style = modifiersStyles.present;
                    if (isAbsent) style = modifiersStyles.absent;

                    return (
                        <div
                            key={i}
                            onClick={() => onSelect(date)}
                            style={style}
                            className={`w-9 h-9 flex items-center justify-center rounded-full cursor-pointer text-sm ${
                                isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                            } ${isPresent || isAbsent ? 'text-white font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Lucide React Icon Mocks (as inline SVGs) ---
const Icon = ({ children, className }) => <div className={className}>{children}</div>;
const GraduationCap = ({ className }) => <Icon className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></Icon>;
const CalendarIcon = ({ className }) => <Icon className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg></Icon>;
const CheckCircle = ({ className }) => <Icon className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></Icon>;
const XCircle = ({ className }) => <Icon className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></Icon>;
const Clock = ({ className }) => <Icon className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></Icon>;
const User = ({ className }) => <Icon className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></Icon>;
const BookOpen = ({ className }) => <Icon className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></Icon>;
const TrendingUp = ({ className }) => <Icon className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></Icon>;
const Building = ({ className }) => <Icon className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg></Icon>;
const School = ({ className }) => <Icon className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 5v17"/><path d="M6 5v17"/><path d="M12 5v17"/></svg></Icon>;


// --- Toast Notification System ---
const Toaster = () => <div id="toaster-container" className="fixed top-5 right-5 z-[100] space-y-2"></div>;
const useToast = () => {
    const toast = ({ title, description, variant = 'default' }) => {
        const container = document.getElementById('toaster-container');
        if (!container) return;

        const toastId = `toast-${Date.now()}`;
        const toastElement = document.createElement('div');
        
        let bgColor, textColor, borderColor;
        switch (variant) {
            case 'destructive':
                bgColor = 'bg-red-500'; textColor = 'text-white'; borderColor = 'border-red-600';
                break;
            case 'success':
                 bgColor = 'bg-green-500'; textColor = 'text-white'; borderColor = 'border-green-600';
                 break;
            default:
                bgColor = 'bg-gray-800'; textColor = 'text-white'; borderColor = 'border-gray-900';
        }

        toastElement.className = `w-80 p-4 rounded-lg shadow-2xl border ${bgColor} ${textColor} ${borderColor} animate-slide-in-right`;
        toastElement.id = toastId;
        toastElement.innerHTML = `
            <p class="font-bold">${title}</p>
            <p class="text-sm">${description}</p>
        `;
        container.appendChild(toastElement);

        setTimeout(() => {
            toastElement.classList.add('animate-fade-out');
            setTimeout(() => toastElement.remove(), 500);
        }, 5000);
    };
    return { toast };
};


// --- Main TrainerDashboard Component ---
const TrainerDashboard = ({ user, onLogout }) => {
    const [trainer, setTrainer] = useState(null);
    const [school, setSchool] = useState(null);
    const [trade, setTrade] = useState(null);
    
    const [company, setCompany] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMarking, setIsMarking] = useState(false);
    
    const { toast } = useToast();

    // Fetches the trainer's data. In a real app, this would be an API call.
    const loadTrainerData = useCallback(() => {
        // Use the logged-in user's data directly
        const trainerData = { id: user.id, name: user.username, ...user };
        setTrainer(trainerData);

        // For now, school/trade/company are mocked as they don't come from the initial login user object.
        const mockName = {name: user.username };
        const mockSchool = { id: 1, name: user.schoolName || 'Springfield Technical School' };
        const mockTrade = { id: 1, name: user.tradeName };
        const mockCompany = { id: 101, name: user.companyName || 'Tech Solutions Inc.' };
       // const mockTrade={ id: 1, name: user.tradeName || 'Certified Welder' };
       
        setSchool(mockSchool);
        setTrade(mockTrade);
        setCompany(mockCompany);
        
        // TODO: In a real app, you would fetch all attendance records from your API here
        const todayStr = new Date().toISOString().split('T')[0];
        const mockAttendance = [
            { id: '1', trainerId: user.id, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: 'present', createdAt: new Date().toISOString() },
        ];
        setAttendance(mockAttendance);
        const todayRecord = mockAttendance.find(a => a.date === todayStr);
        setTodayAttendance(todayRecord || null);

    }, [user]);


    useEffect(() => {
        if (user) {
            loadTrainerData();
        }
    }, [user, loadTrainerData]);

    const markAttendance = (statusClicked) => {
        if (!user || !user.id) {
            toast({ title: "Authentication Error", description: "User ID is missing.", variant: 'destructive' });
            return;
        }
        setIsMarking(true);

        const handleApiCall = async (latitude = null, longitude = null) => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({ title: "Authentication Error", description: "You are not logged in.", variant: 'destructive' });
                setIsMarking(false);
                return;
            }

            const payload = {
                trainer_id: user.id,
                latitude,
                longitude,
                status: statusClicked
            };

            try {
                const response = await fetch('http://localhost:3000/api/trainers/mark-daily-status', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "An unknown error occurred.");
                }

                // ✅ Use the data from the API response
                if (result.data && result.message) {
                    toast({
                        title: "Attendance Update",
                        description: result.message, // Show the server message
                        variant: result.data.status === 'present' ? "success" : "destructive", // Style based on actual status
                    });
                    
                    // Update UI state with the server's response
                    const today = new Date(result.data.date).toISOString().split('T')[0];
                    const newRecord = {
                        id: result.data._id,
                        trainerId: result.data.trainerId,
                        date: today,
                        status: result.data.status, // Use status from response
                        createdAt: result.data.createdAt,
                    };
                    setTodayAttendance(newRecord);
                    setAttendance(prev => [...prev.filter(a => a.date !== today), newRecord]);
                } else {
                     throw new Error("Invalid response format from server.");
                }

            } catch (error) {
                console.error("Failed to mark attendance:", error);
                toast({
                    title: "Error",
                    description: error.message || "Could not mark attendance. Please try again.",
                    variant: 'destructive'
                });
            } finally {
                setIsMarking(false);
            }
        };

        if (statusClicked === 'present') {
            navigator.geolocation.getCurrentPosition(
                (position) => handleApiCall(position.coords.latitude, position.coords.longitude),
                () => {
                    toast({ title: "Location Access Denied", description: "Please enable location to mark yourself present.", variant: 'destructive' });
                    // Still mark as absent if location is denied but they clicked present? 
                    // Let's just stop the process. User can click "absent" if needed.
                    setIsMarking(false);
                }
            );
        } else { // 'absent'
            handleApiCall();
        }
    };
    
    const getAttendanceForDate = (date) => {
      if (!date) return null;
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
        return { presentDays, totalDays, percentage, absentDays: totalDays - presentDays };
    };

    const stats = getAttendanceStats();
    
    const StatCard = ({ icon, label, value, colorClass }) => (
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className={`p-3 rounded-full ${colorClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
      </div>
    );
    
    const ProfileDetail = ({ icon, label, value }) => (
      <div className="flex items-start gap-4">
        <div className="text-blue-500 mt-1">{icon}</div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{label}</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
      </div>
    );

    if (!trainer) {
        return <div className="min-h-screen flex items-center justify-center">Loading Trainer Data...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans">
            <Toaster />
            {/* Header */}
            <header className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trainer Portal</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome, {trainer.name || '...'}</p>
                        </div>
                    </div>
                     <Button variant="outline" onClick={onLogout}>Logout</Button>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3"><User className="w-5 h-5 text-blue-500"/>Profile Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-5">
                             <ProfileDetail icon={<User className="w-5 h-5"/>} label="Name" value={trainer.name || 'Loading...'}/>
                             <ProfileDetail icon={<Building className="w-5 h-5"/>} label="Company" value={company?.name || 'Loading...'}/>
                             <ProfileDetail icon={<School className="w-5 h-5"/>} label="School" value={school?.name || 'Loading...'}/>
                             <ProfileDetail icon={<BookOpen className="w-5 h-5"/>} label="Trade" value={<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{trade?.name || 'Loading...'}</Badge>}/>
                          </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><Clock className="w-5 h-5 text-blue-500"/>Today's Status</CardTitle>
                                <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {todayAttendance ? (
                                    <div className={`flex items-center gap-4 p-4 rounded-lg border ${todayAttendance.status === 'present' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'}`}>
                                        {todayAttendance.status === 'present' ? <CheckCircle className="w-8 h-8 text-green-500" /> : <XCircle className="w-8 h-8 text-red-500" />}
                                        <div>
                                            <p className={`font-bold text-lg ${todayAttendance.status === 'present' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                                Marked {todayAttendance.status}
                                            </p>
                                            <p className={`text-sm ${todayAttendance.status === 'present' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                at {new Date(todayAttendance.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-muted-foreground text-sm">Please mark your attendance for today:</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button onClick={() => markAttendance('present')} disabled={isMarking} className="bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 h-12 text-base font-bold">
                                                <CheckCircle className="w-5 h-5 mr-2" /> Present
                                            </Button>
                                            <Button onClick={() => markAttendance('absent')} disabled={isMarking} className="bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 h-12 text-base font-bold">
                                                <XCircle className="w-5 h-5 mr-2" /> Absent
                                            </Button>
                                        </div>
                                         {isMarking && <p className="text-sm text-center text-blue-500 animate-pulse">Processing...</p>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-8">
                       <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-blue-500"/>Monthly Overview</CardTitle>
                                <CardDescription>Your attendance summary for the current month.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-3 gap-4">
                                <StatCard icon={<CheckCircle className="w-6 h-6 text-green-500"/>} label="Present Days" value={stats.presentDays} colorClass="bg-green-100 dark:bg-green-900/50"/>
                                <StatCard icon={<XCircle className="w-6 h-6 text-red-500"/>} label="Absent Days" value={stats.absentDays} colorClass="bg-red-100 dark:bg-red-900/50"/>
                                <StatCard icon={<CalendarIcon className="w-6 h-6 text-gray-500"/>} label="Total Days" value={stats.totalDays} colorClass="bg-gray-100 dark:bg-gray-700/50"/>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3"><CalendarIcon className="w-5 h-5 text-blue-500"/>Attendance Calendar</CardTitle>
                                <CardDescription>View your attendance history.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    className="w-full"
                                    modifiers={{
                                        present: date => getAttendanceForDate(date)?.status === 'present',
                                        absent: date => getAttendanceForDate(date)?.status === 'absent',
                                    }}
                                    modifiersStyles={{
                                        present: { backgroundColor: '#22c55e', color: 'white' },
                                        absent: { backgroundColor: '#ef4444', color: 'white' }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};


// --- This is an example of how you'd manage the login state in your main App.js ---
// You should replace your current App() function with this structure.

// To use this, you would also need to import your actual LoginPage component
// import LoginPage from './LoginPage'; // Make sure the path is correct

const MockLoginPage = ({ onLogin }) => {
    // This simulates the login page you provided.
    const handleMockLogin = () => {
       const user = {
           id: id,
           username: username,
           email: email,
           role: role,
           token: token,
           companyName: companyName,
           schoolName: schoolName,
       };
       localStorage.setItem("user", JSON.stringify(user));
       localStorage.setItem("token", user.token);
       onLogin(user);
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Login Page (Simulation)</h1>
            <Button onClick={handleMockLogin}>Log in as DANISH</Button>
        </div>
    );
};

export default function App() {
  const [user, setUser] = useState(null);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!user) {
    // Replace MockLoginPage with your actual LoginPage component
    return <MockLoginPage onLogin={handleLogin} />;
  }
  
  // You would have logic here to show different dashboards based on user.role
  if (user.role === 'trainer') {
    return <TrainerDashboard user={user} onLogout={handleLogout} />;
  } else {
    return (
        <div>
            <h1>Welcome, {user.username} ({user.role})</h1>
            <Button onClick={handleLogout}>Logout</Button>
        </div>
    );
  }
}

