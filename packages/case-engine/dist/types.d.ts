export interface CaseFile {
    path: string;
    content: string;
}
export interface CaseAsset {
    path: string;
    type: 'image' | 'audio' | 'video' | 'document';
}
export interface CaseMetadata {
    caseId?: string;
    title: string;
    tagline?: string;
    description?: string;
    author?: string;
    version?: string;
    createdAt?: string;
    tags?: string[];
    coverImage?: string;
    durationEstimate?: string;
}
export interface Hint {
    text: string;
    cost?: number;
    revealed?: boolean;
}
export interface PuzzleDefinition {
    id: string;
    type: 'text' | 'image' | 'cipher' | 'logic' | 'text_input';
    prompt?: string;
    solution: string | string[];
    feedback?: string;
    hints?: Hint[];
    asset?: string;
    unlocks?: string[];
    title?: string;
    description?: string;
}
export interface ObjectiveDefinition {
    id: string;
    description: string;
    targetSceneId?: string;
    targetPuzzleId?: string;
    isCompleted?: boolean;
}
export interface UnlockCondition {
    after?: string[];
    puzzle?: string;
    objective?: string;
    all_puzzles_solved?: boolean | string[];
}
export interface ComputerFile {
    name: string;
    path: string;
    content?: string;
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
    desktopBackgroundImage?: string;
    folders: ComputerFolder[];
}
export interface SceneWidget {
    type: 'image' | 'audio_player' | 'text_box' | 'button_link';
    src?: string;
    text?: string;
    linkToSceneId?: string;
}
export interface SceneDefinition {
    id: string;
    title: string;
    file?: string;
    type?: 'markdown' | 'computer_interface' | 'interactive_map' | 'interview';
    unlock?: UnlockCondition;
    widgets?: SceneWidget[];
    computerInterface?: ComputerInterfaceDefinition;
    documentType?: string;
    characterIds?: string[];
}
export interface CharacterDefinition {
    id: string;
    name: string;
    image?: string;
    description?: string;
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
    files: CaseFile[];
}
export type EngineActionType = 'LOAD_BUNDLE' | 'START_CASE' | 'OPEN_SCENE' | 'SUBMIT_ANSWER' | 'USE_HINT' | 'SUBMIT_FINAL_ACCUSATION';
export interface LoadBundlePayload {
    bundle: CaseBundle;
}
export interface StartCasePayload {
}
export interface OpenScenePayload {
    sceneId: string;
}
export interface SubmitAnswerPayload {
    puzzleId: string;
    answer: string;
}
export interface UseHintPayload {
    puzzleId: string;
    hintIndex: number;
}
export interface SubmitFinalAccusationPayload {
    characterId: string;
}
export type EngineAction = {
    type: 'LOAD_BUNDLE';
    payload: LoadBundlePayload;
} | {
    type: 'START_CASE';
    payload?: StartCasePayload;
} | {
    type: 'OPEN_SCENE';
    payload: OpenScenePayload;
} | {
    type: 'SUBMIT_ANSWER';
    payload: SubmitAnswerPayload;
} | {
    type: 'USE_HINT';
    payload: UseHintPayload;
} | {
    type: 'SUBMIT_FINAL_ACCUSATION';
    payload: SubmitFinalAccusationPayload;
};
export interface CaseState {
    currentBundle: CaseBundle | null;
    currentSceneId: string | null;
    unlockedSceneIds: Set<string>;
    solvedPuzzleIds: Set<string>;
    completedObjectiveIds: Set<string>;
    hintsUsed: {
        [puzzleId: string]: Set<number>;
    };
    inventory: Set<string>;
    caseStatus: CaseStatus;
    errorMessage?: string;
    actionHistory: EngineAction[];
    eventHistory: {
        eventType: CaseEventType;
        payload: any;
        timestamp: number;
    }[];
}
export type CaseStatus = 'UNINITIALIZED' | 'LOADING' | 'LOADED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR';
export type CaseEventType = 'CASE_LOADED' | 'CASE_STARTED' | 'SCENE_OPENED' | 'SCENE_UNLOCK_FAILED' | 'PUZZLE_SOLVED' | 'PUZZLE_ATTEMPT_FAILED' | 'HINT_REVEALED' | 'OBJECTIVE_COMPLETED' | 'ALL_PUZZLES_SOLVED' | 'FINAL_REVELATION_TRIGGERED';
export interface CaseLoadedPayload {
    manifest: CaseManifest;
    initialSceneId: string;
}
export interface CaseStartedPayload {
    initialSceneId: string;
}
export interface SceneOpenedPayload {
    sceneId: string;
    sceneDefinition: SceneDefinition;
    content?: string;
}
export interface SceneUnlockFailedPayload {
    sceneId: string;
    reason: string;
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
    hintsUsedCount: number;
}
export interface ObjectiveCompletedPayload {
    objectiveId: string;
}
export interface AllPuzzlesSolvedPayload {
}
export interface FinalRevelationTriggeredPayload {
    accusedCharacterId: string;
    revelationSceneId: string;
}
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
export type EngineEventListener<K extends CaseEventType> = (payload: EventPayloadMap[K]) => void;
export type Unsub = () => void;
