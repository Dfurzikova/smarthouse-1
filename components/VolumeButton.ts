import { Button } from './Button';

type ButtonParams = { [keys: string]: any };

export class VolumeButton extends Button {
    constructor(params:ButtonParams ){
        super(params);

        this.onClick = this.onClick.bind(this);

        this.dom.addEventListener('click', this.onClick);
       
    }

    onClick (e: Event){
        this.action({
            actionName: 'volume-button-click'
        })
    }
    render(): void {
        super.render();
        let elem = <HTMLVideoElement>this.dom
       
        elem.muted = this.state.muted;
        console.log(elem, 'video')
        // this.dom.innerHTML = this.state.text;
        //
        elem.muted = !elem.muted;
    }

    // getActions(){
        // return {
        //     'input-field-change': (data) => {
        //         this.store.setState({
        //             muted: data.text
        //         });
        //     }
        // }
        // super.render();
    // }
}