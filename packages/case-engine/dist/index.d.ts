/**
 * A placeholder function for the case engine.
 */
export declare function getEngineName(): string;
import { CaseBundle, EngineAction, EngineEventName, EngineState, Unsub, SceneOpenedPayload, PuzzleSolvedPayload, PuzzleAttemptFailedPayload, HintRevealedPayload, ObjectiveUpdatedPayload, GameCompletedPayload, StateChangedPayload } from './types';
interface EventPayloadMap {
    'SCENE_OPENED': SceneOpenedPayload;
    'PUZZLE_SOLVED': PuzzleSolvedPayload;
    'PUZZLE_ATTEMPT_FAILED': PuzzleAttemptFailedPayload;
    'HINT_REVEALED': HintRevealedPayload;
    'OBJECTIVE_UPDATED': ObjectiveUpdatedPayload;
    'GAME_COMPLETED': GameCompletedPayload;
    'STATE_CHANGED': StateChangedPayload;
}
export declare class CaseEngine {
    private currentBundle;
    private currentState;
    private eventHandlers;
    constructor();
    private getInitialEngineState;
    /**
     * Loads a case bundle into the engine.
     * @param bundle The case bundle to load.
     */
    load(bundle: CaseBundle): Promise<void>;
    /**
     * Gets the current state of the engine.
     */
    get state(): EngineState;
    /**
     * Subscribes to an engine event.
     * @param eventName The name of the event to subscribe to.
     * @param handler The function to call when the event occurs.
     * @returns An unsubscribe function.
     */
    on<K extends EngineEventName>(eventName: K, handler: (payload: EventPayloadMap[K]) => void): Unsub;
    /**
     * Dispatches an action to the engine.
     * @param action The action to dispatch.
     */
    dispatch(action: EngineAction): void;
    private handleSubmitAnswer;
    private handleUseHint;
    private emit;
    private emitStateChange;
    private openSceneInternal;
}
declare const mockDeadAirBundle: CaseBundle;
export { mockDeadAirBundle };
export * from './types';
