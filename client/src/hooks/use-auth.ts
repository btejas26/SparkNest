import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { authStorage, authAPI, setupAuthInterceptor, type User } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  verifyOTP: (email: string, code: string, userData: any) => Promise<void>;
  logout: () => void;
  resendOTP: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setupAuthInterceptor();
    
    const token = authStorage.getToken();
    const savedUser = authStorage.getUser();
    
    if (token && savedUser) {
      setUser(savedUser);
      // Verify token is still valid
      authAPI.getProfile()
        .then((profile) => {
          setUser(profile);
          authStorage.setUser(profile);
        })
        .catch(() => {
          authStorage.clear();
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    authStorage.setToken(response.token);
    authStorage.setUser(response.user);
    setUser(response.user);
  };

  const signup = async (userData: any) => {
    await authAPI.signup(userData);
  };

  const verifyOTP = async (email: string, code: string, userData: any) => {
    const response = await authAPI.verifyOTP(email, code, userData);
    authStorage.setToken(response.token);
    authStorage.setUser(response.user);
    setUser(response.user);
  };

  const resendOTP = async (userData: any) => {
    await authAPI.resendOTP(userData);
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    verifyOTP,
    resendOTP,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}