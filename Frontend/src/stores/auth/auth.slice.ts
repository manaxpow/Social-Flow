import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { LoginValues } from "@/lib/zod/auth/login.schema";
import { authService } from "@/services/auth/auth.service";
import type { AuthState } from "./auth.type";
import { userService } from "@/services/user/user.service";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  isLoggingOut: false,
  error: null,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    // Cookies are sent automatically via withCredentials: true in axios
    // Just check if session is valid by calling /user/me
    const response = await userService.getMe();

    if (!response.isSuccess || !response.data) {
      return rejectWithValue("Session expired");
    }

    return response.data;
  },
);

export const loginAction = createAsyncThunk(
  "auth/login",
  async (credentials: LoginValues, { rejectWithValue }) => {
    const response = await authService.login(credentials);

    if (!response.isSuccess || !response.data) {
      return rejectWithValue(response.error || "Login failed");
    }
    
    // Token is stored in http-only cookie by the backend
    // No localStorage needed
    
    return response.data;
  },
);

export const logoutAction = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    // Set logging out flag BEFORE clearing cookie
    dispatch(setLoggingOut(true));
    
    // Backend will clear the http-only cookie
    await authService.logout();
    dispatch(clearAuth());
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoggingOut = false; // Reset flag after clearing
      state.error = null;
      // Clear auth cache from sessionStorage
      console.log("[Auth Slice] Clearing auth cache...");
      sessionStorage.removeItem("auth_cache");
    },
    setLoggingOut: (state, action) => {
      state.isLoggingOut = action.payload;
    },
    restoreFromCache: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.token = null; // No need to store token, it's in cookies
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder

      // 1. Handle Initialization (The Persistence Check)
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true; // Mark as done
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = null; // No need to store token, it's in cookies
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true; // Mark as done even if it fails
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      // Login
      .addCase(loginAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token || null;
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutAction.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
      });
  },
});

export const { clearAuth, restoreFromCache, setLoggingOut, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;