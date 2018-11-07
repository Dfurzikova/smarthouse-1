import { Component } from '../framework/MyFlux';

export class Button extends Component {
    constructor(params: { [keys: string]: any }){
        super(params);

        this.onClick = this.onClick.bind(this);

        this.dom.addEventListener('click', this.onClick);
    }

    onClick () {}

    render(): void {
        super.render();
    }
}
