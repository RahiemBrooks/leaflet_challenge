// Store the API endpoint URL in a variable.
var apiUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const mapboxAccessToken = "pk.eyJ1IjoidGFsbGFudGo5NSIsImEiOiJjbGQwYmlicW0ydnZmM3BrNjhzcGxoMHVqIn0.NFVBr7AMOYS5BC5OwcXerA";

// Perform a GET request to the API URL
d3.json(apiUrl).then(function (responseData) {
  // Log the retrieved data
  console.log(responseData);
  // Once we get a response, send the data.features object to the createMapFeatures function.
  createMapFeatures(responseData.features);
});

// Function to determine marker size based on magnitude
function calculateMarkerSize(magnitude) {
  return magnitude * 2000;
}

// Function to determine marker color based on depth
function chooseMarkerColor(depth) {
    if (depth < 10) return "#FFCDD2"; // Light red
    else if (depth < 30) return "#EF5350"; // Red
    else if (depth < 50) return "#E53935"; // Dark red
    else if (depth < 70) return "#D32F2F"; // Deep red
    else if (depth < 90) return "#C62828"; // Maroon
    else return "#B71C1C"; // Dark maroon
  }
  

function createMapFeatures(earthquakeData) {

  // Define a function to run for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer with the earthquakeData features.
  // Run the onEachFeature function for each piece of data in the array.
  var earthquakesLayer = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    // Point to layer used to alter markers
    pointToLayer: function (feature, latlng) {

      // Determine the style of markers based on properties
      var markerStyle = {
        radius: calculateMarkerSize(feature.properties.mag),
        fillColor: chooseMarkerColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.7,
        color: "black",
        stroke: true,
        weight: 0.5
      };
      return L.circle(latlng, markerStyle);
    }
  });

  // Send the earthquakes layer to the createMap function.
  createMap(earthquakesLayer);
}

function createMap(earthquakesLayer) {

  // Create a grayscale tile layer
  var grayscaleLayer = L.tileLayer(`https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={accessToken}`, {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    style: 'mapbox/light-v11',
    accessToken: mapboxAccessToken
  });

  // Create the map, setting the grayscale layer and earthquakes layer to display on load.
  var myMap = L.map("map", {
    center: [37.26, -119.1],
    zoom: 8,
    layers: [grayscaleLayer, earthquakesLayer]
  });

  // Add legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var legendDiv = L.DomUtil.create("div", "info legend"),
      depthRanges = [-10, 10, 30, 50, 70, 90];

    legendDiv.innerHTML += "<h3 style='text-align: center'>Depth</h3>";

    for (var i = 0; i < depthRanges.length; i++) {
      legendDiv.innerHTML +=
        `<i style="background:${chooseMarkerColor(depthRanges[i] + 1)}"></i> ${depthRanges[i]}${depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + '<br>' : '+'}`;
    }
    return legendDiv;
  };
  legend.addTo(myMap);
}
