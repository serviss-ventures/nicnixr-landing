import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Expo Web Test</Text>
      <Text style={styles.subText}>If you can see this, Expo web is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#C084FC',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  }
}); 