import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  TrendingUp,
  Building,
  School,
  Calendar as CalendarIcon,
  Grid2x2Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTrainerCalendar, checkoutTrainer } from "../service/trainerApi";

// Button Component
const Button = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Badge Component
const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
  >
    {children}
  </span>
);

// Calendar Component
// Calendar Component with TailwindCSS Tooltip
const Calendar = ({ selected, onSelect, calendarData }) => {
  const daysInMonth = new Date(
    selected.getFullYear(),
    selected.getMonth() + 1,
    0
  ).getDate();

  const getAttendanceForDate = (date) => {
    const key = date.toISOString().split("T")[0];
    return calendarData[key] || null;
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
      <p className="text-center font-bold text-gray-800 dark:text-gray-200 mb-2">
        {selected.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
          <div key={index}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-2">
        {[...Array(daysInMonth).keys()].map((i) => {
          const day = i + 1;
          const date = new Date(
            selected.getFullYear(),
            selected.getMonth(),
            day
          );
          const dayData = getAttendanceForDate(date);

          let style = {};
          if (dayData?.status === "present")
            style = { backgroundColor: "#22c55e", color: "white" };
          if (dayData?.status === "absent")
            style = { backgroundColor: "#ef4444", color: "white" };

          const tooltipText = dayData
            ? `${
                dayData.status.charAt(0).toUpperCase() + dayData.status.slice(1)
              }${
                dayData.totalHour ? ` - Total Hours: ${dayData.totalHour}h` : ""
              }`
            : "";

          return (
            <div
              key={i}
              onClick={() => onSelect(date)}
              className={`relative w-9 h-9 flex items-center justify-center rounded-full cursor-pointer text-sm group ${
                selected.getDate() === day ? "bg-blue-600 text-white" : ""
              }`}
              style={style}
            >
              {day}

              {/* Tooltip */}
              {tooltipText && (
                <span className="absolute bottom-full mb-2 w-max max-w-xs px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-nowrap pointer-events-none">
                  {tooltipText}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Toaster Notification
const Toaster = () => (
  <div
    id="toaster-container"
    className="fixed top-5 right-5 z-[100] space-y-2"
  ></div>
);

const useToast = () => {
  const toast = ({ title, description, variant = "default" }) => {
    const container = document.getElementById("toaster-container");
    if (!container) return;

    const toastId = `toast-${Date.now()}`;
    const toastElement = document.createElement("div");

    let bgColor, textColor, borderColor;
    switch (variant) {
      case "destructive":
        bgColor = "bg-red-500";
        textColor = "text-white";
        borderColor = "border-red-600";
        break;
      case "success":
        bgColor = "bg-green-500";
        textColor = "text-white";
        borderColor = "border-green-600";
        break;
      default:
        bgColor = "bg-gray-800";
        textColor = "text-white";
        borderColor = "border-gray-900";
    }

    toastElement.className = `w-80 p-4 rounded-lg shadow-2xl border ${bgColor} ${textColor} ${borderColor} animate-slide-in-right`;
    toastElement.id = toastId;
    toastElement.innerHTML = `<p class="font-bold">${title}</p><p class="text-sm">${description}</p>`;
    container.appendChild(toastElement);

    setTimeout(() => {
      toastElement.classList.add("animate-fade-out");
      setTimeout(() => toastElement.remove(), 500);
    }, 5000);
  };
  return { toast };
};

const TrainerDashboard = ({ user, onLogout }) => {
  const [trainer, setTrainer] = useState(null);
  const [school, setSchool] = useState(null);
  const [trade, setTrade] = useState(null);
  const [company, setCompany] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMarking, setIsMarking] = useState(false);
  const [calendarData, setCalendarData] = useState({});
  const { toast } = useToast();

  const didLoadRef = useRef(false);

  // Load Trainer & Calendar
  const loadTrainerData = useCallback(() => {
    if (!user) return;
    setTrainer({ id: user.id, name: user.username, ...user });
    setSchool({
      id: 1,
      name: user.schoolName || "Springfield Technical School",
    });
    setTrade({ id: 1, name: user.tradeName || "Certified Welder" });
    setCompany({ id: 101, name: user.companyName || "Tech Solutions Inc." });
  }, [user]);

  const loadCalendarData = useCallback(async () => {
    try {
      const data = await getTrainerCalendar();
      setCalendarData(data);

      const attendanceArray = Object.keys(data).map((dateStr) => ({
        date: dateStr,
        status: data[dateStr].status,
        totalHour: data[dateStr].totalHour,
      }));
      setAttendance(attendanceArray);

      const todayStr = new Date().toISOString().split("T")[0];
      const todayRecord = data[todayStr];
      setTodayAttendance(
        todayRecord
          ? {
              date: todayStr,
              status: todayRecord.status,
              totalHour: todayRecord.totalHour,
              createdAt: new Date().toISOString(),
            }
          : null
      );
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load calendar",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (user && !didLoadRef.current) {
      didLoadRef.current = true;
      loadTrainerData();
      loadCalendarData();
    }
  }, [user, loadTrainerData, loadCalendarData]);

  // MARK ATTENDANCE
  const markAttendance = (statusClicked) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID missing",
        variant: "destructive",
      });
      return;
    }
    setIsMarking(true);

    const handleApiCall = async (latitude = null, longitude = null) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Login first",
          variant: "destructive",
        });
        setIsMarking(false);
        return;
      }

      const payload = {
        trainer_id: user.id,
        latitude,
        longitude,
        status: statusClicked,
      };
      try {
        const response = await fetch(
          "http://localhost:3000/api/trainers/mark-daily-status",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unknown error");

        toast({
          title: "Attendance Updated",
          description: result.message,
          variant: result.data.status === "present" ? "success" : "destructive",
        });

        const today = new Date(result.data.date).toISOString().split("T")[0];
        const newRecord = {
          id: result.data._id,
          trainerId: result.data.trainerId,
          date: today,
          status: result.data.status,
          totalHour: result.data.totalHour || 0,
          createdAt: result.data.createdAt,
        };

        setTodayAttendance(newRecord);
        setCalendarData((prev) => ({
          ...prev,
          [today]: { status: newRecord.status, totalHour: newRecord.totalHour },
        }));
        setAttendance((prev) => [
          ...prev.filter((a) => a.date !== today),
          newRecord,
        ]);
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed",
          variant: "destructive",
        });
      } finally {
        setIsMarking(false);
      }
    };

    if (statusClicked === "present") {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleApiCall(pos.coords.latitude, pos.coords.longitude),
        () => {
          toast({
            title: "Location Denied",
            description: "Enable location to mark present",
            variant: "destructive",
          });
          setIsMarking(false);
        }
      );
    } else {
      handleApiCall();
    }
  };

  // CHECKOUT FUNCTION (moved outside)
  const handleCheckout = () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID missing",
        variant: "destructive",
      });
      return;
    }

    setIsMarking(true);

    const performCheckout = async (latitude, longitude) => {
      try {
        const payload = { latitude, longitude };
        const result = await checkoutTrainer(payload);

        toast({
          title: "Checked Out",
          description: result.message || "You have successfully checked out",
          variant: "success",
        });

        const todayStr = new Date().toISOString().split("T")[0];
        const newRecord = {
          date: todayStr,
          status: "checkout",
          totalHour: result.totalHour || 0,
          createdAt: new Date().toISOString(),
        };

        setTodayAttendance(newRecord);
        setCalendarData((prev) => ({
          ...prev,
          [todayStr]: {
            status: newRecord.status,
            totalHour: newRecord.totalHour,
          },
        }));
        setAttendance((prev) => [
          ...prev.filter((a) => a.date !== todayStr),
          newRecord,
        ]);
      } catch (err) {
        toast({
          title: "Checkout Failed",
          description: err.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setIsMarking(false);
      }
    };

    // Request geolocation
    navigator.geolocation.getCurrentPosition(
      (pos) => performCheckout(pos.coords.latitude, pos.coords.longitude),
      (error) => {
        toast({
          title: "Checkout Denied",
          description: "Location access is required to checkout.",
          variant: "destructive",
        });
        setIsMarking(false);
      }
    );
  };

  // Attendance Stats
  const getAttendanceStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyAttendance = attendance.filter((a) => {
      const d = new Date(a.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const presentDays = monthlyAttendance.filter(
      (a) => a.status === "present"
    ).length;
    const totalDays = monthlyAttendance.length;
    return {
      presentDays,
      absentDays: totalDays - presentDays,
      totalDays,
      percentage: totalDays ? Math.round((presentDays / totalDays) * 100) : 0,
    };
  };

  const stats = getAttendanceStats();

  const StatCard = ({ icon, label, value, colorClass }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className={`p-3 rounded-full ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );

  const ProfileDetail = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
      <div className="text-blue-500 mt-1">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          {value}
        </p>
      </div>
    </div>
  );

  if (!trainer)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Trainer Portal
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome, {trainer.name?.split(" ")[0] || "..."}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-500" /> Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 capitalize">
                <ProfileDetail
                  icon={<User className="w-5 h-5" />}
                  label="Name"
                  value={trainer.name || "Loading..."}
                />
                <ProfileDetail
                  icon={<Building className="w-5 h-5" />}
                  label="Company"
                  value={company?.name || "Loading..."}
                />
                <ProfileDetail
                  icon={<School className="w-5 h-5" />}
                  label="School"
                  value={school?.name || "Loading..."}
                />
                <ProfileDetail
                  icon={<BookOpen className="w-5 h-5" />}
                  label="Trade"
                  value={
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {trade?.name || "Loading..."}
                    </Badge>
                  }
                />
              </CardContent>
            </Card>

            {/* Today's Attendance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" /> Today's Status
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayAttendance ? (
                  <div
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      todayAttendance.status === "present"
                        ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                    }`}
                  >
                    {todayAttendance.status === "present" ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                    <div>
                      <p
                        className={`font-bold text-lg ${
                          todayAttendance.status === "present"
                            ? "text-green-800 dark:text-green-300"
                            : "text-red-800 dark:text-red-300"
                        }`}
                      >
                        Marked {todayAttendance.status}
                      </p>
                      <p
                        className={`text-sm ${
                          todayAttendance.status === "present"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        at{" "}
                        {new Date(
                          todayAttendance.createdAt
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm">
                      Please mark your attendance for today:
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => markAttendance("present")}
                          disabled={isMarking}
                          className="bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 h-12 text-base font-bold"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" /> Present
                        </Button>
                        <Button
                          onClick={() => markAttendance("absent")}
                          disabled={isMarking}
                          className="bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 h-12 text-base font-bold"
                        >
                          <XCircle className="w-5 h-5 mr-2" /> Absent
                        </Button>
                      </div>
                      <Button
                        onClick={handleCheckout}
                        disabled={isMarking}
                        className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 h-12 text-base font-bold"
                      >
                        <Grid2x2Check className="w-5 h-5 mr-2" /> Check Out
                      </Button>
                    </div>
                    {isMarking && (
                      <p className="text-sm text-center text-blue-500 animate-pulse">
                        Processing...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Monthly Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-500" /> Monthly
                  Overview
                </CardTitle>
                <CardDescription>
                  Your attendance summary for the current month.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <StatCard
                  icon={<CheckCircle className="w-6 h-6 text-green-500" />}
                  label="Present Days"
                  value={stats.presentDays}
                  colorClass="bg-green-100 dark:bg-green-900/50"
                />
                <StatCard
                  icon={<XCircle className="w-6 h-6 text-red-500" />}
                  label="Absent Days"
                  value={stats.absentDays}
                  colorClass="bg-red-100 dark:bg-red-900/50"
                />
                <StatCard
                  icon={<CalendarIcon className="w-6 h-6 text-gray-500" />}
                  label="Total Days"
                  value={stats.totalDays}
                  colorClass="bg-gray-100 dark:bg-gray-700/50"
                />
              </CardContent>
            </Card>

            {/* Attendance Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-blue-500" /> Attendance
                  Calendar
                </CardTitle>
                <CardDescription>View your attendance history.</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  calendarData={calendarData}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrainerDashboard;
