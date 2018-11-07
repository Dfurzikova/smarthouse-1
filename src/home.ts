interface Event {
    clientX: number;
    clientY: number;
    x: number;
}

export interface Page {
    templates: { 
        [key: string]: Template
    };
    getDataEvents(): Promise<FetchData>;
}

interface Template {
    (domNode: HTMLElement, data: TemplateData): HTMLElement;
}

interface FetchData {
    events: TemplateData[];
}

interface TemplateData {
    [key:string]: 
        string | 
        TemplateData | 
        string[];
    type: string;
    title: string;
    source: string;
    description: string;
    icon: string;
    size: string;
    buttons: string[];
    data: TemplateData;
}

interface PointerEventsDom {
    pointers: { 
        [key: number]: Event
    };
    image: HTMLElement;

    currentImageX: number;
    currentZoom: number;
    startDistance: number;
    currentStartX: number;
    currentPointerX: number;
    currentDistance: number;
    lastZoom: number;
    pointerArr: number[];

    bindEvents(): void;
    getXPoint(): number;
    getDistance(): number;
    bindEvents(): void;

    onPointerDown(event: PointerEvent): void;
    onPointerMove(event: PointerEvent): void;
    onPointerUp(event: PointerEvent): void;
    directionX(image: HTMLElement): void;
    pinchZoom(image: HTMLElement, event: PointerEvent): void;
}

const templates = {
    'card-item'(domNode: HTMLElement, data: TemplateData) {
        let icon = <HTMLImageElement>domNode.querySelector('.card-item__icon');
        let description = domNode.querySelector('.card-item__description');

        domNode.classList.add(
            'card-item_size_' + data.size,
            'card-item_type_' + data.type
        );

        icon.src = 'assets/' + data.icon + '.svg'

        if (!data.description && description) {
            description.remove();
        }

        return domNode;
    },

    thermal(domNode: HTMLElement, data: TemplateData) {

        let temp = <HTMLElement>domNode.querySelector('.temperature');
        let humidity = <HTMLElement>domNode.querySelector('.humidity');

        temp.innerHTML = data.temperature + ' C';
        humidity.innerHTML = data.humidity + ' %';

        return domNode;
    },

    music(domNode: HTMLElement, data: { [key: string]: any }) {
        let albumcover = <HTMLImageElement>domNode.querySelector('.song-info__album-cover');
        let songname = <HTMLElement>domNode.querySelector('.song_name');
        let duration = <HTMLElement>domNode.querySelector('.song-info__song-duration');
        let volume = <HTMLElement>domNode.querySelector('.player__volume-rate');

        albumcover.src = data.albumcover;
        songname.innerHTML = data.artist + '-' + data.track.name;
        duration.innerHTML = data.track.length;
        volume.innerHTML = data.volume + '%';

        return domNode;
    },

    fridge(domNode: HTMLElement, data: TemplateData) {

        let buttons = domNode.querySelectorAll('.card-item-button');

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].innerHTML = data.buttons[i]
        }
        domNode.querySelectorAll('.card-item-button')[0].classList.add('button_active');;

        return domNode;
    },

    cam(domNode: HTMLElement, _data?: TemplateData) {

        domNode.setAttribute('touch-action', 'none');

        return domNode;
    },

    stats(domNode: HTMLElement, _data?: TemplateData) {

        return domNode;
    }
}

export class Page {
    constructor() {
        this.templates = templates;
    };

    getDataEvents() {
        return new Promise((resolve, reject) => {
            fetch('http://localhost:8000/api/events')
                .then((response) => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
                    response.json()
                        .then((data) => {
                            resolve(data);
                            this.getEventType(data.events);
                        });
                })
                .catch((err) => {
                    reject(err);
                    console.log('Fetch Error :-S', err);
                });
        });
    }

    getEventType(events: []) {
        const _this = this;

        if (!events) {
            return;
        }

        events.forEach((event) => {

            let container = <HTMLElement>document.querySelector('.page-content-container');
            let domNode = _this.fillTemplate('card-item', event);

            if (domNode) {
                container.appendChild(domNode);
            }
        });
    }

    fillTemplate(name: string, data: TemplateData) {
        let template = <HTMLTemplateElement>document.getElementById(name);

        if (!template) {
            return;
        }

        let content = <HTMLElement>template.content.cloneNode(true);
        let domNode = <HTMLElement>content.querySelector('*');

        if (!domNode) {
            return
        }

        let dataTmpl = domNode.querySelectorAll('*[data-field]');

        dataTmpl.forEach((d: Element): void => {
            let dataField = d.getAttribute('data-field');

            if (dataField) {
                d.innerHTML = String(data[dataField]);
            }
        });

        let dataTemplate = domNode.querySelectorAll('*[data-template]');

        dataTemplate.forEach((node: Element) => {
            if (!node) {
                return;
            }

            let newNode = this.fillTemplate(data.icon, data.data);

            if (newNode && node.parentNode) {
                node.parentNode.replaceChild(newNode, node);
            } else {
                node.remove();
            }
        });

        return this.templates[name](domNode, data);
    }
};

