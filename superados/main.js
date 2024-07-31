// Init BaseMaps
var basemaps = {
    "OpenStreetMaps": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
    "CartoDB_Dark": L.tileLayer(
        "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
            minZoom: 0,
            maxZoom: 16,
            id: "osm.streets"
        }
    ),
    "Google-Map": L.tileLayer(
        "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
        {
            minZoom: 0,
            maxZoom: 16,
            id: "google.street"
        }
    ),
    "Google-Satellite": L.tileLayer(
        "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
            minZoom: 0,
            maxZoom: 16,
            id: "google.satellite"
        }
    ),
    "Google-Hybrid": L.tileLayer(
        "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        {
            minZoom: 0,
            maxZoom: 16,
            id: "google.hybrid"
        }
    )
};

// Map Options
var mapOptions = {
    zoomControl: false,
    attributionControl: false,
    center: [-14.33, -51.92],
    zoom: 10,
    layers: [basemaps.OpenStreetMaps]
};

// Render Main Map
var map = L.map("map", mapOptions);

// Render Zoom Control
L.control.zoom({ position: "topright" }).addTo(map);

// Add Print Control
L.control.browserPrint({ position: 'topright' }).addTo(map);

L.control.scale().addTo(map);

// WMS URL
var wms_url = "http://35.229.120.103:8080/geoserver/ignea/wms";

// Legend dictionary
var legend_dict = {
    "RECONHECIMENTO GEOLÓGICO": "#6633FF",
    "REQUERIMENTO DE PESQUISA": "#FFCCFF",
    "AUTORIZAÇÃO DE PESQUISA": "#FFCC99",
    "DIREITO DE REQUERER A LAVRA": "#FFFF99",
    "REQUERIMENTO DE LAVRA": "#FF9933",
    "CONCESSÃO DE LAVRA": "#FF0000",
    "REQUERIMENTO DE LAVRA GARIMPEIRA": "#FF66FF",
    "LAVRA GARIMPEIRA": "#FF3333",
    "REQUERIMENTO DE LICENCIAMENTO": "#009900",
    "LICENCIAMENTO": "#00CC00",
    "REQUERIMENTO DE REGISTRO DE EXTRAÇÃO": "#FFCC00",
    "REGISTRO DE EXTRAÇÃO": "#FFFF00",
    "MANIFESTO DE MINA": "#0000FF",
    "APTO PARA DISPONIBILIDADE": "#00CCFF",
    "DISPONIBILIDADE": "#FF9900",
    "DADOS NÃO CADASTRADOS": "#9966CC"
};

// Define the getColor function
function getColor(feature) {
    var tipo = feature.properties.fase;
    return legend_dict[tipo] || "#000000"; // default color if not found
}

// Initialize the Processos Ativos Layer outside of the update function
var processosAtivosLayer = L.geoJson(null, {
    style: function(feature) {
        return {
            color: getColor(feature),
            weight: 2,
            opacity: 0.5
        };
    },
    onEachFeature: function(feature, layer) {
        var popupContent = '';
        for (var prop in feature.properties) {
            popupContent += '<b>' + prop + '</b>: ' + feature.properties[prop] + '<br>';
        }
        layer.bindPopup(popupContent);
    }
}).addTo(map);

