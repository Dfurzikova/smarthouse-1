document.addEventListener('DOMContentLoaded', function () {
    page.init();
    events.init();
});

var page = {
    init: function () {
        this.getDataEvents();
    },

    getDataEvents: function () {
        var json;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'events.json', false);
        xhr.send();

        if (xhr.status != 200) {
            console.log(xhr.status + ': ' + xhr.statusText);
        } else {
            json = xhr.responseText;
            //console.log(json);
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
            //  console.log(d);
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
    
    init: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        var image = document.querySelector('.cam-image');
        image.addEventListener('pointerdown', this.onPointerDown.bind(this, image));
        image.addEventListener('pointermove', this.onPointerMove.bind(this, image));
        image.addEventListener('pointerup', this.onPointerUp.bind(this, image));
    },

    onPointerDown: function (image, event) {
        event.preventDefault();
        image.setPointerCapture(event.pointerId);
        this.scaling = false;

        this.currentImageX = this.currentImageX || 0;
        this.currentStartX = event.x;
        this.currentStartY = event.y

        this.pointerArr = this.pointerArr || [];

        this.pointerArr.push(event);
        this.pointerArr = this.pointerArr.slice(-2)


        if (this.pointerArr.length === 2) {

            this.startDistance = this.getDistance(this.pointerArr[0], this.pointerArr[1]);
            this.scaling = true;

        } else {

            this.scaling = false

        }
    },

    getDistance: function (finger1, finger2) {
        return (Math.sqrt(Math.pow((finger1.clientX - finger2.clientX), 2) + Math.pow((finger1.clientY - finger2.clientY), 2)))
    },

    onPointerMove: function (image, event) {

        event.preventDefault();
        this.directionX(image);

    },

    directionX: function (image) {

        if (!this.currentStartX) {
            return
        }

        if (this.pointerArr.length === 2) {
            this.pinchZoom(image, event);
            return
        }

        this.currentPointerX = event.x - this.currentStartX;

        image.style.backgroundPosition = (this.currentImageX + this.currentPointerX) + 'px';


    },

    pinchZoom: function (image) {

        this.scale_factor = 1;
        this.curr_scale = 1.0;
        var transformation;

        for (var i = 0; i < this.pointerArr.length; i++) {
            if (event.pointerId === this.pointerArr[i].pointerId) {
                this.pointerArr[i] = event;
                break;
            }
        }

        if (this.scaling) {
            this.currentDistance = this.getDistance(this.pointerArr[0], this.pointerArr[1]);

            if (this.startDistance > 0) {


                if (this.currentDistance > this.startDistance) {
                    
                    this.scale_factor += 0.05;
                    console.log("Zoom увеличение");
                    transformation = "scale(2, 2)";

                    image.style.webkitTransform = transformation;
                    image.style.transform = transformation
                }

                if (this.currentDistance < this.startDistance) {
                    this.scale_factor -= 0.05;
                    //transformation = "scale(" + this.scale_factor + ")";
                    console.log("Zoom уменьшение");

                    transformation = 'scale(' + this.scale_factor + ')';
            
                    image.style.webkitTransform = transformation;
                    image.style.transform = transformation
                }
            }
            this.startDistance = this.currentDistance;
        }
    },

    onPointerUp: function (image, event) {

        event.preventDefault();
        this.currentImageX = this.currentImageX + this.currentPointerX;
        //this.startDistance = this.currentDistance;
        
    }

}

