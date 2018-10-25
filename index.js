/// <reference path="index.d.ts" />
document.addEventListener('DOMContentLoaded', function () {
    var page = new Page();
    page.getDataEvents().then(function () {
        new PointerEventsDom();
    });
    adaptiveMenu.showMenu();
});
var templates = {
    'card-item': function (domNode, data) {
        var icon = domNode.querySelector('.card-item__icon');
        var description = domNode.querySelector('.card-item__description');
        domNode.classList.add('card-item_size_' + data.size, 'card-item_type_' + data.type);
        icon.src = 'assets/' + data.icon + '.svg';
        if (!data.description && description) {
            description.remove();
        }
        return domNode;
    },
    thermal: function (domNode, data) {
        var temp = domNode.querySelector('.temperature');
        var humidity = domNode.querySelector('.humidity');
        temp.innerHTML = data.temperature + ' C';
        humidity.innerHTML = data.humidity + ' %';
        return domNode;
    },
    music: function (domNode, data) {
        var albumcover = domNode.querySelector('.song-info__album-cover');
        var songname = domNode.querySelector('.song_name');
        var duration = domNode.querySelector('.song-info__song-duration');
        var volume = domNode.querySelector('.player__volume-rate');
        albumcover.src = data.albumcover;
        songname.innerHTML = data.artist + '-' + data.track.name;
        duration.innerHTML = data.track.length;
        volume.innerHTML = data.volume + '%';
        return domNode;
    },
    fridge: function (domNode, data) {
        var buttons = domNode.querySelectorAll('.card-item-button');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].innerHTML = data.buttons[i];
        }
        domNode.querySelectorAll('.card-item-button')[0].classList.add('button_active');
        ;
        return domNode;
    },
    cam: function (domNode, _data) {
        domNode.setAttribute('touch-action', 'none');
        return domNode;
    },
    stats: function (domNode, _data) {
        return domNode;
    }
};
var Page = /** @class */ (function () {
    function Page() {
        this.templates = templates;
    }
    ;
    Page.prototype.getDataEvents = function () {
        var _this_1 = this;
        return new Promise(function (resolve, reject) {
            fetch('http://localhost:8000/api/events')
                .then(function (response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                response.json()
                    .then(function (data) {
                    resolve(data);
                    _this_1.getEventType(data.events);
                });
            })["catch"](function (err) {
                reject(err);
                console.log('Fetch Error :-S', err);
            });
        });
    };
    Page.prototype.getEventType = function (events) {
        var _this = this;
        if (!events) {
            return;
        }
        events.forEach(function (event) {
            var container = document.querySelector('.page-content-container');
            var domNode = _this.fillTemplate('card-item', event);
            if (domNode) {
                container.appendChild(domNode);
            }
        });
    };
    Page.prototype.fillTemplate = function (name, data) {
        var _this_1 = this;
        var template = document.getElementById(name);
        if (!template) {
            return;
        }
        var content = template.content.cloneNode(true);
        var domNode = content.querySelector('*');
        var dataTmpl = domNode.querySelectorAll('*[data-field]');
        dataTmpl.forEach(function (d) {
            var dataField = d.getAttribute("data-field");
            if (dataField) {
                d.innerHTML = String(data[dataField]);
            }
        });
        var dataTemplate = domNode.querySelectorAll('*[data-template]');
        dataTemplate.forEach(function (node) {
            if (!node) {
                return;
            }
            var newNode = _this_1.fillTemplate(data.icon, data.data);
            if (newNode && node.parentNode) {
                node.parentNode.replaceChild(newNode, node);
            }
            else {
                node.remove();
            }
        });
        return this.templates[name](domNode, data);
    };
    return Page;
}());
;
var PointerEventsDom = /** @class */ (function () {
    function PointerEventsDom() {
        this.bindEvents();
    }
    ;
    PointerEventsDom.prototype.bindEvents = function () {
        var image = document.querySelector('.cam-image');
        if (!image) {
            return;
        }
        image.addEventListener('pointerdown', this.onPointerDown.bind(this, image));
        image.addEventListener('pointerup', this.onPointerUp.bind(this, image));
        image.addEventListener('pointercancel', this.onPointerUp.bind(this, image));
    };
    PointerEventsDom.prototype.onPointerDown = function (image, event) {
        image.addEventListener('pointermove', this.onPointerMove.bind(this, image));
        this.pointers = {};
        event.preventDefault();
        image.setPointerCapture(event.pointerId);
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
    };
    PointerEventsDom.prototype.onPointerMove = function (image, event) {
        event.preventDefault();
        this.directionX(image);
        this.pointers[event.pointerId] = event;
        if (this.pointerArr.length === 2) {
            this.pinchZoom(image);
        }
    };
    PointerEventsDom.prototype.onPointerUp = function (event) {
        event.preventDefault();
        this.currentImageX = this.currentImageX + this.currentPointerX;
        this.startDistance = this.currentDistance;
        delete this.pointers[event.pointerId];
        this.pointerArr = this.pointerArr.filter(function (id) {
            return event.pointerId !== id;
        });
        this.currentZoom = this.lastZoom;
        if (this.pointerArr.length) {
            this.currentStartX = this.getXPoint();
        }
    };
    PointerEventsDom.prototype.getXPoint = function () {
        var fingers = this.pointerArr;
        var finger1 = this.pointers[fingers[0]];
        var finger2 = this.pointers[fingers[1]];
        var min;
        var max;
        var diff;
        if (!finger2) {
            return finger1.x;
        }
        min = Math.min(finger1.x, finger2.x);
        max = Math.max(finger1.x, finger2.x);
        diff = max - min;
        return min + (diff / 2);
    };
    PointerEventsDom.prototype.getDistance = function () {
        var fingers = this.pointerArr;
        var finger1 = this.pointers[fingers[0]];
        var finger2 = this.pointers[fingers[1]];
        return (Math.sqrt(Math.pow((finger1.clientX - finger2.clientX), 2) + Math.pow((finger1.clientY - finger2.clientY), 2)));
    };
    PointerEventsDom.prototype.directionX = function (image) {
        var directionIndicator = document.querySelector('.cam-image_direction-indicator');
        if (!this.currentStartX) {
            return;
        }
        this.currentPointerX = this.getXPoint() - this.currentStartX;
        image.style.left = (this.currentImageX + this.currentPointerX) + 'px';
        directionIndicator.style.left = 50 + (-(this.currentImageX + this.currentPointerX) / 10) + '%';
    };
    PointerEventsDom.prototype.pinchZoom = function (image) {
        var approximationValue = document.querySelector('.approximation');
        this.currentDistance = this.getDistance();
        this.lastZoom = this.currentZoom * (this.currentDistance / this.startDistance);
        image.style.transform = 'translate(0, -50%) scale(' + this.lastZoom + ')';
        approximationValue.innerHTML = Math.round(100 * this.lastZoom) + '%';
    };
    return PointerEventsDom;
}());
;
var adaptiveMenu = {
    showMenu: function () {
        var elem = document.querySelector('.adaptive-icon-list');
        var menu = document.querySelector('.menu');
        elem.addEventListener('click', function () {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
    }
};
