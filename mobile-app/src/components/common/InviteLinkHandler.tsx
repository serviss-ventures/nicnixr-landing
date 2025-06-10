import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import inviteService from '../../services/inviteService';

const InviteLinkHandler: React.FC = () => {
  useEffect(() => {
    // Handle initial URL when app opens
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleInviteUrl(url);
      }
    });

    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleInviteUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleInviteUrl = async (url: string) => {
    // Check if it's an invite URL
    const inviteMatch = url.match(/invite\/([A-Z0-9-]+)/);
    if (inviteMatch) {
      const inviteCode = inviteMatch[1];
              // Processing invite code
      
      // Store the invite code for processing after signup
      await inviteService.storePendingInvite(inviteCode);
    }
  };

  return null;
};

export default InviteLinkHandler; 