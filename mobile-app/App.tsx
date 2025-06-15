import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE', // Replace with your actual DSN
  debug: __DEV__, // If `true`, Sentry will try to print out useful debugging information.
  enableInExpoDevelopment: true,
});

// Redux Store
import { store, persistor } from './src/store/store';

// Navigation
import RootNavigator from './src/navigation/RootNavigator';

// Components
import LoadingScreen from './src/components/common/LoadingScreen';
import InviteLinkHandler from './src/components/common/InviteLinkHandler';
import NotificationInitializer from './src/components/common/NotificationInitializer';

// Debug tools (development only)
if (__DEV__) {
  require('./src/debug/inviteTest');
}

// Error Boundary Component - Now Wrapped with Sentry
const AppWithErrorBoundary = Sentry.withErrorBoundary(
  () => (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<LoadingScreen message="Loading..." />} persistor={persistor}>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor="#000" />
              <InviteLinkHandler />
              <NotificationInitializer />
              <RootNavigator />
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  ),
  {
    fallback: ({ error, resetError }) => (
       <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            An unexpected error occurred. Our team has been notified.
          </Text>
          <TouchableOpacity onPress={() => resetError()}>
            <Text style={styles.errorButton}>Try again</Text>
          </TouchableOpacity>
        </View>
    ),
  }
);

export default function App() {
  return <AppWithErrorBoundary />;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A0F1C',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7575',
    marginBottom: 15,
  },
  errorMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 25,
    textAlign: 'center',
  },
  errorButton: {
    fontSize: 18,
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
