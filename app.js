mapboxgl.accessToken = token;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [4.5, 45.5],
    zoom: 6
});
let activeDeptId = null;

map.on('load', async () => {
    const csvData = await fetch('data/air_data_aurat_2016_2018.csv').then((response) => response.text());
    let pollutionByDept = {}, lineFields, csvLines = csvData.split("\n").slice(1);
    for (const line of csvLines) {
        lineFields = line.split(';');
        pollutionByDept[lineFields[0]] = parseFloat(lineFields[1]);
    }
    let chartData = [];
    fetch('https://france-geojson.gregoiredavid.fr/repo/departements.geojson').then((response) => response.json()).then((geojsonData) => {
        for (const f of geojsonData.features) {
            f.properties.pollution = pollutionByDept[f.properties.nom];
            if (f.properties.pollution != null){
                chartData.push([f.properties.pollution, f.properties.nom]);
                /*chartData.push(f.properties.pollution);*/
            }

        }
        map.addSource('departements', {
            'type': 'geojson',
            'data': geojsonData,
            'generateId': true
        });

        chartDonut(chartData);

        map.addLayer({
            'id': 'departements-fills',
            'type': 'fill',
            'source': 'departements',
            'layout': {},
            'paint': {
                'fill-color': [
                    'case',
                    ['>', ['get', 'pollution'], 11],
                    '#FA190D',
                    ['>', ['get', 'pollution'], 10],
                    '#DE0B4E',
                    ['>', ['get', 'pollution'], 9],
                    '#F500CA',
                    ['>', ['get', 'pollution'], 8],
                    '#B90BDE',
                    ['>', ['get', 'pollution'], 0],
                    '#900DFA',
                    '#FFF'
                ],
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.5
                ]
            }
        });

        map.addLayer({
            'id': 'departements-borders',
            'type': 'line',
            'source': 'departements',
            'layout': {},
            'paint': {
                'line-color': '#888',
                'line-width': 1
            }
        });

        map.on('mousemove', 'departements-fills', (e) => {
            if (e.features.length > 0) {
                if (activeDeptId !== null) {
                    map.setFeatureState(
                        { source: 'departements', id: activeDeptId },
                        { hover: false }
                    );
                }
                activeDeptId = e.features[0].id;
                map.setFeatureState(
                    { source: 'departements', id: activeDeptId },
                    { hover: true }
                );
            }
        });

        map.on('mouseleave', 'departements-fills', () => {
            if (activeDeptId !== null) {
                map.setFeatureState(
                    { source: 'departements', id: activeDeptId },
                    { hover: false }
                );
            }
            activeDeptId = null;
        });
    })
});


function chartDonut(db){
    console.log(db);
    const ctx = document.getElementById('myChart').getContext('2d');
    var labels = [];
    var values = [];
    var colors = [];
    for (const item of db){
        values.push(item[0]);
        labels.push(item[1]);
        colors.push(getRandomColor());

    }

    console.log(colors, labels, values);
    const data = {
        labels: labels,
        datasets: [{
            label: 'My First Dataset',
            data: values,
            backgroundColor: colors,
            hoverOffset: 4
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
    };

    const myChart = new Chart(ctx, config);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}