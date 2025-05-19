// packages/case-engine/src/types.ts

// === Engine Actions ===
// Actions are dispatched to the engine to trigger changes or operations.
export type EngineAction =
  | { type: 'OPEN_SCENE'; id: string }
  | { type: 'SUBMIT_ANSWER'; puzzleId: string; answer: string }
  | { type: 'USE_HINT'; puzzleId: string } // Assuming hint is tied to a puzzle
  | { type: 'ACCUSE'; suspectId: string };

// === Engine Event Names ===
// Event names are used when subscribing to engine events.
export type EngineEventName =
  | 'SCENE_OPENED'
  | 'PUZZLE_SOLVED'
  | 'PUZZLE_ATTEMPT_FAILED'
  | 'HINT_REVEALED'
  | 'OBJECTIVE_UPDATED'
  | 'GAME_COMPLETED'
  | 'STATE_CHANGED'; // A general event for state updates, useful for UI binding

// === Engine Event Payloads ===
// These define the structure of data passed with each event.
// The 'on' method's handler function will receive a payload object.
// e.g., engine.on('SCENE_OPENED', (payload: SceneOpenedPayload) => { /* ... */ });

export type SceneOpenedPayload = {
  sceneId: string;
  // sceneData?: any; // More specific type for scene content can be added later
};

export type PuzzleSolvedPayload = {
  puzzleId: string;
  // unlockedItemIds?: string[]; // e.g., new evidence or scenes unlocked by this puzzle
};

export type PuzzleAttemptFailedPayload = {
  puzzleId: string;
  submittedAnswer: string;
};

export type HintRevealedPayload = {
  puzzleId: string;
  hintText: string;
  hintIndex: number;
  remainingHints?: number;
};

export type ObjectiveUpdatedPayload = {
  objectiveId: string;
  status: 'new' | 'active' | 'completed' | 'failed';
  description?: string;
};

export type GameCompletedPayload = {
  outcome: string; // e.g., "accused_correctly", "ran_out_of_time"
  details?: any; // Any specific details about the game end
};

// For STATE_CHANGED, the payload would likely be the new EngineState or a part of it.
export type StateChangedPayload = {
  newState: EngineState; // Or Partial<EngineState> if sending diffs
};

// === Case Bundle Structure ===
// Defines the structure of a case that the engine loads.

export interface CaseBundle {
  id: string;
  title: string;
  tagline?: string;
  version?: string;
  duration_estimate_min?: string;
  cover?: string; // Path to cover image
  manifest: CaseManifest;
  puzzles?: PuzzleDefinition[]; // From puzzles.yml
  // Potentially i18n strings, character profiles, etc.
  assetsBasePath?: string; // Base path for resolving relative asset URLs in scenes/evidence
  sceneFiles?: Record<string, string>; // Added for mock bundle
  assets?: Record<string, string>; // Added for mock bundle
}

// === New Types for Computer Interface Scenes ===
export interface ComputerFileReference {
  name: string;         // Filename e.g., "11-03-2025.pdf"
  path: string;         // Direct path to the asset e.g., "assets/computer_files/onur/02-03-2025.pdf"
  fileType: 'pdf' | 'audio' | 'text' | 'image'; // To help UI render an appropriate icon or viewer
}

export interface ComputerFolder {
  name: string;
  password?: string;    // Optional password for the folder
  files: ComputerFileReference[];
  subFolders?: ComputerFolder[]; // For potential future nested folders - type should be ComputerFolder[]
}

export interface ComputerInterfaceData {
  initialPassword?: string; // Password to "unlock" the computer itself
  desktopBackgroundImage?: string; // Optional path to a desktop background image
  folders: ComputerFolder[];
}
// === End of New Types for Computer Interface Scenes ===

export interface CaseManifest {
  initialSceneId?: string; // Optional: if not specified, could default to the first in the scenes array
  scenes: SceneDefinition[];
  // Global objectives, initial inventory, etc. could go here
}

export interface SceneDefinition {
  id: string;
  file?: string; // Path to scene file (e.g., .md, .json, or asset like .pdf, .png). Optional if computerInterface is defined.
  title?: string; // Display title for the scene
  documentType?: string; // Added for UI hints based on document category
  unlock?: UnlockCondition;
  // For JSON-defined scenes (as per your example scenes/02_evidence_loop.json)
  layout?: string; // e.g., 'split', 'single-column'
  widgets?: SceneWidget[];
  objectives?: (string | { id: string; text: string; initiallyActive?: boolean })[];
  puzzles_required_to_exit?: string[]; // IDs of puzzles that must be solved to 'complete' this scene
  actions?: SceneAction[]; // e.g., buttons within a scene
  computerInterface?: ComputerInterfaceData; // New field for computer interface scenes
}

export interface SceneWidget {
  type: 'image' | 'document_viewer' | 'text_block' | 'video' | 'audio';
  src: string; // Path to asset or direct content
  caption?: string;
  // Other widget-specific properties, e.g., pdfPageRange for document_viewer
  pdfPageRange?: string; // e.g., "2-8"
}

export interface SceneAction {
  label: string;
  action: EngineAction['type']; // e.g., 'SUBMIT_ANSWER'
  puzzleId?: string; // if action is SUBMIT_ANSWER
  // Other properties based on the action type
}

export interface UnlockCondition {
  after?: string; // Unlocks after a specific sceneId is completed/visited
  puzzle?: string; // Unlocks after a specific puzzleId is solved
  all_puzzles_solved?: boolean;
  objective?: string; // Unlocks after a specific objectiveId is completed
  // Could be extended with AND/OR logic or item requirements
}

export interface Hint {
  text: string;
  cost?: number;
}

export interface PuzzleDefinition {
  id: string;
  type: string; // e.g., 'substitution', 'password', 'logic', 'timeline'
  source?: string; // Reference to evidence or context for the puzzle
  solution?: any; // Can be string, number, object depending on puzzle type
  answer?: any; // Alias for solution, as in your example
  hints?: Hint[];
}

// === Engine State ===
// Represents the overall state of the game being managed by the engine.
export interface EngineState {
  currentCaseId: string | null;
  currentSceneId: string | null;
  unlockedSceneIds: Set<string>;
  solvedPuzzleIds: Set<string>;
  activeObjectives: Set<string>; // Objectives currently shown to the player
  completedObjectives: Set<string>;
  failedObjectives: Set<string>;
  // inventory: Set<string>; // For items or clues collected
  hintsUsedCount: { [puzzleId: string]: number };
  isGameCompleted: boolean;
  gameOutcome?: string; // Stores the outcome from GameCompletedPayload
  // Any other dynamic state, e.g., timers, scores
}

// === Unsubscribe Function ===
// Type for the function returned by `engine.on(...)` to stop listening.
export type Unsub = () => void; 