document.addEventListener('DOMContentLoaded', function () {
    page.init();
});

var page = {
    init: function () {
        this.getDataEvents();
        this.bindEvents();
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

    'template_fridge': function(domNode, data){
       
        var buttons = domNode.querySelectorAll('.card-item-button');
       
        for (var i = 0; i < buttons.length; i++){
            buttons[i].innerHTML = data.buttons[i]
        }
       domNode.querySelectorAll('.card-item-button')[0].classList.add('button_active');;

        return domNode;
    },

    'template_cam': function(domNode, data){
        console.log(domNode);
        domNode.setAttribute('touch-action', 'none');
       
        return domNode;
    },

    'template_stats': function(domNode, data){
        
        return domNode;

    },

    bindEvents: function(){
        var image = document.querySelector('.cam-image');
        image.addEventListener('pointerdown', this.onPointerDown.bind(this, image));
        image.addEventListener('pointermove', this.onPointerMove.bind(this, image));
    },

    onPointerDown: function(image, e){
        image.setPointerCapture(e.pointerId);
        console.log(e.type);
       
        this.coordinates = {
            startX: e.x,
            startPosition: 0
        }
        
    },
    onPointerMove: function(image, e){
        if (!this.coordinates) {
            return
        }

        var newX = e.x - this.coordinates.startX;

        console.log(this.coordinates.startX, 'откуда начали');
        

        image.style.left = newX + 'px';

        image.style.transition = 'left ease .5s';

        image.addEventListener('pointerup', function(e){
            this.coordinates = null;
            console.log(e.type)

        });
        image.addEventListener('pointercancel', function(e){
            this.coordinates = null;
            console.log(e.type)
            
        });
    }
}

