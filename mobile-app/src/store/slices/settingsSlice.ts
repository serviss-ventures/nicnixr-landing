import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState } from '../../types';
import { DEFAULT_SETTINGS } from '../../constants/app';

const initialState: SettingsState = {
  ...DEFAULT_SETTINGS,
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updatePrivacySettings: (state, action) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },
    updateAccessibilitySettings: (state, action) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    updateAppSettings: (state, action) => {
      state.app = { ...state.app, ...action.payload };
    },
  },
});

export const { 
  clearError, 
  updateNotificationSettings, 
  updatePrivacySettings, 
  updateAccessibilitySettings, 
  updateAppSettings 
} = settingsSlice.actions;

export default settingsSlice.reducer; 