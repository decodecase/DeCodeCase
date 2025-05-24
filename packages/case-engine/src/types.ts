export interface CaseFile {
  path: string;
  content: string;
}

export interface CaseAsset {
  path: string; // e.g. images/character.png
  type: 'image' | 'audio' | 'video' | 'document'; // Add more as needed
}

export interface CaseMetadata {
  caseId?: string; // Added from bundle's metadata.json
  title: string;
  tagline?: string; // Added from bundle's metadata.json
  description?: string;
  author?: string;
  version?: string;
  createdAt?: string;
  tags?: string[]; // Corresponds to 'genre' in bundle's metadata.json
  coverImage?: string; // Path to an asset, corresponds to 'cover'
  durationEstimate?: string; // Added from bundle's metadata.json
}

export interface Hint {
  text: string;
  cost?: number; // Optional: cost to reveal the hint
  revealed?: boolean; // Runtime state, not part of initial definition
}

export interface PuzzleDefinition {
  id: string;
  type: 'text' | 'image' | 'cipher' | 'logic' | 'text_input'; // Example types, added text_input
  prompt?: string;
  solution: string | string[]; // Can be a single string or multiple valid answers
  feedback?: string; // General feedback on solve/fail, or specific for attempts
  hints?: Hint[];
  asset?: string; // Path to an image/audio asset related to the puzzle
  unlocks?: string[]; // IDs of scenes/puzzles/objectives this puzzle unlocks
  title?: string; // Optional title for the puzzle
  description?: string; // Optional description
}

export interface ObjectiveDefinition {
  id: string;
  description: string;
  targetSceneId?: string; // Optional: scene that needs to be visited
  targetPuzzleId?: string; // Optional: puzzle that needs to be solved
  isCompleted?: boolean; // Runtime state
}

export interface UnlockCondition {
  after?: string[]; // Scene IDs that must be completed/visited first
  puzzle?: string; // Puzzle ID that must be solved first
  objective?: string; // Objective ID that must be completed first
  all_puzzles_solved?: boolean | string[]; // True if all puzzles, or list of specific puzzle IDs
}

export interface ComputerFile {
  name: string;
  path: string; // Path to an asset if it's a downloadable file
  content?: string; // Or direct content if it's a text file shown in interface
  fileType: 'pdf' | 'txt' | 'img' | 'audio';
}

export interface ComputerFolder {
  name: string;
  password?: string;
  files: ComputerFile[];
  subFolders?: ComputerFolder[];
}

export interface ComputerInterfaceDefinition {
  initialPassword?: string;
  desktopBackgroundImage?: string; // Path to an asset
  folders: ComputerFolder[];
}

export interface SceneWidget {
  type: 'image' | 'audio_player' | 'text_box' | 'button_link';
  src?: string; // For image, audio
  text?: string; // For text_box, button
  linkToSceneId?: string; // For button_link
}

export interface SceneDefinition {
  id: string;
  title: string;
  file?: string; // Path to markdown file for scene content (if not computerInterface)
  type?: 'markdown' | 'computer_interface' | 'interactive_map' | 'interview'; // For future expansion
  unlock?: UnlockCondition;
  widgets?: SceneWidget[];
  computerInterface?: ComputerInterfaceDefinition; // If type is 'computer_interface'
  documentType?: string; // e.g., "Interview Transcript", "Evidence Report"
  characterIds?: string[]; // Add this line for characters in the scene
}

export interface CharacterDefinition {
  id: string;
  name: string;
  image?: string; // Optional path to character image asset
  description?: string; // Optional short bio or notes
}

export interface CaseManifest {
  initialSceneId: string;
  scenes: SceneDefinition[];
  puzzles?: PuzzleDefinition[];
  objectives?: ObjectiveDefinition[];
  characters?: CharacterDefinition[];
  assets?: CaseAsset[];
  metadata?: CaseMetadata;
}

export interface CaseBundle {
  manifest: CaseManifest;
  files: CaseFile[]; // Scene markdown files, puzzle data, etc.
  // Optional: metadata can be part of manifest or separate like this
  // metadata: CaseMetadata; 
  // description?: string;
  // author?: string;
  // releaseDate?: string;
  // tags?: string[];
  // coverImage?: string;
  // sceneFiles?: { [key: string]: string }; // sceneId to filePath mapping - DEPRECATED if using CaseFile[]
  // assets?: { [key: string]: string }; // assetId to filePath mapping - DEPRECATED if using CaseFile[]
}

// === Engine Action Types and Payloads ===
export type EngineActionType =
  | 'LOAD_BUNDLE'
  | 'START_CASE'
  | 'OPEN_SCENE'
  | 'SUBMIT_ANSWER'
  | 'USE_HINT'
  | 'SUBMIT_FINAL_ACCUSATION';

