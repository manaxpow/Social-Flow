import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/hook";
import { initializeAuth, restoreFromCache } from "@/stores/auth/auth.slice";
import { Skeleton } from "@/components/ui/skeleton";

const CACHE_KEY = "auth_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface AuthCache {
  user: any;
  timestamp: number;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { isInitialized, user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) {
      console.log("[AuthProvider] Already initialized, skipping...");
      return;
    }

    // Skip if already authenticated and initialized
    if (isInitialized && isAuthenticated) {
      console.log("[AuthProvider] Already authenticated and initialized, skipping...");
      setIsLoading(false);
      return;
    }

    console.log("[AuthProvider] Starting initialization...");
    
    // Check if we have cached auth data
    const cachedAuth = sessionStorage.getItem(CACHE_KEY);
    
    if (cachedAuth) {
      try {
        const { user: cachedUser, timestamp }: AuthCache = JSON.parse(cachedAuth);
        const now = Date.now();
        
        // If cache is still valid (within 5 minutes), restore from cache
        if (now - timestamp < CACHE_DURATION) {
          console.log("[AuthProvider] Restoring from cache...");
          // Restore state from cache without API call
          dispatch(restoreFromCache(cachedUser));
          setIsLoading(false);
          hasInitialized.current = true;
          return;
        }
      } catch (error) {
        console.error("[AuthProvider] Failed to parse auth cache:", error);
        // Clear invalid cache
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
    
    // No valid cache, fetch from API
    console.log("[AuthProvider] Fetching from API...");
    dispatch(initializeAuth())
      .finally(() => {
        setIsLoading(false);
        hasInitialized.current = true;
      })
      .catch((error) => {
        console.error("[AuthProvider] Initialization failed:", error);
      });
  }, [dispatch, isInitialized, isAuthenticated]);

  // Update cache when user data changes (after successful login or initialization)
  useEffect(() => {
    if (user && isInitialized) {
      const cacheData: AuthCache = {
        user,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    }
  }, [user, isInitialized]);

  if (!isInitialized || isLoading) {
    return <Skeleton />;
  }

  return <>{children}</>;
};