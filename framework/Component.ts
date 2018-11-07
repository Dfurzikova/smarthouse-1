import * as Dispatcher from "./Dispatcher";
import { Store } from "./Store";

export class Component {
    dom: HTMLElement
    state: any;
    store: any
    
    constructor(params: { [keys: string]: any }) {
        this.dom = params.dom;
        this.store = new Store({
            actions: this.getActions(),
            onChange: this.render.bind(this)
        });

        let dataFlux: string = String(this.dom.dataset.flux);
        let data = {};

        try {
            data = JSON.parse(dataFlux);
        } catch(e){
            data = {};
        }

        this.store.setState(data);
    }

    action(action: { [keys: string]: any }){
        Dispatcher.dispatch(action);
    }

    getActions(){
        return {}
    }

    render(): void {
        this.state = this.store.getState();
    };
}
