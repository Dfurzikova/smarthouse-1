document.addEventListener('DOMContentLoaded', function () {
    page.init();
    events.init();
    adaptiveMenu.showMenu();
});

var page = {
    init: function () {
        this.getDataEvents();
    },

    getDataEvents: function () {
        var json;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:8000/api/events', false);
        xhr.send();

        if (xhr.status != 200) {
            console.log(xhr.status + ': ' + xhr.statusText);
        } else {
            json = xhr.responseText;
            
        }

        try {
            json = JSON.parse(json);
        } catch (e) {
            json = {};
            console.error(e.message);
        }

        this.getEventType(json.events);
    },

    getEventType: function (events) {
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
    },

    fillTemplate: function (name, data) {
        var template = document.getElementById(name);

        if (!template) {
            return;
        }

        var content = template.content.cloneNode(true);
        var domNode = content.querySelector('*');
        var dataTmpl = domNode.querySelectorAll('*[data-field]');

        dataTmpl.forEach(function (d) {
            var dataField = d.dataset.field;
            d.innerHTML = data[dataField];
          
        })

        var dataTemplate = domNode.querySelectorAll('*[data-template]');

        dataTemplate.forEach(function (node) {
            var newNode = this.fillTemplate(data.icon, data.data);

            if (newNode) {
                node.parentNode.replaceChild(newNode, node);
            } else {
                node.remove();
            }
        }.bind(this));

        if (this['template_' + name]) {
            return this['template_' + name](domNode, data);
        }
    },

    'template_card-item': function (domNode, data) {
        var icon = domNode.querySelector('.card-item__icon');
        var description = domNode.querySelector('.card-item__description');

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

    'template_thermal': function (domNode, data) {

        var temp = domNode.querySelector('.temperature');
        var humidity = domNode.querySelector('.humidity');

        temp.innerHTML = data.temperature + ' C';
        humidity.innerHTML = data.humidity + ' %';

        return domNode;
    },

    'template_music': function (domNode, data) {
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

    'template_fridge': function (domNode, data) {

        var buttons = domNode.querySelectorAll('.card-item-button');

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].innerHTML = data.buttons[i]
        }
        domNode.querySelectorAll('.card-item-button')[0].classList.add('button_active');;

        return domNode;
    },

    'template_cam': function (domNode, data) {

        domNode.setAttribute('touch-action', 'none');

        return domNode;
    },

    'template_stats': function (domNode, data) {

        return domNode;

    }
};

var events = {
    pointers: {},

    init: function () {
        this.bindEvents();

        var isTouchCapable = 'ontouchstart' in window ||
        window.DocumentTouch && document instanceof window.DocumentTouch ||
        navigator.maxTouchPoints > 0 ||
        window.navigator.msMaxTouchPoints > 0;
        
        if (isTouchCapable) {
            this.bindEvents();
        }
       
    },

    bindEvents: function () {
        var image = document.querySelector('.cam-image');
        image.addEventListener('pointerdown', this.onPointerDown.bind(this, image));
        image.addEventListener('pointermove', this.onPointerMove.bind(this, image));
        image.addEventListener('pointerup', this.onPointerUp.bind(this, image));
        image.addEventListener('pointercancel', this.onPointerUp.bind(this, image));
    },

    onPointerDown: function (image, event) {
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
    },

    onPointerMove: function (image, event) {
        event.preventDefault();

        this.directionX(image);

        this.pointers[event.pointerId] = event;

        if (this.pointerArr.length === 2) {

            this.pinchZoom(image, event);
        }
    },

    onPointerUp: function (image, event) {
        event.preventDefault();
        this.currentImageX = this.currentImageX + this.currentPointerX;
        this.startDistance = this.currentDistance;

        delete this.pointers[event.pointerId];

        this.pointerArr = this.pointerArr.filter(function(id){
            return event.pointerId !== id;
        });

        this.currentZoom = this.lastZoom;

        if (this.pointerArr.length) {
            this.currentStartX = this.getXPoint();
        }
    },

    getXPoint: function() {
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

        return min + (diff / 2)

    },

    getDistance: function () {
        var fingers = this.pointerArr;
        var finger1 = this.pointers[fingers[0]];
        var finger2 = this.pointers[fingers[1]];

        return (Math.sqrt(Math.pow((finger1.clientX - finger2.clientX), 2) + Math.pow((finger1.clientY - finger2.clientY), 2)))
    },

    directionX: function (image) {
        var directionIndicator =  document.querySelector('.cam-image_direction-indicator');

        if (!this.currentStartX) {
            return
        }
        
        this.currentPointerX = this.getXPoint() - this.currentStartX;
        image.style.left = (this.currentImageX + this.currentPointerX) + 'px';
        directionIndicator.style.left = 50 + (-(this.currentImageX + this.currentPointerX) / 10)  + '%';
    },

    pinchZoom: function (image) {
        
        var approximationValue = document.querySelector('.approximation');
        this.currentDistance = this.getDistance();
        this.lastZoom = this.currentZoom * (this.currentDistance / this.startDistance);

        image.style.transform = 'translate(0, -50%) scale(' + this.lastZoom + ')';
        
        approximationValue.innerHTML = Math.round(100 * this.lastZoom) + '%';

        
    }

};

var adaptiveMenu = {
    showMenu: function(){
        var elem  = document.querySelector('.adaptive-icon-list');
        var menu = document.querySelector('.menu');
        
        elem.addEventListener('click', function(){

            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
           
        });

       

    
    }
}


