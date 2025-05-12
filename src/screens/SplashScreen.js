import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

// We should ideally move assets to a dedicated assets folder and import them.
// For now, let's assume a placeholder or a simple background color.

const SplashScreen = ({ navigation }) => {
  return (
    <ImageBackground 
      // source={require('../assets/splash_background.png')} // Placeholder for actual background
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>DECODECASE</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.replace('HomeTabs')} // Changed to navigate to HomeTabs
        >
          <Text style={styles.buttonText}>START</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50', // Fallback color if image is not available
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 50,
    // Add a more thematic font later
  },
  button: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SplashScreen; 