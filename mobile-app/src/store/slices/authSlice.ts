import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginForm, RegisterForm, OnboardingData } from '../../types';
import { STORAGE_KEYS } from '../../constants/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (loginData: LoginForm, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      
      // Store user data locally
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (registerData: RegisterForm, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      const data = await response.json();
      
      // Store user data locally
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const completeOnboarding = createAsyncThunk(
  'auth/completeOnboarding',
  async (onboardingData: any, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      
      // Create a default user if none exists
      let userId = state.auth.user?.id || `user_${Date.now()}`;
      let userName = state.auth.user?.username || 'NixR Warrior';
      let userEmail = state.auth.user?.email || `${userId}@nixr.app`;
      
      // Create user object with onboarding data
      const user: User = {
        id: userId,
        email: userEmail,
        username: userName,
        firstName: onboardingData.firstName || 'NixR',
        lastName: onboardingData.lastName || 'Warrior',
        dateJoined: new Date().toISOString(),
        quitDate: onboardingData.quitDate,
        nicotineProduct: onboardingData.nicotineProduct,
        dailyCost: onboardingData.dailyCost || 15,
        packagesPerDay: onboardingData.packagesPerDay || 10,
        motivationalGoals: onboardingData.motivationalGoals || ['health'],
        isAnonymous: false,
      };
      
      // Store user data locally
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.QUIT_DATE, onboardingData.quitDate);
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      
      // TODO: In a real app, also send to backend API
      /*
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      */
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Onboarding failed');
    }
  }
);

export const loadStoredUser = createAsyncThunk(
  'auth/loadStoredUser',
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (!storedUser) {
        throw new Error('No stored user found');
      }
      
      const user = JSON.parse(storedUser);
      
      // Validate that user data is still valid
      if (!user.id || !user.email) {
        throw new Error('Invalid stored user data');
      }
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load stored user');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (updateData: Partial<User>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      
      if (!state.auth.user) {
        throw new Error('No user found');
      }
      
      // TODO: Replace with actual API call
      const response = await fetch(`/api/user/${state.auth.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Profile update failed');
      }
      
      const data = await response.json();
      
      // Update user data locally
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Clear all stored data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.PROGRESS_DATA,
        STORAGE_KEYS.SETTINGS,
      ]);
      
      // TODO: Call logout API endpoint if needed
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Complete onboarding
    builder
      .addCase(completeOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true; // This is the key fix!
        state.error = null;
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load stored user
    builder
      .addCase(loadStoredUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadStoredUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout user
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, setUser, clearUser, updateUserData } = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors - Using any to avoid circular dependencies
export const selectAuth = (state: any) => state.auth;
export const selectUser = (state: any) => state.auth.user;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: any) => state.auth.isLoading;
export const selectAuthError = (state: any) => state.auth.error; 