document.addEventListener('DOMContentLoaded', function () {
    page.init();
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

        events.forEach(function(event){
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
        var dataTmpl = domNode.querySelectorAll('*[data-tmpl]');
        
        dataTmpl.forEach(function (d) {
            var dataField = d.dataset.tmpl;
            d.innerHTML = data[dataField];
          //  console.log(d);
        })

        var dataTemplate = domNode.querySelectorAll('*[data-template]');

        dataTemplate.forEach(function(node){
            var newNode = this.fillTemplate(data.icon, data.data);

            if (newNode) {
                node.parentNode.replaceChild(newNode, node);
            } else {
                node.parentNode.removeChild(node);
            }
        }.bind(this));

        if (this['template_' + name]) {
            return this['template_' + name](domNode, data);
        }
    },
    
    'template_card-item': function(domNode, data) {
        var icon = domNode.querySelector('.card-item__icon');
       
        domNode.classList.add(
            'card-item_size_' + data.size,
            'card-item_type_' + data.type
            );
        icon.src = 'assets/' + data.icon + '.svg'

        return domNode;
    },

    'template_thermal': function(domNode, data) {
       // console.log(domNode);
        console.log (data, 'data');
        //console.log (data.data.temrature, 'data.data.teerature' )
        var temp = domNode.querySelector('.temperature');
        var humidity = domNode.querySelector('.humidity');
        temp.innerHTML = data.temperature + ' C';
        humidity.innerHTML = data.humidity + ' %';
        return domNode;
    }




}
