"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDeadAirBundle = exports.CaseEngine = void 0;
exports.getEngineName = getEngineName;
/**
 * A placeholder function for the case engine.
 */
function getEngineName() {
    return "DecodeCase Engine v0.1";
}
// We will define the CaseEngine class and related types here later.
console.log("Case Engine Loaded (Placeholder)");
class CaseEngine {
    constructor() {
        this.currentBundle = null;
        // Store handlers in a way that allows for mixed types internally, but overloads provide external safety
        this.eventHandlers = {};
        this.currentState = this.getInitialEngineState();
        console.log("CaseEngine initialized.");
    }
    getInitialEngineState() {
        return {
            currentCaseId: null,
            currentSceneId: null,
            unlockedSceneIds: new Set(),
            solvedPuzzleIds: new Set(),
            activeObjectives: new Set(),
            completedObjectives: new Set(),
            failedObjectives: new Set(),
            hintsUsedCount: {},
            isGameCompleted: false,
            gameOutcome: undefined,
        };
    }
    /**
     * Loads a case bundle into the engine.
     * @param bundle The case bundle to load.
     */
    async load(bundle) {
        console.log(`Loading case: ${bundle.title}`);
        this.currentBundle = bundle;
        this.currentState = Object.assign(Object.assign({}, this.getInitialEngineState()), { currentCaseId: bundle.id });
        let initialSceneId = bundle.manifest.initialSceneId;
        if (!initialSceneId && bundle.manifest.scenes.length > 0) {
            initialSceneId = bundle.manifest.scenes[0].id;
        }
        if (initialSceneId) {
            this.openSceneInternal(initialSceneId, false);
        }
        else {
            console.warn("No scenes found in the manifest or no initial scene specified.");
            this.emitStateChange();
        }
        console.log("Case loaded successfully.");
    }
    /**
     * Gets the current state of the engine.
     */
    get state() {
        // Perform a deep copy that correctly handles Sets and other object types
        return {
            currentCaseId: this.currentState.currentCaseId,
            currentSceneId: this.currentState.currentSceneId,
            unlockedSceneIds: new Set(this.currentState.unlockedSceneIds),
            solvedPuzzleIds: new Set(this.currentState.solvedPuzzleIds),
            activeObjectives: new Set(this.currentState.activeObjectives),
            completedObjectives: new Set(this.currentState.completedObjectives),
            failedObjectives: new Set(this.currentState.failedObjectives),
            hintsUsedCount: Object.assign({}, this.currentState.hintsUsedCount), // Shallow copy for this specific object
            isGameCompleted: this.currentState.isGameCompleted,
            gameOutcome: this.currentState.gameOutcome,
        };
    }
    // General implementation (will be used by the overloads)
    on(eventName, handler) {
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
    dispatch(action) {
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
                console.warn(`Unknown action type: ${action.type}`);
        }
    }
    // --- Internal Helper Methods ---
    handleSubmitAnswer(puzzleId, submittedAnswer) {
        var _a, _b;
        if (!((_a = this.currentBundle) === null || _a === void 0 ? void 0 : _a.puzzles)) {
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
        const correctAnswer = (_b = puzzleDef.solution) !== null && _b !== void 0 ? _b : puzzleDef.answer;
        if (correctAnswer === undefined) {
            console.error(`Puzzle '${puzzleId}' has no solution/answer defined.`);
            return;
        }
        if (String(correctAnswer).trim() === String(submittedAnswer).trim()) {
            if (!this.currentState.solvedPuzzleIds.has(puzzleId)) {
                this.currentState.solvedPuzzleIds.add(puzzleId);
                const payload = { puzzleId };
                this.emit('PUZZLE_SOLVED', payload);
                this.emitStateChange(); // State has changed due to puzzle solve
                console.log(`Puzzle '${puzzleId}' solved!`);
            }
            else {
                console.log(`Puzzle '${puzzleId}' was already solved.`);
                // Optionally, re-emit PUZZLE_SOLVED or do nothing
            }
        }
        else {
            const payload = { puzzleId, submittedAnswer };
            this.emit('PUZZLE_ATTEMPT_FAILED', payload);
            console.warn(`Incorrect answer for puzzle '${puzzleId}'. Submitted: '${submittedAnswer}'`);
        }
    }
    handleUseHint(puzzleId) {
        var _a;
        if (!((_a = this.currentBundle) === null || _a === void 0 ? void 0 : _a.puzzles)) {
            console.error("Cannot use hint: No puzzles defined.");
            return;
        }
        const puzzleDef = this.currentBundle.puzzles.find(p => p.id === puzzleId);
        if (!puzzleDef) {
            console.error(`Cannot use hint: Puzzle '${puzzleId}' not found.`);
            return;
        }
        if (this.currentState.solvedPuzzleIds.has(puzzleId)) {
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
    emit(eventName, payload) {
        const handlers = this.eventHandlers[eventName];
        if (handlers) {
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
    emitStateChange() {
        const statePayload = { newState: this.state };
        this.emit('STATE_CHANGED', statePayload);
    }
    // Basic internal scene opening logic
    openSceneInternal(sceneId, checkUnlock = true) {
        var _a;
        if (!this.currentBundle) {
            console.error("Cannot open scene: No case bundle loaded.");
            return;
        }
        const sceneDef = this.currentBundle.manifest.scenes.find(s => s.id === sceneId);
        if (!sceneDef) {
            console.error(`Scene with id '${sceneId}' not found in manifest.`);
            return;
        }
        if (checkUnlock) {
            const unlockConditions = sceneDef.unlock;
            let isLocked = false;
            let lockReason = "Scene does not meet unlock criteria:";
            if (unlockConditions) {
                // Assume all defined conditions must be met (AND logic)
                if (unlockConditions.after) {
                    if (!this.currentState.unlockedSceneIds.has(unlockConditions.after)) {
                        isLocked = true;
                        lockReason += ` Previous scene '${unlockConditions.after}' not completed.`;
                    }
                }
                if (unlockConditions.puzzle) {
                    if (!this.currentState.solvedPuzzleIds.has(unlockConditions.puzzle)) {
                        isLocked = true;
                        lockReason += ` Puzzle '${unlockConditions.puzzle}' not solved.`;
                    }
                }
                if (unlockConditions.objective) {
                    if (!this.currentState.completedObjectives.has(unlockConditions.objective)) {
                        isLocked = true;
                        lockReason += ` Objective '${unlockConditions.objective}' not completed.`;
                    }
                }
                if (unlockConditions.all_puzzles_solved) {
                    const allPuzzlesInCase = ((_a = this.currentBundle.puzzles) === null || _a === void 0 ? void 0 : _a.map(p => p.id)) || [];
                    if (allPuzzlesInCase.length === 0 && this.currentBundle.puzzles) {
                        // If puzzles array exists but is empty, this condition might be vacuously true or misconfigured.
                        console.warn(`'all_puzzles_solved' condition for scene '${sceneId}' but no puzzles defined in the bundle.`);
                    }
                    else {
                        const allSolved = allPuzzlesInCase.every(puzzleId => this.currentState.solvedPuzzleIds.has(puzzleId));
                        if (!allSolved) {
                            isLocked = true;
                            lockReason += ` Not all puzzles in the case are solved.`;
                        }
                    }
                }
            }
            else {
                // If no unlock conditions are specified, the scene is considered unlocked by default
                // (unless it's the very first scene being opened by load(), where checkUnlock is false)
                // No action needed here, isLocked remains false.
            }
            if (isLocked) {
                console.warn(lockReason);
                // Optionally, you could emit an event here like 'SCENE_ACCESS_DENIED'
                return; // Prevent opening the locked scene
            }
        }
        // If not locked or checkUnlock is false, proceed to open
        this.currentState.currentSceneId = sceneId;
        this.currentState.unlockedSceneIds.add(sceneId); // Mark as visited/unlocked by opening
        const payload = { sceneId };
        this.emit('SCENE_OPENED', payload);
        this.emitStateChange();
        console.log(`Scene '${sceneId}' opened.`);
    }
}
exports.CaseEngine = CaseEngine;
// Example Usage (for testing with partial Dead Air bundle):
const engine = new CaseEngine();
console.log("--- Setting up Test Event Listeners ---");
const unsubSceneOpened = engine.on('SCENE_OPENED', (payload) => {
    console.log(`EVENT: SCENE_OPENED - Scene ID: ${payload.sceneId}`);
});
const unsubPuzzleSolved = engine.on('PUZZLE_SOLVED', (payload) => {
    console.log(`EVENT: PUZZLE_SOLVED - Puzzle ID: ${payload.puzzleId}`);
});
const unsubPuzzleAttemptFailed = engine.on('PUZZLE_ATTEMPT_FAILED', (payload) => {
    console.log(`EVENT: PUZZLE_ATTEMPT_FAILED - Puzzle ID: ${payload.puzzleId}, Submitted: '${payload.submittedAnswer}'`);
});
// Add listener for HINT_REVEALED
const unsubHintRevealed = engine.on('HINT_REVEALED', (payload) => {
    var _a;
    console.log(`EVENT: HINT_REVEALED - Puzzle ID: ${payload.puzzleId}, Hint [${payload.hintIndex}]: "${payload.hintText}", Remaining: ${(_a = payload.remainingHints) !== null && _a !== void 0 ? _a : 'N/A'}`);
});
const unsubStateChanged = engine.on('STATE_CHANGED', (payload) => {
    console.log(`EVENT: STATE_CHANGED - Current Scene: ${payload.newState.currentSceneId}, Solved: ${Array.from(payload.newState.solvedPuzzleIds).join(', ') || 'None'}, Hints Used: ${JSON.stringify(payload.newState.hintsUsedCount)}`);
});
const mockDeadAirBundle = {
    id: "dead-air-mock",
    version: "0.1.0",
    title: "Dead Air (Mock)",
    manifest: {
        initialSceneId: "intro",
        scenes: [
            { id: "intro", title: "Introduction", file: "scenes/00_intro.md" },
            {
                id: "crime_scene",
                title: "KACL Crime Scene",
                file: "scenes/01_crime_scene.md",
                unlock: { after: "intro" }
            },
            {
                id: "evidence_review",
                title: "Evidence Review",
                file: "scenes/02_evidence_loop.json",
                unlock: { puzzle: "freq_cipher" }
            },
            {
                id: "suspect_frasier",
                title: "Interview: Frasier Crane",
                file: "scenes/03_frasier.md",
                unlock: { objective: "investigate_studio" }
            },
            {
                id: "final_confrontation",
                title: "The Reveal",
                file: "scenes/99_reveal.md",
                unlock: { all_puzzles_solved: true }
            }
        ],
    },
    puzzles: [
        {
            id: "freq_cipher",
            type: "text_input",
            solution: "THE CREAMER SHALL FALL AT DEATH COME",
            hints: [
                { text: "It looks like a substitution cipher. Have you heard of Caesar's nemesis?", cost: 0 },
                { text: "The cipher is Atbash. Each letter is mapped to its reverse in the alphabet (A=Z, B=Y, etc.).", cost: 1 }
            ]
        },
        {
            id: "sound_booth_lock",
            type: "number_input",
            solution: "1993",
            hints: [
                { text: "Think about the history of KACL.", cost: 0 },
                { text: "When did a famous radio psychiatrist start working there?", cost: 1 }
            ]
        }
    ],
    sceneFiles: {
        "scenes/00_intro.md": "# Dead Air - Introduction\n\nWelcome to KACL, Seattle's premier talk radio station. Or it was, until tragedy struck...",
        "scenes/01_crime_scene.md": "# KACL Crime Scene\n\nThe studio is a mess. Equipment is scattered, and a chilling silence hangs in the air...",
        "scenes/02_evidence_loop.json": "{ \"type\": \"interactive_evidence_viewer\", \"items\": [ {\"id\": \"ev001\", \"name\": \"Mysterious Note\"} ] }",
        "scenes/03_frasier.md": "# Interview: Dr. Frasier Crane\n\n\'I assure you, I was at \'Le Cigare Volant\' all evening!\'",
        "scenes/99_reveal.md": "# The Reveal\n\nAfter careful consideration, the killer is..."
    },
    assets: {
        "assets/dead-air-cover.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        "puzzles/freq_cipher_image.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }
};
exports.mockDeadAirBundle = mockDeadAirBundle;
async function testEngine() {
    console.log("\n--- Starting Engine Test with Dead Air Bundle ---");
    await engine.load(mockDeadAirBundle);
    // 'intro' scene should be opened automatically by load()
    // The STATE_CHANGED and SCENE_OPENED events for 'intro' should have fired.
    console.log("\n--- Attempting to open 'crime_scene' (should succeed) ---");
    engine.dispatch({ type: 'OPEN_SCENE', id: 'crime_scene' });
    console.log("\n--- Attempting to use hint for 'freq_cipher' (1st hint) ---");
    engine.dispatch({ type: 'USE_HINT', puzzleId: 'freq_cipher' });
    console.log("\n--- Attempting to open 'evidence_loop' (should be locked by freq_cipher) ---");
    engine.dispatch({ type: 'OPEN_SCENE', id: 'evidence_loop' });
    console.log("\n--- Submitting incorrect answer to 'freq_cipher' ---");
    engine.dispatch({ type: 'SUBMIT_ANSWER', puzzleId: 'freq_cipher', answer: 'WRONG' });
    console.log("\n--- Attempting to use hint for 'freq_cipher' (2nd hint) ---");
    engine.dispatch({ type: 'USE_HINT', puzzleId: 'freq_cipher' });
    console.log("\n--- Submitting correct answer to 'freq_cipher' ---");
    engine.dispatch({ type: 'SUBMIT_ANSWER', puzzleId: 'freq_cipher', answer: 'RAKUN' });
    console.log("\n--- Attempting to use hint for 'freq_cipher' again (already solved) ---");
    engine.dispatch({ type: 'USE_HINT', puzzleId: 'freq_cipher' });
    console.log("\n--- Attempting to open 'evidence_loop' again (should now succeed) ---");
    engine.dispatch({ type: 'OPEN_SCENE', id: 'evidence_loop' });
    console.log("\n--- Testing hints for 'rakun_folder_pw' ---");
    engine.dispatch({ type: 'USE_HINT', puzzleId: 'rakun_folder_pw' }); // 1st hint
    engine.dispatch({ type: 'USE_HINT', puzzleId: 'rakun_folder_pw' }); // No more hints
    engine.dispatch({ type: 'SUBMIT_ANSWER', puzzleId: 'rakun_folder_pw', answer: 'RAKUN11' });
    console.log("\n--- Test Concluded ---");
    // Unsubscribe from events
    unsubSceneOpened();
    unsubPuzzleSolved();
    unsubPuzzleAttemptFailed();
    unsubHintRevealed(); // Unsubscribe from new listener
    unsubStateChanged();
    console.log("Event listeners unsubscribed.");
}
// To run the test:
// 1. Make sure you are in the root of the monorepo.
// 2. Execute: ts-node packages/case-engine/src/index.ts 
//    (You might need to install ts-node globally: npm install -g ts-node)
//    (And ensure typescript is also available: npm install -g typescript, if not already)
// testEngine().catch(console.error); 
__exportStar(require("./types"), exports);
