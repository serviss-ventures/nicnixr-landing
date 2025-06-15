import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import badgeManager from '../../utils/badgeManager';

export interface Notification {
  id: string;
  type: 'buddy-request' | 'buddy-message' | 'milestone' | 'system' | 'mention';
  title: string;
  message: string;
  timestamp: Date | string; // Allow both for storage/retrieval compatibility
  read: boolean;
  data?: any;
  actionType?: 'accept-decline' | 'view' | 'message';
  icon?: string;
  iconColor?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      // Ensure timestamps are Date objects
      state.notifications = action.payload.map(n => ({
        ...n,
        timestamp:         n.timestamp instanceof Date ? n.timestamp : new Date(n.timestamp)
      }));
      state.unreadCount = action.payload.filter(n => !n.read).length;
      // Sync badge count
      badgeManager.syncWithUnreadCount(state.unreadCount);
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
        // Sync badge count
        badgeManager.syncWithUnreadCount(state.unreadCount);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount -= 1;
        badgeManager.syncWithUnreadCount(state.unreadCount);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        badgeManager.syncWithUnreadCount(state.unreadCount);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.read = true; });
      state.unreadCount = 0;
      badgeManager.clearBadge();
    },
    acceptBuddyRequest: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
        notification.data = { ...notification.data, accepted: true };
        state.unreadCount = state.notifications.filter(n => !n.read).length;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      badgeManager.clearBadge();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  acceptBuddyRequest,
  clearNotifications,
  setLoading,
  setError,
} = notificationSlice.actions;

// Thunks for async operations
export const loadNotifications = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const stored = await AsyncStorage.getItem('@notifications');
    if (stored) {
      const notifications = JSON.parse(stored);
      // Convert date strings back to Date objects
      notifications.forEach((n: any) => {
        n.timestamp = new Date(n.timestamp);
      });
      dispatch(setNotifications(notifications));
    }
  } catch (error) {
    dispatch(setError('Failed to load notifications'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const saveNotifications = () => async (dispatch: any, getState: any) => {
  try {
    const state = getState();
    const notifications = state.notifications.notifications;
    await AsyncStorage.setItem('@notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
};

export const createNotification = (
  type: Notification['type'],
  title: string,
  message: string,
  data?: any,
  actionType?: Notification['actionType'],
  icon?: string,
  iconColor?: string
) => async (dispatch: any) => {
  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date(),
    read: false,
    data,
    actionType,
    icon,
    iconColor,
  };
  
  dispatch(addNotification(notification));
  
  // Save to AsyncStorage after adding
  dispatch(saveNotifications());
  
  return notification;
};

export default notificationSlice.reducer; 