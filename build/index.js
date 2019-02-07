"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const page = new Page();
    page.getDataEvents().then(() => {
        new PointerEventsDom();
    });
    adaptiveMenu.showMenu();
});
const templates = {
    'card-item'(domNode, data) {
        const icon = domNode.querySelector('.card-item__icon');
        const description = domNode.querySelector('.card-item__description');
        domNode.classList.add('card-item_size_' + data.size, 'card-item_type_' + data.type);
        icon.src = 'assets/' + data.icon + '.svg';
        if (!data.description && description) {
            description.remove();
        }
        return domNode;
    },
    thermal(domNode, data) {
        const temp = domNode.querySelector('.temperature');
        const humidity = domNode.querySelector('.humidity');
        temp.innerHTML = data.temperature + ' C';
        humidity.innerHTML = data.humidity + ' %';
        return domNode;
    },
    music(domNode, data) {
        const albumcover = domNode.querySelector('.song-info__album-cover');
        const songname = domNode.querySelector('.song_name');
        const duration = domNode.querySelector('.song-info__song-duration');
        const volume = domNode.querySelector('.player__volume-rate');
        albumcover.src = data.albumcover;
        songname.innerHTML = data.artist + '-' + data.track.name;
        duration.innerHTML = data.track.length;
        volume.innerHTML = data.volume + '%';
        return domNode;
    },
    fridge(domNode, data) {
        const buttons = domNode.querySelectorAll('.card-item-button');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].innerHTML = data.buttons[i];
        }
        domNode.querySelectorAll('.card-item-button')[0].classList.add('button_active');
        return domNode;
    },
    cam(domNode, _data) {
        domNode.setAttribute('touch-action', 'none');
        return domNode;
    },
    stats(domNode, _data) {
        return domNode;
    }
};
class Page {
    constructor() {
        this.templates = templates;
    }
    ;
    getDataEvents() {
        return new Promise((resolve, reject) => {
            fetch('./events.json')
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
    getEventType(events) {
        const _this = this;
        if (!events) {
            return;
        }
        events.forEach((event) => {
            const container = document.querySelector('.page-content-container');
            const domNode = _this.fillTemplate('card-item', event);
            if (domNode) {
                container.appendChild(domNode);
            }
        });
    }
    fillTemplate(name, data) {
        const template = document.getElementById(name);
        if (!template) {
            return;
        }
        const content = template.content.cloneNode(true);
        const domNode = content.querySelector('*');
        if (!domNode) {
            return;
        }
        const dataTmpl = domNode.querySelectorAll('*[data-field]');
        dataTmpl.forEach((d) => {
            const dataField = d.getAttribute('data-field');
            if (dataField) {
                d.innerHTML = String(data[dataField]);
            }
        });
        const dataTemplate = domNode.querySelectorAll('*[data-template]');
        dataTemplate.forEach((node) => {
            if (!node) {
                return;
            }
            const newNode = this.fillTemplate(data.icon, data.data);
            if (newNode && node.parentNode) {
                node.parentNode.replaceChild(newNode, node);
            }
            else {
                node.remove();
            }
        });
        return this.templates[name](domNode, data);
    }
}
;
class PointerEventsDom {
    constructor() {
        this.bindEvents();
    }
    ;
    bindEvents() {
        this.image = document.querySelector('.cam-image');
        this.onPointerMove = this.onPointerMove.bind(this);
        if (!this.image) {
            return;
        }
        this.image.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.image.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.image.addEventListener('pointercancel', this.onPointerUp.bind(this));
    }
    onPointerDown(event) {
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
    onPointerMove(event) {
        event.preventDefault();
        this.directionX(this.image);
        this.pointers[event.pointerId] = event;
        if (this.pointerArr.length === 2) {
            this.pinchZoom(this.image);
        }
    }
    onPointerUp(event) {
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
        return min + (diff / 2);
    }
    getDistance() {
        const fingers = this.pointerArr;
        const finger1 = this.pointers[fingers[0]];
        const finger2 = this.pointers[fingers[1]];
        return (Math.sqrt(Math.pow((finger1.clientX - finger2.clientX), 2) + Math.pow((finger1.clientY - finger2.clientY), 2)));
    }
    directionX(image) {
        const directionIndicator = document.querySelector('.cam-image_direction-indicator');
        if (!this.currentStartX) {
            return;
        }
        this.currentPointerX = this.getXPoint() - this.currentStartX;
        image.style.left = (this.currentImageX + this.currentPointerX) + 'px';
        directionIndicator.style.left = 50 + (-(this.currentImageX + this.currentPointerX) / 10) + '%';
    }
    pinchZoom(image) {
        const approximationValue = document.querySelector('.approximation');
        this.currentDistance = this.getDistance();
        this.lastZoom = this.currentZoom * (this.currentDistance / this.startDistance);
        image.style.transform = 'translate(0, -50%) scale(' + this.lastZoom + ')';
        approximationValue.innerHTML = Math.round(100 * this.lastZoom) + '%';
    }
}
;
const adaptiveMenu = {
    showMenu: () => {
        const elem = document.querySelector('.adaptive-icon-list');
        const menu = document.querySelector('.menu');
        elem.addEventListener('click', () => {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
    }
};