export interface LoadBundlePayload {
  bundle: CaseBundle;
}

export interface StartCasePayload { }

export interface OpenScenePayload {
  sceneId: string;
}

export interface SubmitAnswerPayload {
  puzzleId: string;
  answer: string;
}

export interface UseHintPayload {
  puzzleId: string;
  hintIndex: number; // Or hintId: string if hints have unique IDs
}

export interface SubmitFinalAccusationPayload {
  characterId: string;
}

export type EngineAction =
  | { type: 'LOAD_BUNDLE'; payload: LoadBundlePayload }
  | { type: 'START_CASE'; payload?: StartCasePayload } // Making payload optional as it's empty
  | { type: 'OPEN_SCENE'; payload: OpenScenePayload }
  | { type: 'SUBMIT_ANSWER'; payload: SubmitAnswerPayload }
  | { type: 'USE_HINT'; payload: UseHintPayload }
  | { type: 'SUBMIT_FINAL_ACCUSATION'; payload: SubmitFinalAccusationPayload };

// === Engine State ===
export interface CaseState {
  currentBundle: CaseBundle | null;
  currentSceneId: string | null;
  unlockedSceneIds: Set<string>;
  solvedPuzzleIds: Set<string>;
  completedObjectiveIds: Set<string>;
  hintsUsed: { [puzzleId: string]: Set<number> }; // puzzleId to set of hint indices used
  inventory: Set<string>; // e.g., item IDs collected by the player
  caseStatus: CaseStatus;
  errorMessage?: string;
  actionHistory: EngineAction[];
  eventHistory: { eventType: CaseEventType; payload: any; timestamp: number }[];
}

export type CaseStatus = 'UNINITIALIZED' | 'LOADING' | 'LOADED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR';

// === Engine Event Types and Payloads ===
export type CaseEventType =
  | 'CASE_LOADED'
  | 'CASE_STARTED'
  | 'SCENE_OPENED'
  | 'SCENE_UNLOCK_FAILED'
  | 'PUZZLE_SOLVED'
  | 'PUZZLE_ATTEMPT_FAILED'
  | 'HINT_REVEALED'
  | 'OBJECTIVE_COMPLETED' // Renamed from OBJECTIVE_UPDATED for clarity
  | 'ALL_PUZZLES_SOLVED'
  | 'FINAL_REVELATION_TRIGGERED';

export interface CaseLoadedPayload {
  manifest: CaseManifest;
  initialSceneId: string;
}

export interface CaseStartedPayload {
  initialSceneId: string;
  // any other relevant info when case starts
}

export interface SceneOpenedPayload {
  sceneId: string;
  sceneDefinition: SceneDefinition;
  content?: string; // Markdown content, if applicable
}

export interface SceneUnlockFailedPayload {
  sceneId: string;
  reason: string; // e.g., "Puzzle 'xyz' not solved"
}

export interface PuzzleSolvedPayload {
  puzzleId: string;
}

export interface PuzzleAttemptFailedPayload {
  puzzleId: string;
  attemptedAnswer: string;
}

export interface HintRevealedPayload {
  puzzleId: string;
  hint: Hint;
  hintIndex: number;
  hintsUsedCount: number; // Total hints revealed for this puzzle
}

export interface ObjectiveCompletedPayload {
  objectiveId: string;
}

export interface AllPuzzlesSolvedPayload { }

export interface FinalRevelationTriggeredPayload {
  accusedCharacterId: string;
  revelationSceneId: string;
}

// Map event types to their payload types
export interface EventPayloadMap {
  CASE_LOADED: CaseLoadedPayload;
  CASE_STARTED: CaseStartedPayload;
  SCENE_OPENED: SceneOpenedPayload;
  SCENE_UNLOCK_FAILED: SceneUnlockFailedPayload;
  PUZZLE_SOLVED: PuzzleSolvedPayload;
  PUZZLE_ATTEMPT_FAILED: PuzzleAttemptFailedPayload;
  HINT_REVEALED: HintRevealedPayload;
  OBJECTIVE_COMPLETED: ObjectiveCompletedPayload;
  ALL_PUZZLES_SOLVED: AllPuzzlesSolvedPayload;
  FINAL_REVELATION_TRIGGERED: FinalRevelationTriggeredPayload;
}

// Generic event listener type
export type EngineEventListener<K extends CaseEventType> = (payload: EventPayloadMap[K]) => void;

// Type for the function returned by `engine.on(...)` to stop listening.
export type Unsub = () => void;
