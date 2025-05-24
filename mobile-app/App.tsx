import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';



// Redux Store
import { store, persistor } from './src/store/store';

// Navigation
import RootNavigator from './src/navigation/RootNavigator';

// Theme
import { COLORS } from './src/constants/theme';
import { ThemeProvider, navigationTheme } from './src/components/common/ThemeProvider';

// Components
import LoadingScreen from './src/components/common/LoadingScreen';
import ErrorBoundary from './src/components/common/ErrorBoundary';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        <Provider store={store}>
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <ThemeProvider>
              <SafeAreaProvider>
                <NavigationContainer theme={navigationTheme}>
                  <View style={styles.container}>
                    <StatusBar style="light" backgroundColor={COLORS.background} />
                    <RootNavigator />
                  </View>
                </NavigationContainer>
              </SafeAreaProvider>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
