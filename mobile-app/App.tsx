import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: __DEV__, // Enable debug mode in development
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 1.0 : 0.1,
  integrations: [
    Sentry.reactNativeTracingIntegration(),
  ],
  beforeSend: (event) => {
    // Log errors in development
    if (__DEV__ && event.exception) {
      console.error('Sentry captured exception:', event.exception);
    }
    return event;
  },
});

// Redux Store
import { store, persistor } from './src/store/store';

// Navigation
import RootNavigator from './src/navigation/RootNavigator';

// Components
import LoadingScreen from './src/components/common/LoadingScreen';
import InviteLinkHandler from './src/components/common/InviteLinkHandler';

// Debug tools (development only)
if (__DEV__) {
  require('./src/debug/inviteTest');
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Error caught by boundary:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error details:', error);
    console.error('Error info:', errorInfo);
    console.error('Stack trace:', error.stack);
    
    // Report to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <Text style={styles.errorStack}>
            {this.state.error?.stack?.slice(0, 500)}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Provider store={store}>
            <PersistGate loading={<LoadingScreen message="Loading..." />} persistor={persistor}>
              <NavigationContainer>
                <StatusBar style="light" backgroundColor="#000" />
                <InviteLinkHandler />
                <RootNavigator />
              </NavigationContainer>
            </PersistGate>
          </Provider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff0000',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorStack: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'monospace',
  },
});

// Wrap the App component with Sentry for enhanced error tracking
export default Sentry.wrap(App);
