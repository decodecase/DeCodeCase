import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';

// We should ideally move assets to a dedicated assets folder and import them.
// For now, let's assume a placeholder or a simple background color.

const SplashScreen = ({ navigation }) => {
  return (
    <ImageBackground 
      source={require('../assets/images/decodecase_splash.png')} // Updated background image
      style={styles.background}
      resizeMode="cover" // Ensure the image covers the background
    >
      <View style={styles.container}>
        <Text style={styles.title}>DECODECASE</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.replace('HomeScreen')} // Changed to navigate to HomeScreen
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
    // backgroundColor is a fallback if image fails, can be removed or kept
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // Optional: a subtle dark overlay to help text stand out
    width: '100%', // Ensure container takes full width for overlay
  },
  title: {
    fontFamily: 'Girassol-Regular', // Use Girassol font
    fontSize: Platform.OS === 'ios' ? 70 : 60, // Larger font size, adjust as needed
    color: '#ffffff',
    marginBottom: 60, // Increased margin
    textAlign: 'center',
    // Text shadow for better readability over an image
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  button: {
    backgroundColor: '#e74c3c', // A distinct, classic button color (oxblood-like)
    paddingVertical: 15,
    paddingHorizontal: 50, // Wider button
    borderRadius: 10, // Slightly more rounded
    // Add a subtle shadow or border for more style
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: Platform.OS === 'ios' ? 0 : 1, // Conditional border for Android if elevation is not enough
    borderColor: Platform.OS === 'ios' ? 'transparent' : '#c63a2b', // Darker shade for border
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 22, // Slightly larger text
    fontWeight: 'bold', // Keep bold or use a specific font weight if Girassol has it
    fontFamily: 'System', // Or a suitable clean sans-serif font for the button text
  },
});

export default SplashScreen; 