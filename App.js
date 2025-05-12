import React from 'react';
import { View, StyleSheet } from 'react-native'; // Added View and StyleSheet
// import { View, Text, StyleSheet } from 'react-native'; // No longer needed for the test
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
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
};

const styles = StyleSheet.create({ // Added StyleSheet
  container: {
    flex: 1,
  },
  // testContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: 'lightgreen',
  // },
  // testText: {
  //   fontSize: 24,
  //   color: 'black',
  // }
});

export default App; 