
//Default maps with public keys
//Mapbox has various basic examples that can be used
//Created an account on https://www.mapbox.com/
//Will be using the MapBox GLJS lib on other work
var Outdoor_Map = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYnNwYXJrczExIiwiYSI6ImNrZTRsdjEyZTAyamIyc29hM2ZnZG8yMW4ifQ.OjmXCqmeX3aq15wvXRb6Tg");

var Sat_Map = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYnNwYXJrczExIiwiYSI6ImNrZTRsdjEyZTAyamIyc29hM2ZnZG8yMW4ifQ.OjmXCqmeX3aq15wvXRb6Tg");

var Dark_Map = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1IjoiYnNwYXJrczExIiwiYSI6ImNrZTRsdjEyZTAyamIyc29hM2ZnZG8yMW4ifQ.OjmXCqmeX3aq15wvXRb6Tg");

//---------------------------------------------------------------------
//var context = canvas.getContext(contextType);


//---------------------------------------------------------------------------------------

//Mapbox tutorials on their site helped me with restricting panning
//This keeps the user within the map where the data is actually plotted
var bounds = [
  [-90, 181], // Southwest coordinates
  [90, -181] // Northeast coordinates
  ];

//Useful link https://leafletjs.com/examples.html turotials
var map = L.map("MAPOBJ", {
  center: [37.09, -95.71],
  zoom: 5,
  minZoom: 2,
  maxZoom: 14,
  maxBounds: bounds,
  //maxBoundsViscosity: 1.0,
  layers: [Dark_Map, Sat_Map, Outdoor_Map]
  
});

//Adding base layer
Dark_Map.addTo(map);

// layers for two different sets of data, Quakes and Plates.
var Plates = new L.LayerGroup();
var Quakes = new L.LayerGroup();

// base layers
var baseMaps = {
  Satellite: Sat_Map,
  Night: Dark_Map,
  Terrain: Outdoor_Map
};

// overlays 
var overlayMaps = {
  "Tectonic Plates": Plates,
  "Earthquakes": Quakes
};

// control which layers are visible.
L
  .control
  .layers(baseMaps, overlayMaps)
  .addTo(map);

// retrieve earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", function(data) {


  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Color of the earthquake locations
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#4E1A49";
      case magnitude > 4:
        return "#3366A8";
      case magnitude > 3:
        return "#57A962";
      case magnitude > 2:
        return "#E9F545";
      case magnitude > 1:
        return "#F2A727";
      default:
        return "#E5211B";
    }
  }

  // Radius of the earthquake locations
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 3;
  }

  // geoJson data
  //
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

  }).addTo(Quakes);

  Quakes.addTo(map);


  var legend = L.control({
    position: "bottomright"
  });

//Matching the legend of the earthquake to the map plot
//Good tutorial here https://leafletjs.com/examples/choropleth/
  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#E5211B",
      "#F2A727",
      "#E9F545",
      "#57A962",
      "#3366A8",
      "#4E1A49"
    ];


    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend.addTo(map);

  
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
 
      L.geoJson(platedata, {
        color: "royalblue",
        weight: 3
      })
      .addTo(Plates);

     
      Plates.addTo(map);
    });
});
