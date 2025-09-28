import axiosInstance from "@/config/axiosInstance";

export interface AttendanceDay {
  status: "present" | "absent";
  totalHour: number;
}

/**
 * Fetch trainer calendar data
 */
export const getTrainerCalendar = async (): Promise<Record<string, AttendanceDay>> => {
  try {
    const response = await axiosInstance.get("/trainers/calendar");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch calendar");
  }
};

/**
 * Mark attendance for the trainer
 * Example payload: { latitude?: number, longitude?: number, status: "present" | "absent" }
 */
export const markTrainerAttendance = async (payload: { latitude?: number; longitude?: number; status: string }) => {
  try {
    const response = await axiosInstance.post("/trainers/mark-daily-status", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Failed to mark attendance");
  }
};

/**
 * Checkout trainer
 * Example payload: { latitude?: number, longitude?: number }
 */
export const checkoutTrainer = async (payload?: { latitude?: number; longitude?: number }) => {
  try {
    const response = await axiosInstance.post("/trainers/check-out", payload || {});
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Failed to check out");
  }
};
