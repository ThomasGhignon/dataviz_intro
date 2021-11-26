mapboxgl.accessToken = token;

const map = new mapboxgl.Map({
    container: 'map',
    zoom: 5,
    center: [3, 47],
    style: 'mapbox://styles/mapbox/light-v10'
});

map.addControl(new mapboxgl.NavigationControl());

// filters for classifying earthquakes into five categories based on magnitude
const mag1 = ['<', ['get', 'mag'], 2];
const mag2 = ['all', ['>=', ['get', 'mag'], 2], ['<', ['get', 'mag'], 3]];
const mag3 = ['all', ['>=', ['get', 'mag'], 3], ['<', ['get', 'mag'], 4]];
const mag4 = ['all', ['>=', ['get', 'mag'], 4], ['<', ['get', 'mag'], 5]];
const mag5 = ['>=', ['get', 'mag'], 5];

// colors to use for the categories
const colors = ['#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c'];

map.on('load', () => {
    map.addSource('departement', {
        'type': 'geojson',
        'data': 'https://france-geojson.gregoiredavid.fr/repo/departements.geojson',
    });


    let xhr = new XMLHttpRequest();
    xhr.open("GET", "data/air_data_aurat_2016_2018.csv");
    xhr.responseType = "csv";
    xhr.send();

    xhr.onload = function(){

        if (xhr.status != 200){
            alert("Erreur " + xhr.status + " : " + xhr.statusText);
        }else{
            alert(xhr.response.length + " octets  téléchargés\n" + JSON.stringify(xhr.response));
        }
    };

    xhr.onerror = function(){
        alert("La requête a échoué");
    };

    xhr.onprogress = function(event){
        if (event.lengthComputable){
            alert(event.loaded + " octets reçus sur un total de " + event.total);
        }
    };

    map.addLayer({
        'id': 'departement',
        'type': 'fill',
        'source': 'departement', // reference the data source
        'layout': {},
        'paint': {
            'fill-color': '#0080ff', // blue color fill
            'fill-opacity': 0.5
        }
    });
    map.addLayer({
        'id': 'outline',
        'type': 'line',
        'source': 'departement',
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': 1
        }
    });
});


