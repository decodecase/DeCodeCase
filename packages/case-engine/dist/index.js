"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseEngine = void 0;
class CaseEngine {
    constructor(initialState) {
        this.eventHandlers = {}; // Use the new type
        this.state = this.getInitialEngineState(initialState);
        console.log("CaseEngine initialized.");
    }
    getInitialEngineState(initialValues = {}) {
        return Object.assign({ currentBundle: null, currentSceneId: null, unlockedSceneIds: new Set(), solvedPuzzleIds: new Set(), completedObjectiveIds: new Set(), hintsUsed: {}, inventory: new Set(), caseStatus: 'UNINITIALIZED', errorMessage: undefined, actionHistory: [], eventHistory: [] }, initialValues);
    }
    async loadBundle(payload) {
        var _a;
        const { bundle } = payload;
        console.log(`Loading case: ${((_a = bundle.manifest.metadata) === null || _a === void 0 ? void 0 : _a.title) || 'Untitled Case'}`);
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
    startCase() {
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
        }
        else {
            console.warn("No initial scene ID specified in the manifest.");
            // Potentially set game to a specific state or emit an event
        }
    }
    getState() {
        // Perform a deep copy for safety, especially for Sets and objects
        return JSON.parse(JSON.stringify(this.state, (key, value) => {
            if (value instanceof Set) {
                return Array.from(value);
            }
            return value;
        }));
    }
    on(eventName, handler) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        // The type assertion is okay here because K is constrained by CaseEventType
        this.eventHandlers[eventName].push(handler);
        return () => {
            var _a;
            const handlers = this.eventHandlers[eventName];
            if (handlers) {
                // The type assertion is okay here
                this.eventHandlers[eventName] = handlers.filter(h => h !== handler);
                if (((_a = this.eventHandlers[eventName]) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                    delete this.eventHandlers[eventName];
                }
            }
        };
    }
    dispatch(action) {
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
            if (this.state.caseStatus === 'COMPLETED') {
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
                console.warn(`Unknown action type: ${action.type}`);
        }
    }
    handleSubmitAnswer(payload) {
        var _a;
        const { puzzleId, answer } = payload;
        if (!((_a = this.state.currentBundle) === null || _a === void 0 ? void 0 : _a.manifest.puzzles)) {
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
            }
            else {
                console.log(`Puzzle '${puzzleId}' was already solved.`);
            }
        }
        else {
            this.emit('PUZZLE_ATTEMPT_FAILED', { puzzleId, attemptedAnswer: answer });
            console.warn(`Incorrect answer for puzzle '${puzzleId}'. Submitted: '${answer}'`);
        }
    }
    handleUseHint(payload) {
        var _a;
        const { puzzleId, hintIndex } = payload;
        if (!((_a = this.state.currentBundle) === null || _a === void 0 ? void 0 : _a.manifest.puzzles)) {
            console.error("Cannot use hint: No puzzles defined.");
            return;
        }
        const puzzleDef = this.state.currentBundle.manifest.puzzles.find(p => p.id === puzzleId);
        if (!puzzleDef) {
            console.error(`Cannot use hint: Puzzle '${puzzleId}' not found.`);
            return;
        }
        if (this.state.solvedPuzzleIds.has(puzzleId)) {
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
            this.state.hintsUsed[puzzleId] = new Set();
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
    handleSubmitFinalAccusation(payload) {
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
    emit(eventName, payload) {
        // Record event in history
        this.state.eventHistory.push({ eventType: eventName, payload, timestamp: Date.now() });
        const handlers = this.eventHandlers[eventName];
        if (handlers) {
            // The type assertion is okay here because K is constrained
            handlers.forEach(handler => {
                try {
                    handler(payload);
                }
                catch (error) {
                    console.error(`Error in event handler for ${eventName}:`, error);
                }
            });
        }
    }
    openSceneInternal(sceneId, checkUnlock = true) {
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
        let sceneContent = undefined;
        if (sceneDef.file) {
            const fileData = this.state.currentBundle.files.find(f => f.path === sceneDef.file);
            if (fileData) {
                sceneContent = fileData.content;
            }
            else {
                console.warn(`Content file ${sceneDef.file} for scene ${sceneId} not found in bundle files.`);
            }
        }
        this.emit('SCENE_OPENED', { sceneId, sceneDefinition: sceneDef, content: sceneContent });
        console.log(`Scene '${sceneId}' opened successfully.`);
    }
    checkAllPuzzlesSolved() {
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
exports.CaseEngine = CaseEngine;
// Basic test
// async function testEngine() { ... } // Remove entire function
// Comment out to prevent auto-run when imported if this becomes a library
// testEngine().catch(console.error); // Remove this line 
