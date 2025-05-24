import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { logoutUser } from '../../store/slices/authSlice';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? This will take you back to the beginning of the app.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all AsyncStorage data
              await AsyncStorage.clear();
              
              // Dispatch logout action to reset Redux state
              dispatch(logoutUser());
              
              console.log('✅ Signed out successfully - returning to onboarding');
            } catch (error) {
              console.error('❌ Error during sign out:', error);
              Alert.alert(
                "Error",
                "There was an error signing out. Please try again.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <Ionicons name="person-circle" size={80} color={COLORS.primary} />
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings" size={24} color={COLORS.textSecondary} />
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle" size={24} color={COLORS.textSecondary} />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="information-circle" size={24} color={COLORS.textSecondary} />
            <Text style={styles.menuText}>About</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Development-only Quick Reset Button */}
        {__DEV__ && (
          <TouchableOpacity 
            style={[styles.logoutButton, { borderColor: COLORS.primary, marginBottom: SPACING.md }]} 
            onPress={async () => {
              try {
                // Use the comprehensive reset function
                const { clearAllAppData } = require('../../debug/appReset');
                await clearAllAppData();
                console.log('🔄 Dev reset complete - app reset to onboarding');
              } catch (error) {
                console.error('❌ Reset failed:', error);
                // Fallback to basic reset
                await AsyncStorage.clear();
                dispatch(logoutUser());
              }
            }}
          >
            <Ionicons name="refresh" size={24} color={COLORS.primary} />
            <View style={styles.logoutTextContainer}>
              <Text style={[styles.logoutText, { color: COLORS.primary }]}>Dev Reset</Text>
              <Text style={[styles.logoutSubtext, { color: COLORS.textMuted }]}>Complete reset to onboarding</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color={COLORS.error} />
          <View style={styles.logoutTextContainer}>
            <Text style={styles.logoutText}>Sign Out</Text>
            <Text style={styles.logoutSubtext}>Return to app start</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING['2xl'],
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  menuSection: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutTextContainer: {
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  logoutSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default ProfileScreen; 