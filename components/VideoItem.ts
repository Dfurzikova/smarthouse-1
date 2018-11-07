import { Button } from './Button';
type Action = { [keys: string]: any };

export class VideoItem extends Button {
    onClick(){
        this.action({
            actionName: 'video-click',
            data: this.dom,
            id: this.state.id
        })
    }

    render(): void {
        super.render();

        let video = <HTMLVideoElement>this.dom;
        video.muted = this.state.muted;
    }

    getActions(){
        return {
            'volume-button-click': (data: Action) => {
                if (data.id === this.state.id) {
                    this.store.setState({
                        muted: !this.state.muted
                    });
                }
            }
        }

    }
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
