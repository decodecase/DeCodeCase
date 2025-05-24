import { EngineAction, Unsub, CaseState, // Added
CaseEventType, // Added
EventPayloadMap, // Added
LoadBundlePayload } from './types';
export declare class CaseEngine {
    private state;
    private eventHandlers;
    constructor(initialState?: Partial<CaseState>);
    private getInitialEngineState;
    loadBundle(payload: LoadBundlePayload): Promise<void>;
    startCase(): void;
    getState(): CaseState;
    on<K extends CaseEventType>(eventName: K, handler: (payload: EventPayloadMap[K]) => void): Unsub;
    dispatch(action: EngineAction): void;
    private handleSubmitAnswer;
    private handleUseHint;
    private handleSubmitFinalAccusation;
    private emit;
    private openSceneInternal;
    private checkAllPuzzlesSolved;
}
