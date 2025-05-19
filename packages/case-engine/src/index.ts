import {
  CaseBundle,
  EngineAction,
  EngineEventName,
  EngineState,
  Unsub,
  SceneOpenedPayload,
  PuzzleSolvedPayload,
  PuzzleAttemptFailedPayload,
  HintRevealedPayload,
  ObjectiveUpdatedPayload,
  GameCompletedPayload,
  StateChangedPayload,
  CaseManifest,
  PuzzleDefinition,
  SceneDefinition
} from './types';

// Interface to map event names to their payload types
interface EventPayloadMap {
  'SCENE_OPENED': SceneOpenedPayload;
  'PUZZLE_SOLVED': PuzzleSolvedPayload;
  'PUZZLE_ATTEMPT_FAILED': PuzzleAttemptFailedPayload;
  'HINT_REVEALED': HintRevealedPayload;
  'OBJECTIVE_UPDATED': ObjectiveUpdatedPayload;
  'GAME_COMPLETED': GameCompletedPayload;
  'STATE_CHANGED': StateChangedPayload;
}

// Using a more general type for the internal storage of handlers
type EventHandlers = {
  [K in EngineEventName]?: ((payload: EventPayloadMap[K]) => void)[];
};

export class CaseEngine {
  private currentBundle: CaseBundle | null = null;
  private currentState: EngineState;
  // Store handlers in a way that allows for mixed types internally, but overloads provide external safety
  private eventHandlers: { [key: string]: ((payload: any) => void)[] } = {};

  constructor() {
    this.currentState = this.getInitialEngineState();
    console.log("CaseEngine initialized.");
  }

  private getInitialEngineState(): EngineState {
    return {
      currentCaseId: null,
      currentSceneId: null,
      unlockedSceneIds: new Set<string>(),
      solvedPuzzleIds: new Set<string>(),
      activeObjectives: new Set<string>(),
      completedObjectives: new Set<string>(),
      failedObjectives: new Set<string>(),
      hintsUsedCount: {},
      isGameCompleted: false,
      gameOutcome: undefined,
    };
  }

  /**
   * Loads a case bundle into the engine.
   * @param bundle The case bundle to load.
   */
  public async load(bundle: CaseBundle): Promise<void> {
    console.log(`Loading case: ${bundle.title}`);
    this.currentBundle = bundle;
    this.currentState = {
        ...this.getInitialEngineState(),
        currentCaseId: bundle.id,
    };
    let initialSceneId = bundle.manifest.initialSceneId;
    if (!initialSceneId && bundle.manifest.scenes.length > 0) {
        initialSceneId = bundle.manifest.scenes[0].id;
    }
    if (initialSceneId) {
        this.openSceneInternal(initialSceneId, false);
    } else {
        console.warn("No scenes found in the manifest or no initial scene specified.");
        this.emitStateChange();
    }
    console.log("Case loaded successfully.");
  }

  /**
   * Gets the current state of the engine.
   */
  public get state(): EngineState {
    // Perform a deep copy that correctly handles Sets and other object types
    return {
      currentCaseId: this.currentState.currentCaseId,
      currentSceneId: this.currentState.currentSceneId,
      unlockedSceneIds: new Set(this.currentState.unlockedSceneIds),
      solvedPuzzleIds: new Set(this.currentState.solvedPuzzleIds),
      activeObjectives: new Set(this.currentState.activeObjectives),
      completedObjectives: new Set(this.currentState.completedObjectives),
      failedObjectives: new Set(this.currentState.failedObjectives),
      hintsUsedCount: { ...this.currentState.hintsUsedCount }, // Shallow copy for this specific object
      isGameCompleted: this.currentState.isGameCompleted,
      gameOutcome: this.currentState.gameOutcome,
    };
  }

