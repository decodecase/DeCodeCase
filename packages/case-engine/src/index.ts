import {
  CaseBundle,
  EngineAction,
  // EngineEventName, // Replaced by CaseEventType
  // EngineState, // Replaced by CaseState
  Unsub,
  // SceneOpenedPayload, // Now part of EventPayloadMap
  // PuzzleSolvedPayload, // Now part of EventPayloadMap
  // PuzzleAttemptFailedPayload, // Now part of EventPayloadMap
  // HintRevealedPayload, // Now part of EventPayloadMap
  // ObjectiveUpdatedPayload, // Replaced by ObjectiveCompletedPayload in EventPayloadMap
  // GameCompletedPayload, // Replaced by FinalRevelationTriggeredPayload in EventPayloadMap
  // StateChangedPayload, // We'll handle state changes by emitting specific events
  CaseManifest,
  PuzzleDefinition,
  SceneDefinition,
  CaseState, // Added
  CaseEventType, // Added
  EventPayloadMap, // Added
  SubmitFinalAccusationPayload, // Added
  LoadBundlePayload, // Added
  OpenScenePayload, // Added
  SubmitAnswerPayload, // Added
  UseHintPayload, // Added
  CaseStatus // Added
} from './types';

// No longer need a local EventPayloadMap, using the one from types.ts
// interface EventPayloadMap {
//   'SCENE_OPENED': SceneOpenedPayload;
//   'PUZZLE_SOLVED': PuzzleSolvedPayload;
//   'PUZZLE_ATTEMPT_FAILED': PuzzleAttemptFailedPayload;
//   'HINT_REVEALED': HintRevealedPayload;
//   'OBJECTIVE_UPDATED': ObjectiveUpdatedPayload;
//   'GAME_COMPLETED': GameCompletedPayload;
//   'STATE_CHANGED': StateChangedPayload;
// }

// Using a more general type for the internal storage of handlers
type InternalEventHandlers = {
  [K in CaseEventType]?: ((payload: EventPayloadMap[K]) => void)[];
};

export class CaseEngine {
  // private currentBundle: CaseBundle | null = null; // Now part of CaseState
  private state: CaseState;
  private eventHandlers: InternalEventHandlers = {}; // Use the new type

  constructor(initialState?: Partial<CaseState>) {
    this.state = this.getInitialEngineState(initialState);
    console.log("CaseEngine initialized.");
  }

  private getInitialEngineState(initialValues: Partial<CaseState> = {}): CaseState {
    return {
      currentBundle: null,
      currentSceneId: null,
      unlockedSceneIds: new Set<string>(),
      solvedPuzzleIds: new Set<string>(),
      completedObjectiveIds: new Set<string>(),
      hintsUsed: {},
      inventory: new Set<string>(),
      caseStatus: 'UNINITIALIZED',
      errorMessage: undefined,
      actionHistory: [],
      eventHistory: [],
      ...initialValues,
    };
  }

  public async loadBundle(payload: LoadBundlePayload): Promise<void> {
    const { bundle } = payload;
    console.log(`Loading case: ${bundle.manifest.metadata?.title || 'Untitled Case'}`);
    this.state = this.getInitialEngineState({
        currentBundle: bundle,
        caseStatus: 'LOADED'
    });

    // Emit CASE_LOADED event
    this.emit('CASE_LOADED', { manifest: bundle.manifest, initialSceneId: bundle.manifest.initialSceneId });
    
    // Optionally, auto-start the case or open initial scene
    // For now, let's assume START_CASE action will be dispatched next by the UI
    // this.startCase(); // Or this.openSceneInternal(bundle.manifest.initialSceneId, false);

    console.log("Case bundle loaded successfully. Ready to start.");
  }

