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
        if (!events) {
            return;
        }

        events.forEach(this.fillTemplate.bind(this));
    },

    fillTemplate: function (event) {
        var container = document.querySelector('.page-content-container');
        var template = document.getElementById('card-item');
        var content = template.content.cloneNode(true);
        var domNode = content.querySelector('*');
        var data= domNode.querySelectorAll('*[data-tmpl]');
        var icon = domNode.querySelector('.card-item__icon');
        var dataField;
        
        domNode.classList.add(
            'card-item_size_' + event.size,
            'card-item_type_' + event.type
            );
        icon.src = 'assets/' + event.icon + '.svg'
       
        data.forEach(function (d) {
            dataField = d.dataset.tmpl;

            d.innerHTML = event[dataField];
        })
        
        container.appendChild(domNode);
    }


}




// data.forEach(function (v) {
//     var dataField = v.dataset.tmpl;
//     var vData = data[dataField];
//     console.log(vData);
// })


// // elem.querySelector('.card-item__title').innerHTML = '123';   
// // t.content.querySelector('img').src = 'logo.png';




