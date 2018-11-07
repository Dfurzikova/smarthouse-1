type ConstructorParams = { [keys: string]: any };
type State = { [keys: string]: any };
type Action = { [keys: string]: any };

import * as Dispatcher from "./Dispatcher";

export class Store {
    state: State
    onChange: any

    constructor(params: ConstructorParams) {
        const { actions, onChange } = params;

        this.state = {};
        this.onChange = onChange;

        Dispatcher.register((action: Action) => {
            if (!actions[action.actionName]) {
                return;
            }

            actions[action.actionName](action);
        });
    }
    
    setState(action: Action) {
        const newSate = this.reducers(this.state, action);
      
        this.state = newSate;
      
        this.onChange();
    }
    
    getState() {
        return this.state;
    }
    
    reducers(state: State, action: Action) {
        return Object.assign({}, state, action);
    }
  }
  