  public startCase(): void {
    if (!this.state.currentBundle) {
      console.error("Cannot start case: No bundle loaded.");
      this.state.caseStatus = 'ERROR';
      this.state.errorMessage = "Cannot start case: No bundle loaded.";
      // Consider emitting an error event
      return;
    }
    if (this.state.caseStatus !== 'LOADED') {
        console.warn(`Case cannot be started from status: ${this.state.caseStatus}. It must be LOADED.`);
        // Optionally emit a warning or error event
        return;
    }

    this.state.caseStatus = 'RUNNING';
    const initialSceneId = this.state.currentBundle.manifest.initialSceneId;
    this.emit('CASE_STARTED', { initialSceneId });
    
    if (initialSceneId) {
      this.openSceneInternal(initialSceneId, false); // Open initial scene without checking unlock
    } else {
      console.warn("No initial scene ID specified in the manifest.");
      // Potentially set game to a specific state or emit an event
    }
  }

  public getState(): CaseState {
    // Perform a deep copy for safety, especially for Sets and objects
    return JSON.parse(JSON.stringify(this.state, (key, value) => {
      if (value instanceof Set) {
        return Array.from(value);
      }
      return value;
    }));
  }

  public on<K extends CaseEventType>(eventName: K, handler: (payload: EventPayloadMap[K]) => void): Unsub {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    // The type assertion is okay here because K is constrained by CaseEventType
    (this.eventHandlers[eventName] as ((payload: EventPayloadMap[K]) => void)[]).push(handler);

    return () => {
      const handlers = this.eventHandlers[eventName];
      if (handlers) {
        // The type assertion is okay here
        this.eventHandlers[eventName] = handlers.filter(h => h !== handler) as any;
        if (this.eventHandlers[eventName]?.length === 0) {
          delete this.eventHandlers[eventName];
        }
      }
    };
  }

  public dispatch(action: EngineAction): void {
    console.log("Dispatching action:", action.type, action.payload);
    this.state.actionHistory.push(action);

    if (action.type !== 'LOAD_BUNDLE' && (!this.state.currentBundle || this.state.caseStatus === 'UNINITIALIZED')) {
      console.error("Cannot dispatch action: No case bundle loaded or engine not initialized properly.");
      this.state.errorMessage = "Action dispatched before bundle loaded.";
      // Optionally emit an error event
      return;
    }
    
    // For actions other than LOAD_BUNDLE and START_CASE, ensure the case is RUNNING
    if (action.type !== 'LOAD_BUNDLE' && action.type !== 'START_CASE' && this.state.caseStatus !== 'RUNNING') {
        if(this.state.caseStatus === 'COMPLETED') {
            console.warn(`Cannot dispatch action '${action.type}': Case is already COMPLETED.`);
            return;
        }
        console.error(`Cannot dispatch action '${action.type}': Case is not RUNNING. Current status: ${this.state.caseStatus}`);
        this.state.errorMessage = `Action ${action.type} dispatched while case not running.`;
        // Optionally emit an error event
        return;
    }

    switch (action.type) {
      case 'LOAD_BUNDLE':
        this.loadBundle(action.payload);
        break;
      case 'START_CASE':
        this.startCase();
        break;
      case 'OPEN_SCENE':
        this.openSceneInternal(action.payload.sceneId);
        break;
      case 'SUBMIT_ANSWER':
        this.handleSubmitAnswer(action.payload);
        break;
      case 'USE_HINT':
        this.handleUseHint(action.payload);
        break;
      case 'SUBMIT_FINAL_ACCUSATION': // Added
        this.handleSubmitFinalAccusation(action.payload);
        break;
      default:
        // This should ideally not happen if types are correct
        console.warn(`Unknown action type: ${(action as any).type}`);
    }
  }

