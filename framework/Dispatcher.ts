type Action = string | number;
type State = { [keys: string]: any; };

const _state: State = {};
const _eventCallbacks = [];

export function register (callback){
    _eventCallbacks.push(callback);
    
}

export function dispatch (action) {
    _eventCallbacks.forEach((cb) => cb(action));
}

export function getState (): State {
    return _state
}