class PointerEventsDom {
    constructor() {
        this.bindEvents();
    };

    bindEvents() {
        this.image = <HTMLImageElement>document.querySelector('.cam-image');

        this.onPointerMove = this.onPointerMove.bind(this);

        if (!this.image) {
            return;
        }

        this.image.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.image.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.image.addEventListener('pointercancel', this.onPointerUp.bind(this));
    }

    onPointerDown(event: PointerEvent) {
        this.image.addEventListener('pointermove', this.onPointerMove);
        this.pointers = {};

        event.preventDefault();
        this.image.setPointerCapture(event.pointerId);
        

        this.pointerArr = this.pointerArr || [];

        this.pointerArr.push(event.pointerId);
        this.pointerArr = this.pointerArr.slice(-2);
        this.pointers[event.pointerId] = event;

        this.currentImageX = this.currentImageX || 0;
        this.currentZoom = this.currentZoom || 1;
        this.currentStartX = this.getXPoint();

        if (this.pointerArr.length === 2) {

            this.startDistance = this.getDistance();
        }
    }

    onPointerMove(event: PointerEvent) {
        event.preventDefault();

        this.directionX(this.image);

        this.pointers[event.pointerId] = event;

        if (this.pointerArr.length === 2) {

            this.pinchZoom(this.image);
        }
    }

    onPointerUp(event: PointerEvent) {
        event.preventDefault();
        this.image.removeEventListener('pointermove', this.onPointerMove);
        this.currentImageX = this.currentImageX + this.currentPointerX;
        this.startDistance = this.currentDistance;

        delete this.pointers[event.pointerId];

        this.pointerArr = this.pointerArr.filter((id) => {
            return event.pointerId !== id;
        });

        this.currentZoom = this.lastZoom;

        if (this.pointerArr.length) {
            this.currentStartX = this.getXPoint();
        }
    }

    getXPoint() {
        const fingers = this.pointerArr;
        const finger1 = this.pointers[fingers[0]];
        const finger2 = this.pointers[fingers[1]];
        let min;
        let max;
        let diff;
        

        if (!finger2) {
            
            return finger1.x;
        }

        min = Math.min(finger1.x, finger2.x);
        max = Math.max(finger1.x, finger2.x);

        diff = max - min;

        return min + (diff / 2)
    }

    getDistance() {
        let fingers = this.pointerArr;
        let finger1 = this.pointers[fingers[0]];
        let finger2 = this.pointers[fingers[1]];

        return (Math.sqrt(Math.pow((finger1.clientX - finger2.clientX), 2) + Math.pow((finger1.clientY - finger2.clientY), 2)))
    }

    directionX(image: HTMLElement) {
        let directionIndicator = <HTMLElement>document.querySelector('.cam-image_direction-indicator');

        if (!this.currentStartX) {
            return
        }

        this.currentPointerX = this.getXPoint() - this.currentStartX;
        image.style.left = (this.currentImageX + this.currentPointerX) + 'px';
        directionIndicator.style.left = 50 + (-(this.currentImageX + this.currentPointerX) / 10) + '%';
    }

    pinchZoom(image: HTMLElement) {

        let approximationValue = <HTMLElement>document.querySelector('.approximation');
        this.currentDistance = this.getDistance();
        this.lastZoom = this.currentZoom * (this.currentDistance / this.startDistance);

        image.style.transform = 'translate(0, -50%) scale(' + this.lastZoom + ')';

        approximationValue.innerHTML = Math.round(100 * this.lastZoom) + '%';
    }

};

const adaptiveMenu = {
    showMenu: () => {
        let elem = <HTMLElement>document.querySelector('.adaptive-icon-list');
        let menu = <HTMLElement>document.querySelector('.menu');

        if (!elem){
            return
        }

        elem.addEventListener('click', () => {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
    }
}

const page = new Page();

page.getDataEvents().then(() => {
    new PointerEventsDom();
});

adaptiveMenu.showMenu();