  private handleSubmitAnswer(payload: SubmitAnswerPayload): void {
    const { puzzleId, answer } = payload;
    if (!this.state.currentBundle?.manifest.puzzles) {
      console.error("No puzzles defined in the current bundle.");
      return;
    }
    const puzzleDef = this.state.currentBundle.manifest.puzzles.find(p => p.id === puzzleId);

    if (!puzzleDef) {
      console.error(`Puzzle with id '${puzzleId}' not found in bundle.`);
      return;
    }

    const correctAnswer = puzzleDef.solution;
    if (correctAnswer === undefined) {
        console.error(`Puzzle '${puzzleId}' has no solution defined.`);
        return;
    }

    const isCorrect = Array.isArray(correctAnswer)
      ? correctAnswer.map(s => String(s).trim()).includes(String(answer).trim())
      : String(correctAnswer).trim() === String(answer).trim();

    if (isCorrect) {
      if (!this.state.solvedPuzzleIds.has(puzzleId)) {
        this.state.solvedPuzzleIds.add(puzzleId);
        this.emit('PUZZLE_SOLVED', { puzzleId });
        console.log(`Puzzle '${puzzleId}' solved!`);
        // Check for all puzzles solved
        this.checkAllPuzzlesSolved();
      } else {
        console.log(`Puzzle '${puzzleId}' was already solved.`);
      }
    } else {
      this.emit('PUZZLE_ATTEMPT_FAILED', { puzzleId, attemptedAnswer: answer });
      console.warn(`Incorrect answer for puzzle '${puzzleId}'. Submitted: '${answer}'`);
    }
  }

  private handleUseHint(payload: UseHintPayload): void {
    const { puzzleId, hintIndex } = payload;
    if (!this.state.currentBundle?.manifest.puzzles) {
      console.error("Cannot use hint: No puzzles defined.");
      return;
    }
    const puzzleDef = this.state.currentBundle.manifest.puzzles.find(p => p.id === puzzleId);
    if (!puzzleDef) {
      console.error(`Cannot use hint: Puzzle '${puzzleId}' not found.`);
      return;
    }
    if (this.state.solvedPuzzleIds.has(puzzleId)){
      console.log(`Puzzle '${puzzleId}' is already solved. No hint provided.`);
      // Optionally emit an event indicating this
      return;
    }
    if (!puzzleDef.hints || puzzleDef.hints.length === 0) {
      console.log(`No hints available for puzzle '${puzzleId}'.`);
      // Optionally emit an event
      return;
    }

    // Initialize hintsUsed set for the puzzle if it doesn't exist
    if (!this.state.hintsUsed[puzzleId]) {
      this.state.hintsUsed[puzzleId] = new Set<number>();
    }

    if (hintIndex < 0 || hintIndex >= puzzleDef.hints.length) {
        console.error(`Invalid hint index ${hintIndex} for puzzle '${puzzleId}'.`);
        return;
    }

    if (this.state.hintsUsed[puzzleId].has(hintIndex)) {
        console.log(`Hint ${hintIndex} for puzzle '${puzzleId}' already revealed.`);
        // Optionally re-emit HINT_REVEALED with the known hint
        const hint = puzzleDef.hints[hintIndex];
        this.emit('HINT_REVEALED', {
            puzzleId,
            hint,
            hintIndex,
            hintsUsedCount: this.state.hintsUsed[puzzleId].size
        });
        return;
    }

    const hintToReveal = puzzleDef.hints[hintIndex];
    this.state.hintsUsed[puzzleId].add(hintIndex);

    this.emit('HINT_REVEALED', {
      puzzleId,
      hint: hintToReveal,
      hintIndex: hintIndex,
      hintsUsedCount: this.state.hintsUsed[puzzleId].size
    });
    console.log(`Hint ${hintIndex} revealed for puzzle '${puzzleId}'.`);
  }
  
  // New method for final accusation
  private handleSubmitFinalAccusation(payload: SubmitFinalAccusationPayload): void {
    const { characterId } = payload;
    if (this.state.caseStatus === 'COMPLETED') {
        console.warn("Final accusation submitted but case is already completed.");
        return; // Or re-emit the final revelation
    }

    console.log(`Player has accused character: ${characterId}`);
    this.state.caseStatus = 'COMPLETED';

    // The revelation scene ID is fixed as per our design
    const revelationSceneId = 'final_revelation_scene';

    this.emit('FINAL_REVELATION_TRIGGERED', {
      accusedCharacterId: characterId,
      revelationSceneId: revelationSceneId,
    });
    console.log(`Case completed. Final revelation triggered for scene: ${revelationSceneId}`);
  }

