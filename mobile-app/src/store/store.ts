import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import progressSlice from './slices/progressSlice';
import communitySlice from './slices/communitySlice';
import settingsSlice from './slices/settingsSlice';
import achievementSlice from './slices/achievementSlice';
import onboardingSlice from './slices/onboardingSlice';
import planSlice from './slices/planSlice';
import notificationSlice from './slices/notificationSlice';
import notificationMiddleware from './middleware/notificationMiddleware';
import { achievementSyncMiddleware } from './middleware/achievementSyncMiddleware';

// RootState type will be derived from the store

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings', 'progress', 'onboarding', 'plan', 'notifications'], // Added notifications to persisted slices
  blacklist: ['community'], // Don't persist community data (too large and dynamic)
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  progress: progressSlice,
  community: communitySlice,
  settings: settingsSlice,
  achievements: achievementSlice,
  onboarding: onboardingSlice,
  plan: planSlice,
  notifications: notificationSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable to improve performance and prevent errors
      immutableCheck: false, // Disable to improve performance
    }).concat(notificationMiddleware, achievementSyncMiddleware),
  devTools: __DEV__,
});

// Create persistor
export const persistor = persistStore(store);

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

// Helper function to reset store (for logout)
export const resetStore = () => {
  store.dispatch({ type: 'RESET_STORE' });
};

export default store; 