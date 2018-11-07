import { Button } from './Button';
type Action = { [keys: string]: any };

export class VolumeButton extends Button {
    onClick() {
        this.action({
            actionName: 'volume-button-click',
            id: this.state.id
        })
    }
    getActions(){
        return {
            'video-click': (data: Action) => {
                this.store.setState({
                    id: data.id
                });
            }
        }
    }
}