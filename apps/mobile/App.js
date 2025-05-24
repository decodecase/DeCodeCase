import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';

// Engine and bundle imports (can be moved or managed differently later)
import { CaseEngine } from '@decodecase/case-engine';
import deadAirManifest from '../../packages/case-bundles/dead-air/manifest.json';
import deadAirMetadata from '../../packages/case-bundles/dead-air/metadata.json';
import deadAirPuzzles from '../../packages/case-bundles/dead-air/puzzles.json';

// Screen imports
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import CaseListScreen from './src/screens/CaseListScreen';
import CaseDetailScreen from './src/screens/CaseDetailScreen';
import InvestigationDashboardScreen from './src/screens/InvestigationDashboardScreen';
import PdfViewerScreen from './src/screens/PdfViewerScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';

const Stack = createStackNavigator();

// Global engine instance (consider managing this with Context or a service)
let engine;

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [logMessages, setLogMessages] = useState([]); // Keep for now if engine logs are useful globally

  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component
    // const originalLog = console.log; // For console override
    // const originalWarn = console.warn;
    // const originalError = console.error;

    async function setupApp() {
      try {
        // Optional: Setup console overrides here if needed globally and manage setLogMessages carefully
        // const appendLog = (type, ...args) => { ... }; 
        // console.log = (...args) => appendLog('LOG', ...args);

        await Font.loadAsync({
          'Girassol-Regular': require('./assets/fonts/Girassol-Regular.ttf'),
        });
        
        if (isMounted) {
          setFontsLoaded(true);
        }
        console.log("Custom fonts loaded.");

        console.log("Initializing CaseEngine (App.js)...");
        engine = new CaseEngine(); 
        
        engine.on('CASE_LOADED', (payload) => {
          console.log("Engine CASE_LOADED (App.js):", payload);
          console.log("Dispatching START_CASE (App.js)...");
          engine.dispatch({ type: 'START_CASE' });
        });

        engine.on('CASE_STARTED', (payload) => {
          console.log("Engine CASE_STARTED (App.js):", payload);
        });
        
        engine.on('SCENE_OPENED', (payload) => {
          console.log("Engine SCENE_OPENED (App.js):", payload);
        });

        engine.on('PUZZLE_SOLVED', (payload) => {
          console.log("Engine PUZZLE_SOLVED (App.js):", payload);
        });
        
        engine.on('PUZZLE_ATTEMPT_FAILED', (payload) => {
          console.log("Engine PUZZLE_ATTEMPT_FAILED (App.js):", payload);
        });
        
        engine.on('HINT_REVEALED', (payload) => {
          console.log("Engine HINT_REVEALED (App.js):", payload);
        });

        engine.on('FINAL_REVELATION_TRIGGERED', (payload) => {
          console.log("Engine FINAL_REVELATION_TRIGGERED (App.js):", payload);
        });

      } catch (error) {
        console.error("Error during app setup (fonts or engine) (App.js):", error);
      }
    }

    setupApp();

    return () => {
      isMounted = false;
      // Restore original console functions if overridden
      // console.log = originalLog;
      // console.warn = originalWarn;
      // console.error = originalError;
    };
  }, []); 

  if (!fontsLoaded) {
    return null; // Or a proper loading screen/SplashScreen component
  }

  // Basic authentication check (example, replace with your actual auth logic)
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Example state
  // In a real app, SplashScreen would determine this and navigate accordingly.

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="SplashScreen" // Start with SplashScreen
        screenOptions={{ headerShown: false }} // Hide headers globally for now
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="AuthScreen" component={AuthScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CaseListScreen" component={CaseListScreen} />
        <Stack.Screen name="CaseDetailScreen" component={CaseDetailScreen} />
        <Stack.Screen name="InvestigationDashboardScreen" component={InvestigationDashboardScreen} />
        <Stack.Screen name="PdfViewerScreen" component={PdfViewerScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles are no longer needed here as the debug UI is removed.
// You can remove the old styles const if it's not used by any imported screen.
// const styles = StyleSheet.create({ ... });
