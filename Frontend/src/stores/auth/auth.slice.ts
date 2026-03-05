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
  error: null,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
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
    return response.data;
  },
);

export const logoutAction = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
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
      state.error = null;
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
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true; // Mark as done even if it fails
        state.isAuthenticated = false;
        state.user = null;
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
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutAction.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
