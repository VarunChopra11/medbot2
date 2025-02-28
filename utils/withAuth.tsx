"use client";
import React, { useEffect, useState, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function withAuth<P extends object>(Component: ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push("/login");
        } else {
          setIsLoading(false);
        }
      }
    }, [isAuthenticated, loading, router]);

    if (loading || isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}