type State = { [keys: string]: any };
type Action = { [keys: string]: any };

interface DisplatcherCallback {
    (action: Action): void;
}

const _state: State = {};
const _eventCallbacks: DisplatcherCallback[] = [];

export function register (callback: DisplatcherCallback){
    _eventCallbacks.push(callback);
}

export function dispatch (action: Action) {
    _eventCallbacks.forEach((cb) => cb(action));
}

export function getState (): State {
    return _state
}
