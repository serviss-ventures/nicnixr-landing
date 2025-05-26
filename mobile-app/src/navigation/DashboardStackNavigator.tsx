import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
import { DashboardStackParamList } from '../types';

// Theme
import { COLORS } from '../constants/theme';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import FreedomDateScreen from '../screens/dashboard/FreedomDateScreen';

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,

      }}
    >
      <Stack.Screen 
        name="DashboardMain" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen 
        name="FreedomDate" 
        component={FreedomDateScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Your Freedom Date',
          headerStyle: {
            backgroundColor: COLORS.background,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.cardBorder,
          },
          headerTitleStyle: {
            color: COLORS.text,
            fontSize: 18,
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                marginLeft: 16,
                padding: 8,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                // TODO: Implement share functionality
                console.log('Share freedom date');
              }}
              style={{
                marginRight: 16,
                padding: 8,
                borderRadius: 20,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
              }}
            >
              <Ionicons name="share-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default DashboardStackNavigator; 