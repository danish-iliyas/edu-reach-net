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

interface DistrictPayload {
  stateId: string;
  name: string;
}

export const createDistrict = async (payload: DistrictPayload) => {
  try {
    const response = await axiosInstance.post(
      "/companyadmins/districts",
      payload
    );
    return response.data; // backend attaches companyId automatically
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create district"
    );
  }
};

// Get all Blocks
export const getBlocks = async () => {
  try {
    const response = await axiosInstance.get("/companyadmins/getBlocks");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch blocks");
  }
};

// Payload for creating a block
interface BlockPayload {
  name: string;
  districtId: string;
  pincode: string;
}

// Create Block
export const createBlock = async (payload: BlockPayload) => {
  try {
    const response = await axiosInstance.post("/companyadmins/blocks", payload);
    return response.data; // backend will attach companyId automatically
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create block");
  }
};
