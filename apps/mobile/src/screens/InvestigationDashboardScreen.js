import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { CaseEngine, mockDeadAirBundle } from '@decodecase/case-engine';

// Initialize the engine instance. For now, it's created each time the screen is focused.
// Later, we might manage this globally or pass it down if needed for persistence across screen unmounts.
const engine = new CaseEngine();
// console.log("InvestigationDashboard: Engine instance created. Initial engine.state.currentSceneId:", engine.state.currentSceneId);

// Helper function to transform EngineState for React state
const transformEngineStateForReact = (state) => {
  if (!state) return null; // Guard against null state
  return {
    ...state,
    // Ensure these are always converted from Sets, even if initially empty from getInitialEngineState
    unlockedSceneIds: Array.from(state.unlockedSceneIds || []),
    solvedPuzzleIds: Array.from(state.solvedPuzzleIds || []),
    activeObjectives: Array.from(state.activeObjectives || []),
    completedObjectives: Array.from(state.completedObjectives || []),
    failedObjectives: Array.from(state.failedObjectives || []),
    // hintsUsedCount is an object, ensure it's copied or handled appropriately if deeply nested
    hintsUsedCount: state.hintsUsedCount ? { ...state.hintsUsedCount } : {},
  };
};

export default function InvestigationDashboardScreen({ route }) {
  const { caseId } = route.params; // We'll use this later to load different cases

  const [engineState, setEngineState] = useState(() => {
    const initialState = transformEngineStateForReact(engine.state);
    // console.log("InvestigationDashboard: useState initializer. currentSceneId from engine.state:", engine.state.currentSceneId, "Initial component state:", initialState);
    return initialState;
  });

  const [selectedPuzzleId, setSelectedPuzzleId] = useState(null);
  const [puzzleInputValue, setPuzzleInputValue] = useState('');

  useEffect(() => {
    // console.log("InvestigationDashboard: useEffect triggered. caseId:", caseId);
    const loadCase = async () => {
      // console.log(`InvestigationDashboard: Attempting to load ${caseId}. Current engine.currentBundle?.id:`, engine.currentBundle?.id);
      if (engine.currentBundle?.id !== mockDeadAirBundle.id) {
         // console.log("InvestigationDashboard: Loading bundle...");
         await engine.load(mockDeadAirBundle);
         // console.log("InvestigationDashboard: Bundle loaded. Engine state after load:", engine.state.currentSceneId);
         setEngineState(transformEngineStateForReact(engine.state));
      } else {
        // console.log("InvestigationDashboard: Bundle already loaded or matches current. Current engine.state.currentSceneId:", engine.state.currentSceneId);
        setEngineState(transformEngineStateForReact(engine.state)); 
      }
    };

    loadCase();

    const unsub = engine.on('STATE_CHANGED', (payload) => {
      // console.log("InvestigationDashboard: STATE_CHANGED event received. New currentSceneId:", payload.newState.currentSceneId);
      setEngineState(transformEngineStateForReact(payload.newState));
    });

    return () => {
      // console.log("InvestigationDashboard: useEffect cleanup. Unsubscribing from STATE_CHANGED");
      unsub();
      // Consider if engine needs cleanup, e.g. engine.unload() or reset if we re-create engine instance per screen visit
    };
  }, [caseId]); // Re-run effect if caseId changes (for future dynamic loading)

  // console.log("InvestigationDashboard: Component rendering. Current component engineState.currentSceneId:", engineState?.currentSceneId);

  const handleOpenNextScene = () => {
    if (engineState?.currentSceneId === 'intro') {
      // console.log("InvestigationDashboard: Dispatching OPEN_SCENE for crime_scene");
      engine.dispatch({ type: 'OPEN_SCENE', id: 'crime_scene' });
    } else {
      // console.log("InvestigationDashboard: Current scene is not 'intro', or engineState is null.");
    }
  };

  const handleSelectPuzzle = (puzzleId) => {
    setSelectedPuzzleId(puzzleId);
    setPuzzleInputValue(''); // Reset input when a new puzzle is selected
  };

  const handleSubmitAnswer = () => {
    if (selectedPuzzleId && puzzleInputValue) {
      engine.dispatch({ 
        type: 'SUBMIT_ANSWER', 
        puzzleId: selectedPuzzleId, 
        answer: puzzleInputValue 
      });
      // Optionally, clear input or selected puzzle after submission attempt
      // setPuzzleInputValue('');
      // setSelectedPuzzleId(null); 
    }
  };
  
  const handleUseHint = (puzzleId) => {
    engine.dispatch({type: 'USE_HINT', puzzleId });
    // The HINT_REVEALED event should trigger a STATE_CHANGED that updates the UI
    // We might want to display revealed hints more explicitly later.
  };

  if (!engineState || !engineState.currentCaseId) {
    // console.log("InvestigationDashboard: Rendering 'Loading Case' screen because engineState or currentCaseId is null/undefined.");
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Loading Case: {caseId}...</Text>
      </SafeAreaView>
    );
  }

  const unlockedScenesText = engineState.unlockedSceneIds?.join(', ') || 'N/A';
  const solvedPuzzlesText = engineState.solvedPuzzleIds?.join(', ') || 'N/A';

  // Get current scene content
  let currentSceneContent = 'Scene content not found.';
  if (engineState && engineState.currentSceneId && mockDeadAirBundle) {
    const sceneDef = mockDeadAirBundle.manifest.scenes.find(s => s.id === engineState.currentSceneId);
    if (sceneDef && mockDeadAirBundle.sceneFiles && mockDeadAirBundle.sceneFiles[sceneDef.file]) {
      currentSceneContent = mockDeadAirBundle.sceneFiles[sceneDef.file];
    }
  }

  // console.log("InvestigationDashboard: Rendering main content. Button should be visible if currentSceneId is 'intro'. It is:", engineState.currentSceneId);

  const selectedPuzzleDetails = selectedPuzzleId 
    ? mockDeadAirBundle.puzzles.find(p => p.id === selectedPuzzleId)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Case: {engineState.currentCaseId}</Text>
        <Text style={styles.text}>Current Scene ID: {engineState.currentSceneId || 'N/A'}</Text>
        
        <View style={styles.sceneContentContainer}>
          <Text style={styles.sceneContentTitle}>Scene Content:</Text>
          <Text style={styles.sceneContentText}>{currentSceneContent}</Text>
        </View>

        <Text style={styles.text}>Unlocked Scenes: {unlockedScenesText}</Text>
        <Text style={styles.text}>Solved Puzzles: {solvedPuzzlesText}</Text>
        
        {engineState.currentSceneId === 'intro' && (
          <Button
            title="Go to Crime Scene"
            onPress={handleOpenNextScene}
          />
        )}

        {/* Display Puzzles */}
        <View style={styles.puzzlesContainer}>
          <Text style={styles.puzzlesTitle}>Puzzles in this Case:</Text>
          {mockDeadAirBundle.puzzles && mockDeadAirBundle.puzzles.length > 0 ? (
            mockDeadAirBundle.puzzles.map(puzzle => (
              <TouchableOpacity key={puzzle.id} onPress={() => handleSelectPuzzle(puzzle.id)} style={styles.puzzleTouchable}>
                <View style={styles.puzzleItem}>
                  <Text 
                    style={[
                        styles.puzzleText, 
                        selectedPuzzleId === puzzle.id && styles.selectedPuzzleText
                    ]}
                  >
                    ID: {puzzle.id} (Type: {puzzle.type})
                  </Text>
                  {engineState.solvedPuzzleIds && engineState.solvedPuzzleIds.includes(puzzle.id) && (
                    <Text style={styles.puzzleSolvedText}> - SOLVED</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.puzzleText}>No puzzles defined for this case.</Text>
          )}
        </View>

        {/* Puzzle Interaction Area */}
        {selectedPuzzleDetails && (
          <View style={styles.interactionContainer}>
            <Text style={styles.interactionTitle}>Puzzle: {selectedPuzzleDetails.id}</Text>
            {/* TODO: Display puzzle description/image if available */}
            <TextInput
              style={styles.input}
              onChangeText={setPuzzleInputValue}
              value={puzzleInputValue}
              placeholder={`Enter answer for ${selectedPuzzleDetails.type}`}
            />
            <Button title="Submit Answer" onPress={handleSubmitAnswer} />

            {/* Hints Section */}
            {selectedPuzzleDetails.hints && selectedPuzzleDetails.hints.length > 0 && (
              <View style={styles.hintsContainer}>
                <Text style={styles.hintsTitle}>Hints:</Text>
                {selectedPuzzleDetails.hints.map((hint, index) => {
                  const isHintUsed = engineState.hintsUsedCount[selectedPuzzleDetails.id] > index;
                  return (
                    <View key={index} style={styles.hintItem}>
                      {isHintUsed ? (
                        <Text style={styles.hintText}>{hint.text}</Text>
                      ) : (
                        <Button title={`Use Hint ${index + 1} (Cost: ${hint.cost})`} onPress={() => handleUseHint(selectedPuzzleDetails.id)} />
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    padding: 20, 
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  sceneContentContainer: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
  },
  sceneContentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sceneContentText: {
    fontSize: 14,
    color: '#444',
  },
  puzzlesContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    width: '100%',
  },
  puzzlesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  puzzleTouchable: {
    paddingVertical: 5,
  },
  puzzleItem: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'center',
  },
  puzzleText: {
    fontSize: 14,
    color: '#444',
  },
  selectedPuzzleText: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  puzzleSolvedText: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  interactionContainer: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
  },
  interactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  hintsContainer: {
    marginTop: 15,
  },
  hintsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hintItem: {
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  }
}); 