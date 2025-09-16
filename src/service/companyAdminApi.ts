import axiosInstance from "../config/axiosInstance";

interface StatePayload {
  name: string;
}

export const createState = async (payload: StatePayload) => {
  try {
    const response = await axiosInstance.post("/companyadmins/states", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create state");
  }
};
