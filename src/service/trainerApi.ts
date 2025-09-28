import axiosInstance from "@/config/axiosInstance";

export interface AttendanceDay {
  status: "present" | "absent";
  totalHour: number;
}

export const getTrainerCalendar = async (): Promise<Record<string, AttendanceDay>> => {
  try {
    const response = await axiosInstance.get("/trainers/calendar");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch calendar");
  }
};

export const markTrainerAttendance = async (payload: { latitude?: number; longitude?: number; status: string }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("You are not logged in");

    const response = await axiosInstance.post("/trainers/mark-daily-status", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Failed to mark attendance");
  }
};
