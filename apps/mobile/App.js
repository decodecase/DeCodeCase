import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { CaseEngine } from '@decodecase/case-engine';
import deadAirManifest from '../../packages/case-bundles/dead-air/manifest.json';
import deadAirMetadata from '../../packages/case-bundles/dead-air/metadata.json';
import deadAirPuzzles from '../../packages/case-bundles/dead-air/puzzles.json';

export default function App() {
  const [engineState, setEngineState] = useState(null);
  const [logMessages, setLogMessages] = useState([]);

  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const appendLog = (type, ...args) => {
      setLogMessages(prev => [...prev, `[${type}] ${args.map(arg => JSON.stringify(arg, null, 2)).join(' ')}`]);
      originalLog.apply(console, [`[${type}]`, ...args]);
    };

    console.log = (...args) => appendLog('LOG', ...args);
    console.warn = (...args) => appendLog('WARN', ...args);
    console.error = (...args) => appendLog('ERROR', ...args);

    async function initializeEngine() {
      try {
        console.log("Initializing CaseEngine...");
        const engine = new CaseEngine();
        
        engine.on('STATE_CHANGED', (payload) => {
          console.log("Engine STATE_CHANGED:", payload.newState);
          setEngineState(JSON.stringify(payload.newState, (key, value) => {
            if (value instanceof Set) {
              return Array.from(value);
            }
            return value;
          }, 2));
        });

        engine.on('SCENE_OPENED', (payload) => {
          console.log("Engine SCENE_OPENED:", payload);
        });

        engine.on('PUZZLE_SOLVED', (payload) => {
          console.log("Engine PUZZLE_SOLVED:", payload);
        });
        
        console.log("Constructing Dead Air case bundle...");
        const deadAirCaseBundle = {
          id: deadAirMetadata.id,
          title: deadAirMetadata.title,
          tagline: deadAirMetadata.tagline,
          version: deadAirMetadata.version,
          duration_estimate_min: deadAirMetadata.duration_estimate_min,
          cover: deadAirMetadata.cover,
          manifest: deadAirManifest,
          puzzles: deadAirPuzzles,
          assetsBasePath: "../../packages/case-bundles/dead-air/" // Adjust if necessary
        };
        console.log("Dead Air Case Bundle:", deadAirCaseBundle);

        console.log("Loading Dead Air bundle into engine...");
        await engine.load(deadAirCaseBundle);
        console.log("Bundle loading process initiated.");

        // The initial state will be set by the STATE_CHANGED event listener
        // For direct access after load (if needed, though event is better):
        // const currentEngineState = engine.state;
        // console.log("Initial Engine State from getter:", currentEngineState);
        // setEngineState(JSON.stringify(currentEngineState, (key, value) => {
        //   if (value instanceof Set) {
        //     return Array.from(value);
        //   }
        //   return value;
        // }, 2));

      } catch (error) {
        console.error("Error during engine initialization:", error);
        setLogMessages(prev => [...prev, `[ERROR] Initialization failed: ${error.message}`]);
      }
    }

    initializeEngine();

    return () => {
      // Restore original console functions on unmount
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Case Engine Test</Text>
      <Text style={styles.statusText}>
        {engineState ? "Engine Initialized. Current State:" : "Initializing Engine..."}
      </Text>
      <ScrollView style={styles.stateDisplayScroll} contentContainerStyle={styles.stateDisplayContainer}>
        <Text style={styles.stateText}>{engineState || "Waiting for state..."}</Text>
      </ScrollView>
      <Text style={styles.logTitle}>Console Logs:</Text>
      <ScrollView style={styles.logDisplay}>
        {logMessages.map((msg, index) => (
          <Text key={index} style={styles.logText}>{msg}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the top
    paddingTop: 50, // Add padding to avoid overlap with status bar
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  stateDisplayScroll: {
    maxHeight: 200, // Limit height of state display
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  stateDisplayContainer: {
    padding: 10,
  },
  stateText: {
    fontSize: 12,
    fontFamily: 'monospace', // Use monospace for better formatting of JSON
  },
  logTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  logDisplay: {
    flex: 1, // Take remaining space
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  logText: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  }
});
