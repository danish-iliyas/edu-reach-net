import axiosInstance from "../config/axiosInstance";

// Define the possible user roles for type safety and to map to endpoints.
export type LoginRole = 'SuperAdmin' | 'CompanyAdmin' | 'trainer';

// The data payload for the login request.
interface LoginPayload {
  email: string;
  password: string;
}

// The expected response structure from any of the login APIs.
interface LoginResponse {
  message: string;
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
    companyId?: string; // Optional as not all roles may have it
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

// A map to hold the API endpoints for each role. This is easily extendable.
const loginEndpoints: Record<LoginRole, string> = {
  superadmin: "/superadmins/login",
  companyadmin: "/companyadmins/login",
  trainer: "/management/trainers/login",
};

/**
 * Logs in a user by hitting the correct endpoint based on the provided role.
 * @param payload - The login credentials (email and password).
 * @param role - The role of the user trying to log in.
 * @returns A promise that resolves with the login response data.
 * @throws An error if the API call fails or the role is invalid.
 */
export const loginUser = async (payload: LoginPayload, role: LoginRole): Promise<LoginResponse> => {
  try {
    const endpoint = loginEndpoints[role];
    if (!endpoint) {
      // This is a safeguard in case an invalid role is passed.
      throw new Error("Invalid user role specified.");
    }

    const response = await axiosInstance.post<LoginResponse>(endpoint, payload);

    return response.data;
  } catch (error: any) {
    // Check if the API provided a specific error message, otherwise throw a generic one.
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.message) {
      throw new Error(error.message);
    }
    throw new Error("Something went wrong during login. Please try again.");
  }
};