  /**
   * Subscribes to an engine event.
   * @param eventName The name of the event to subscribe to.
   * @param handler The function to call when the event occurs.
   * @returns An unsubscribe function.
   */
  // Overloads for specific event types
  public on<K extends EngineEventName>(eventName: K, handler: (payload: EventPayloadMap[K]) => void): Unsub;
  // General implementation (will be used by the overloads)
  public on(eventName: EngineEventName, handler: (payload: any) => void): Unsub {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(handler);

    return () => {
      const handlers = this.eventHandlers[eventName];
      if (handlers) {
        this.eventHandlers[eventName] = handlers.filter(h => h !== handler);
        if (this.eventHandlers[eventName].length === 0) {
          delete this.eventHandlers[eventName];
        }
      }
    };
  }

  /**
   * Dispatches an action to the engine.
   * @param action The action to dispatch.
   */
  public dispatch(action: EngineAction): void {
    console.log("Dispatching action:", action);

    if (!this.currentBundle) {
      console.error("Cannot dispatch action: No case bundle loaded.");
      return;
    }

    switch (action.type) {
      case 'OPEN_SCENE':
        this.openSceneInternal(action.id);
        break;
      case 'SUBMIT_ANSWER':
        this.handleSubmitAnswer(action.puzzleId, action.answer);
        break;
      case 'USE_HINT':
        this.handleUseHint(action.puzzleId);
        break;
      case 'ACCUSE':
        console.warn(`Action type ${action.type} not yet implemented.`);
        break;
      default:
        console.warn(`Unknown action type: ${(action as any).type}`);
    }
  }

  // --- Internal Helper Methods ---

  private handleSubmitAnswer(puzzleId: string, submittedAnswer: string): void {
    if (!this.currentBundle?.puzzles) {
      console.error("No puzzles defined in the current bundle.");
      return;
    }
    const puzzleDef = this.currentBundle.puzzles.find(p => p.id === puzzleId);

    if (!puzzleDef) {
      console.error(`Puzzle with id '${puzzleId}' not found in bundle.`);
      return;
    }

    // Simple string comparison for now. Case sensitive.
    // TODO: Allow for more complex answer checking based on puzzleDef.type
    const correctAnswer = puzzleDef.solution ?? puzzleDef.answer;
    if (correctAnswer === undefined) {
        console.error(`Puzzle '${puzzleId}' has no solution/answer defined.`);
        return;
    }

    if (String(correctAnswer).trim() === String(submittedAnswer).trim()) {
      if (!this.currentState.solvedPuzzleIds.has(puzzleId)) {
        this.currentState.solvedPuzzleIds.add(puzzleId);
        const payload: PuzzleSolvedPayload = { puzzleId };
        this.emit('PUZZLE_SOLVED', payload);
        this.emitStateChange(); // State has changed due to puzzle solve
        console.log(`Puzzle '${puzzleId}' solved!`);
      } else {
        console.log(`Puzzle '${puzzleId}' was already solved.`);
        // Optionally, re-emit PUZZLE_SOLVED or do nothing
      }
    } else {
      const payload: PuzzleAttemptFailedPayload = { puzzleId, submittedAnswer };
      this.emit('PUZZLE_ATTEMPT_FAILED', payload);
      console.warn(`Incorrect answer for puzzle '${puzzleId}'. Submitted: '${submittedAnswer}'`);
    }
  }

  private handleUseHint(puzzleId: string): void {
    if (!this.currentBundle?.puzzles) {
      console.error("Cannot use hint: No puzzles defined.");
      return;
    }
    const puzzleDef = this.currentBundle.puzzles.find(p => p.id === puzzleId);
    if (!puzzleDef) {
      console.error(`Cannot use hint: Puzzle '${puzzleId}' not found.`);
      return;
    }
    if (this.currentState.solvedPuzzleIds.has(puzzleId)){
      console.log(`Puzzle '${puzzleId}' is already solved. No hint provided.`);
      return;
    }
    if (!puzzleDef.hints || puzzleDef.hints.length === 0) {
      console.log(`No hints available for puzzle '${puzzleId}'.`);
      return;
    }

    const usedHintCount = this.currentState.hintsUsedCount[puzzleId] || 0;
    if (usedHintCount >= puzzleDef.hints.length) {
      console.log(`All hints already used for puzzle '${puzzleId}'.`);
      return;
    }

    const hintToReveal = puzzleDef.hints[usedHintCount];
    this.currentState.hintsUsedCount[puzzleId] = usedHintCount + 1;

    const remainingHints = puzzleDef.hints.length - (usedHintCount + 1);
    this.emit('HINT_REVEALED', { 
      puzzleId, 
      hintText: hintToReveal.text, 
      hintIndex: usedHintCount, 
      remainingHints 
    });
    this.emitStateChange();
    console.log(`Hint revealed for puzzle '${puzzleId}'.`);
  }

