import * as Dispatcher from "./Dispatcher";


interface State { 
    [keys: string]: any; 
}

interface Callback {
    (action: State): void;
}

export class Store {
    state: State
    onChange: any

    constructor(params) {
        const { actions, onChange } = params;

        this.state = {};
        this.onChange = onChange;

        Dispatcher.register((action) => {
            if (!actions[action.actionName]) {
                return;
            }

            actions[action.actionName](action);
        });
    }
    
    setState(action) {
        const newSate = this.reducers(this.state, action);
      
        this.state = newSate;
      
        this.onChange();
    }
    
    getState() {
        return this.state;
    }
    
    reducers(state, action) {
        return Object.assign({}, state, action);
    }
  }
  