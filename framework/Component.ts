import * as Dispatcher from "./Dispatcher";
import { Store } from "./Store";

export class Component {
    dom: HTMLElement
    state: { [keys: string]: any }
    store: any
    
    constructor(params) {
        this.dom = params.dom;
        this.store = new Store({
            actions: this.getActions(),
            onChange: this.render.bind(this)
        });

        let dataFlux = this.dom.dataset.flux
        let data = {};

        try {
            data = JSON.parse(dataFlux);
        } catch(e){
            data = {};
        }

        this.store.setState(data);

        this.render();
    }

    action(action){
        Dispatcher.dispatch(action);
    }

    getActions(){
        return {}
    }

    render(): void {
        this.state = this.store.getState();
    };
}