  private emit<K extends EngineEventName>(eventName: K, payload: EventPayloadMap[K]): void {
    const handlers = this.eventHandlers[eventName];
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  private emitStateChange(): void {
    const newState = this.state; // Get a deep copy
    this.emit('STATE_CHANGED', { newState });
  }

  private openSceneInternal(sceneId: string, checkUnlock: boolean = true): void {
    if (!this.currentBundle) {
      console.error("Cannot open scene: No case bundle loaded.");
      return;
    }
    const sceneDef = this.currentBundle.manifest.scenes.find(s => s.id === sceneId);
    if (!sceneDef) {
      console.error(`Scene with id '${sceneId}' not found in manifest.`);
      return;
    }

    if (checkUnlock && sceneDef.unlock) {
      const { after, puzzle, objective, all_puzzles_solved } = sceneDef.unlock;
      let canUnlock = true;

      if (after && !this.currentState.unlockedSceneIds.has(after)) {
        // For 'after', we might need a concept of 'completed' scenes, not just 'unlocked'.
        // For now, 'unlocked' implies visited/completed for simplicity.
        console.log(`Scene '${sceneId}' locked: Scene '${after}' not yet visited/completed.`);
        canUnlock = false;
      }
      if (puzzle && !this.currentState.solvedPuzzleIds.has(puzzle)) {
        console.log(`Scene '${sceneId}' locked: Puzzle '${puzzle}' not solved.`);
        canUnlock = false;
      }
      if (objective && !this.currentState.completedObjectives.has(objective)) {
        console.log(`Scene '${sceneId}' locked: Objective '${objective}' not completed.`);
        canUnlock = false;
      }
      if (all_puzzles_solved) {
        const totalPuzzlesInBundle = this.currentBundle.puzzles?.length || 0;
        if (this.currentState.solvedPuzzleIds.size < totalPuzzlesInBundle) {
          console.log(`Scene '${sceneId}' locked: Not all puzzles in the bundle are solved yet.`);
          canUnlock = false;
        } else if (totalPuzzlesInBundle === 0) {
            console.log(`Scene '${sceneId}' unlock condition 'all_puzzles_solved' met (no puzzles in bundle).`);
        } else {
            console.log(`Scene '${sceneId}' unlock condition 'all_puzzles_solved' met.`);
        }
      }
      
      if (!canUnlock) {
        console.warn(`Unlock conditions for scene '${sceneId}' not met.`);
        return; // Do not open the scene
      }
    }

    // If unlock conditions are met or no unlock conditions, or checkUnlock is false
    this.currentState.currentSceneId = sceneId;
    this.currentState.unlockedSceneIds.add(sceneId);

    // TODO: Load actual scene content based on sceneDef.file (e.g., fetch markdown, parse JSON)
    // For now, just logging and emitting event.
    console.log(`Scene '${sceneId}' opened. File: ${sceneDef.file}`);
    this.emit('SCENE_OPENED', { sceneId });
    this.emitStateChange();
  }
} // End of CaseEngine class

// Export necessary things for the UI or other packages
// CaseEngine class is already exported with 'export class CaseEngine'
export type { // Export all relevant types
    CaseBundle,
    CaseManifest,
    PuzzleDefinition,
    SceneDefinition,
    EngineAction,
    EngineState,
    EngineEventName,
    SceneOpenedPayload,
    PuzzleSolvedPayload,
    HintRevealedPayload,
    // etc. (add other specific payloads or types if needed by UI)
    Unsub
}; 