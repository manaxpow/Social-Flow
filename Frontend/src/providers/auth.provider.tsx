import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/hook";
import { initializeAuth } from "@/stores/auth/auth.slice";
import { Skeleton } from "@/components/ui/skeleton";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return <Skeleton />;
  }

  return <>{children}</>;
};
