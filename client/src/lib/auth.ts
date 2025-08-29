import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

const TOKEN_KEY = "sparknest_token";
const USER_KEY = "sparknest_user";

export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },
  
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export const authAPI = {
  signup: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await apiRequest("POST", "/api/auth/signup", userData);
    return await response.json();
  },

  verifyOTP: async (email: string, code: string, userData: any): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/verify-otp", {
      email,
      code,
      userData,
    });
    return await response.json();
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", {
      email,
      password,
    });
    return await response.json();
  },

  resendOTP: async (userData: any) => {
    const response = await apiRequest("POST", "/api/auth/resend-otp", userData);
    return await response.json();
  },

  getProfile: async (): Promise<User> => {
    const token = authStorage.getToken();
    const response = await fetch("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }
    
    return await response.json();
  },
};

export const setupAuthInterceptor = () => {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = authStorage.getToken();
    
    if (token && init && typeof input === "string" && input.startsWith("/api")) {
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    const response = await originalFetch(input, init);
    
    if (response.status === 401) {
      authStorage.clear();
      window.location.href = "/";
    }
    
    return response;
  };
};