// Function to update Processos Ativos Layer
function updateProcessosAtivosLayer() {
    var bounds = map.getBounds();
    var bbox = bounds.toBBoxString();

    let url = `http://35.229.120.103:8080/geoserver/ignea/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ignea%3Abrasil&outputFormat=application%2Fjson&BBOX=${bbox}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            processosAtivosLayer.clearLayers().addData(data);
        });
}

// Initial load
updateProcessosAtivosLayer();

// Update when map bounds change
map.on('moveend', updateProcessosAtivosLayer);

var groupedOverlays = {
    // Camadas ANM
    "ANM": {
        "Garimpo": L.tileLayer.wms(wms_url, {
            layers: 'bloqueio',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Proteção Fonte": L.tileLayer.wms(wms_url, {
            layers: 'internacional',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Bloqueios": L.tileLayer.wms(wms_url, {
            layers: 'bloqueio',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Arrendamento": L.tileLayer.wms(wms_url, {
            layers: 'arrendamento',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Área Servidão": L.tileLayer.wms(wms_url, {
            layers: 'area_servidao',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Processos Inativos": L.tileLayer.wms(wms_url, {
            layers: 'brasil_inativos',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Processos Ativos": processosAtivosLayer
    },
    // Camadas Malha
    "Base Cartográfica": {
        "Malha Municipal": L.tileLayer.wms(wms_url, {
            layers: 'br_municipios_2022',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Malha Estadual": L.tileLayer.wms(wms_url, {
            layers: 'br_uf_2022',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Sedes Municipais": L.tileLayer.wms(wms_url, {
            layers: 'sedes_municipais_2023',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Faixa de Fronteira": L.tileLayer.wms(wms_url, {
            layers: 'internacional',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Amazonia Legal": L.tileLayer.wms(wms_url, {
            layers: 'internacional_inativos',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Zona Econômica Exclusiva": L.tileLayer.wms(wms_url, {
            layers: 'zee',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
    },
    // Infraestrutura 
    "Infraestrutura": {
        "Rodovias Estaduais e Federais": L.tileLayer.wms(wms_url, {
            layers: 'rodovias_est_fed_mun_2021',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Rodovias Federais": L.tileLayer.wms(wms_url, {
            layers: 'rodovias_federais_2024',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Aeroportos": L.tileLayer.wms(wms_url, {
            layers: 'aeroportos_2024',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
        "Ferrovias": L.tileLayer.wms(wms_url, {
            layers: 'ferrovias_2024',
            format: 'image/png',
            transparent: true,
            attribution: '© GeoServer'
        }),
    },
};

var options = {
    exclusiveGroups: true,
    groupCheckboxes: true,
    collapsed: false
};

// Add the custom grouped layer control
map.layerControl = L.control.groupedLayers(basemaps, groupedOverlays, options).addTo(map);

// Move the layer control to the sidebar
var oldLayerControl = map.layerControl.getContainer();
var newLayerControl = document.getElementById('layercontrol');
newLayerControl.appendChild(oldLayerControl);
$(".leaflet-control-layers-list").prepend("<strong class='title'>Base Maps</strong><br>");
$(".leaflet-control-layers-separator").after("<br><strong class='title'>Layers</strong>");

// Sidebar
var sidebar = L.control.sidebar({
    autopan: false,
    container: "sidebar",
    position: "left"
}).addTo(map);

// Initialize the draw control and pass it the FeatureGroup of editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    position: 'topright', // Adiciona a posição 'topright' para mover a ferramenta de desenho para o lado direito
    edit: {
        featureGroup: drawnItems
    }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);
});

// Ferramenta de busca 
var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false
})
.on('markgeocode', function(e) {
    var bbox = e.geocode.bbox;
    map.fitBounds(bbox);
})
.addTo(map);

// Função para adicionar controle de upload de arquivos
function addFileLayerControl() {
    var control = L.Control.fileLayerLoad({
        fitBounds: true,
        layerOptions: {
            style: {
                color: 'red',
                opacity: 1.0,
                weight: 2,
                fillColor: 'lightblue',
                fillOpacity: 0.2, // Transparência do preenchimento
                clickable: false
            }
        }
    }).addTo(map);

    control.loader.on('data:loaded', function (e) {
        var layer = e.layer;
        console.log(layer);
    });

    // Vincular o botão de upload de arquivos
    document.getElementById('uploadBtn').addEventListener('click', function () {
        var fileInput = control._initContainer().querySelector('input[type="file"]');
        fileInput.click();
    });
}



// Chamar a função para adicionar o controle de upload de arquivos
addFileLayerControl();