  private emit<K extends CaseEventType>(eventName: K, payload: EventPayloadMap[K]): void {
    // Record event in history
    this.state.eventHistory.push({ eventType: eventName, payload, timestamp: Date.now() });

    const handlers = this.eventHandlers[eventName];
    if (handlers) {
      // The type assertion is okay here because K is constrained
      (handlers as ((payload: EventPayloadMap[K]) => void)[]).forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  private openSceneInternal(sceneId: string, checkUnlock: boolean = true): void {
    if (!this.state.currentBundle) {
      console.error("Cannot open scene: No bundle loaded.");
      return;
    }
    const sceneDef = this.state.currentBundle.manifest.scenes.find(s => s.id === sceneId);
    if (!sceneDef) {
      console.error(`Scene with id '${sceneId}' not found in manifest.`);
      this.emit('SCENE_UNLOCK_FAILED', { sceneId, reason: 'Scene not found in manifest' });
      return;
    }

    if (checkUnlock && sceneDef.unlock) {
      const unlockConditions = sceneDef.unlock;
      let canUnlock = true;

      if (unlockConditions.after) {
        canUnlock = canUnlock && unlockConditions.after.every(id => this.state.unlockedSceneIds.has(id) || this.state.currentSceneId === id);
      }
      if (unlockConditions.puzzle) {
        canUnlock = canUnlock && this.state.solvedPuzzleIds.has(unlockConditions.puzzle);
      }
      if (unlockConditions.objective) {
        canUnlock = canUnlock && this.state.completedObjectiveIds.has(unlockConditions.objective);
      }
      if (unlockConditions.all_puzzles_solved) {
        const puzzlesToSolve = Array.isArray(unlockConditions.all_puzzles_solved)
          ? unlockConditions.all_puzzles_solved
          : (this.state.currentBundle.manifest.puzzles || []).map(p => p.id);
        canUnlock = canUnlock && puzzlesToSolve.every(pid => this.state.solvedPuzzleIds.has(pid));
      }

      if (!canUnlock) {
        console.warn(`Scene '${sceneId}' is locked. Conditions not met.`);
        this.emit('SCENE_UNLOCK_FAILED', { sceneId, reason: 'Unlock conditions not met' });
        return;
      }
    }

    this.state.currentSceneId = sceneId;
    this.state.unlockedSceneIds.add(sceneId);

    let sceneContent: string | undefined = undefined;
    if (sceneDef.file) {
        const fileData = this.state.currentBundle.files.find(f => f.path === sceneDef.file);
        if (fileData) {
            sceneContent = fileData.content;
        } else {
            console.warn(`Content file ${sceneDef.file} for scene ${sceneId} not found in bundle files.`);
        }
    }

    this.emit('SCENE_OPENED', { sceneId, sceneDefinition: sceneDef, content: sceneContent });
    console.log(`Scene '${sceneId}' opened successfully.`);
  }
  
  private checkAllPuzzlesSolved(): void {
    if (!this.state.currentBundle || !this.state.currentBundle.manifest.puzzles) {
      return; 
    }
    const allPuzzles = this.state.currentBundle.manifest.puzzles;
    const allSolved = allPuzzles.every(p => this.state.solvedPuzzleIds.has(p.id));

    if (allSolved) {
      this.emit('ALL_PUZZLES_SOLVED', {});
      console.log("All puzzles in the case have been solved!");
      // Potentially trigger other game events or objectives based on this
    }
  }
}

// Basic test
// async function testEngine() { ... } // Remove entire function

// Comment out to prevent auto-run when imported if this becomes a library
// testEngine().catch(console.error); // Remove this line 