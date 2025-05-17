export type EngineAction = {
    type: 'OPEN_SCENE';
    id: string;
} | {
    type: 'SUBMIT_ANSWER';
    puzzleId: string;
    answer: string;
} | {
    type: 'USE_HINT';
    puzzleId: string;
} | {
    type: 'ACCUSE';
    suspectId: string;
};
export type EngineEventName = 'SCENE_OPENED' | 'PUZZLE_SOLVED' | 'PUZZLE_ATTEMPT_FAILED' | 'HINT_REVEALED' | 'OBJECTIVE_UPDATED' | 'GAME_COMPLETED' | 'STATE_CHANGED';
export type SceneOpenedPayload = {
    sceneId: string;
};
export type PuzzleSolvedPayload = {
    puzzleId: string;
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
    outcome: string;
    details?: any;
};
export type StateChangedPayload = {
    newState: EngineState;
};
export interface CaseBundle {
    id: string;
    title: string;
    tagline?: string;
    version?: string;
    duration_estimate_min?: string;
    cover?: string;
    manifest: CaseManifest;
    puzzles?: PuzzleDefinition[];
    assetsBasePath?: string;
    sceneFiles?: Record<string, string>;
    assets?: Record<string, string>;
}
export interface CaseManifest {
    initialSceneId?: string;
    scenes: SceneDefinition[];
}
export interface SceneDefinition {
    id: string;
    file: string;
    title?: string;
    unlock?: UnlockCondition;
    layout?: string;
    widgets?: SceneWidget[];
    objectives?: (string | {
        id: string;
        text: string;
        initiallyActive?: boolean;
    })[];
    puzzles_required_to_exit?: string[];
    actions?: SceneAction[];
}
export interface SceneWidget {
    type: 'image' | 'document_viewer' | 'text_block' | 'video' | 'audio';
    src: string;
    caption?: string;
    pdfPageRange?: string;
}
export interface SceneAction {
    label: string;
    action: EngineAction['type'];
    puzzleId?: string;
}
export interface UnlockCondition {
    after?: string;
    puzzle?: string;
    all_puzzles_solved?: boolean;
    objective?: string;
}
export interface Hint {
    text: string;
    cost?: number;
}
export interface PuzzleDefinition {
    id: string;
    type: string;
    source?: string;
    solution?: any;
    answer?: any;
    hints?: Hint[];
}
export interface EngineState {
    currentCaseId: string | null;
    currentSceneId: string | null;
    unlockedSceneIds: Set<string>;
    solvedPuzzleIds: Set<string>;
    activeObjectives: Set<string>;
    completedObjectives: Set<string>;
    failedObjectives: Set<string>;
    hintsUsedCount: {
        [puzzleId: string]: number;
    };
    isGameCompleted: boolean;
    gameOutcome?: string;
}
export type Unsub = () => void;
