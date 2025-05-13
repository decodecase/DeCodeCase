import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { View, StyleSheet } from 'react-native'; // Import View and StyleSheet

export default function App() {
  return (
    <View style={styles.container}> // Added wrapper View
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
    </View>
    // <View style={styles.testContainer}>
    //   <Text style={styles.testText}>Hello World! Can you see me?</Text>
    // </View>
  );
}

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Add any other container styles if needed, e.g., backgroundColor
    // backgroundColor: '#1c1c1e', // Example background
  },
});

// Previous version that caused the error:
/*
export default function App() {
  return (
    // Added wrapper View to ensure NavigationContainer has flex: 1 parentage
    <View style={{ flex: 1 }}> 
      // Added wrapper View  <-- THIS IS THE ERROR 
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
}
*/
