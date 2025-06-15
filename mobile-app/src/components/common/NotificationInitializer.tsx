import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import pushNotificationService from '../../services/pushNotificationService';

const NotificationInitializer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Initialize push notifications
        const initialized = await pushNotificationService.initialize(dispatch);
        
        if (initialized && stats?.quitDate) {
          // Schedule milestone notifications based on user's quit date
          const quitDate = new Date(stats.quitDate);
          await pushNotificationService.scheduleMilestoneNotifications(quitDate);
        }
        
        console.log('Push notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    // Only initialize if user is authenticated
    if (user) {
      initializeNotifications();
    }

    // Cleanup on unmount
    return () => {
      pushNotificationService.cleanup();
    };
  }, [dispatch, user, stats?.quitDate]);

  // This component doesn't render anything
  return null;
};

export default NotificationInitializer; 