import axiosInstance from "../config/axiosInstance";

interface StatePayload {
  name: string;
}

export const createState = async (payload: StatePayload) => {
  try {
    const response = await axiosInstance.post("/companyadmins/states", payload);
    return response.data; // backend will attach companyId automatically
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create state");
  }
};

// Get all states for the logged-in CompanyAdmin
export const getStates = async () => {
  try {
    const response = await axiosInstance.get("/companyadmins/getStates");
    return response.data; // should be an array of states
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch states");
  }
};
