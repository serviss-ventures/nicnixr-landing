import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import progressSlice from './slices/progressSlice';
import communitySlice from './slices/communitySlice';
import shieldSlice from './slices/shieldSlice';
import settingsSlice from './slices/settingsSlice';
import achievementSlice from './slices/achievementSlice';

import { RootState } from '../types';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings', 'progress'], // Only persist these slices
  blacklist: ['community'], // Don't persist community data (too large)
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  progress: progressSlice,
  community: communitySlice,
  shield: shieldSlice,
  settings: settingsSlice,
  achievements: achievementSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
    }),
  devTools: __DEV__,
});

// Create persistor
export const persistor = persistStore(store);

// Types for TypeScript
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

// Helper function to reset store (for logout)
export const resetStore = () => {
  store.dispatch({ type: 'RESET_STORE' });
};

export default store; 