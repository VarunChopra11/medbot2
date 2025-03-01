"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const PIN = "542819";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem("isAuthenticated");
      
      // Important: Always reset the cookie on initial load
      // This ensures cookies are in sync with session storage
      if (authStatus === "true") {
        document.cookie = "isAuthenticated=true; path=/";
        setIsAuthenticated(true);
      } else {
        // Explicitly set cookie to false when no valid auth found
        document.cookie = "isAuthenticated=false; path=/; max-age=0";
        setIsAuthenticated(false);
        
        // Redirect to login if not already there
        if (window.location.pathname !== "/login") {
          router.push("/login");
        }
      }
      
      setLoading(false);
    }
  }, [router]);

  const login = (pin: string): boolean => {
    if (pin === PIN) {
      // Store auth state in sessionStorage (will be cleared when browser session ends)
      sessionStorage.setItem("isAuthenticated", "true");
      
      // Set cookie with path but without long expiration
      document.cookie = "isAuthenticated=true; path=/";
      
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = (): void => {
    sessionStorage.removeItem("isAuthenticated");
    
    // Clear the authentication cookie
    document.cookie = "isAuthenticated=false; path=/; max-age=0";
    
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};