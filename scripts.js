var init = function() {
  /* Map and base layer*/
  map = new OpenLayers.Map("map");
  var mapnik = new OpenLayers.Layer.OSM();
  var fromProjection = new OpenLayers.Projection("EPSG:4326");
  var toProjection = new OpenLayers.Projection("EPSG:900913");
  var position = new OpenLayers.LonLat(-1.05, 49.15).transform(fromProjection, toProjection);
  var zoom = 9;
  map.addLayer(mapnik);

  /* Communes boundaries */
  var geojson_layer = new OpenLayers.Layer.Vector("GeoJSON", {
      strategies: [new OpenLayers.Strategy.Fixed()],
      protocol: new OpenLayers.Protocol.HTTP({
          url: "manche.json",
          format: new OpenLayers.Format.GeoJSON()
      }),
      style: {
        fill: false,
        strokeWidth: 0.2
      }
  });
  map.addLayer(geojson_layer);

  /* Points Layer */

  var styleMap = new OpenLayers.StyleMap({
    "default": new OpenLayers.Style({
      "pointRadius": 6,
      "strokeWidth": 1
    },{
      rules: [
      new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({
          type: OpenLayers.Filter.Comparison.BETWEEN,
          lowerBoundary: 0,
          upperBoundary: 10,
          property: "nombre",
        }),
        symbolizer: {
          "fillColor": "yellow"
        }
      }),
      new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({
          type: OpenLayers.Filter.Comparison.BETWEEN,
          lowerBoundary: 11,
          upperBoundary: 100,
          property: "nombre",
        }),
        symbolizer: {
          "fillColor": "orange"
        }
      }),
      new OpenLayers.Rule({
        elseFilter: true,
        symbolizer: {
          "fillColor": "red",
        }
      })
      ]
    }),
    "select": new OpenLayers.Style({
    })
  });

  var points = [];

  var points_layer = new OpenLayers.Layer.Vector("Points Layer", {
      styleMap: styleMap,
      eventListeners: {
        'featureselected':function(evt) {
          var feature = evt.feature;
          var popup = new OpenLayers.Popup.FramedCloud("popup",
              OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
              null,
              feature.attributes.commune +" <br>" + feature.attributes.nombre + ' personne(s)',
              null,
              true,
              null
          );
          popup.autoSize = true;
          popup.maxSize = new OpenLayers.Size(400, 800);
          popup.fixedRelativePosition = true;
          feature.popup = popup;
          map.addPopup(popup);
        },
        'featureunselected': function(evt) {
          var feature = evt.feature;
          map.removePopup(feature.popup);
          feature.popup.destroy();
          feature.popup = null;
        }
      }
  });

  var selector = new OpenLayers.Control.SelectFeature(points_layer, {
    clickout: true,
    autoActivate: true
  });

  map.addControl(selector);
  map.addLayer(points_layer);

  var Dico = {};
  var i = 0;
  Dico = read_ascend("ascendants.csv");
  for(var key in Dico) {
    if(Dico.hasOwnProperty(key)) {
      points[i] = new OpenLayers.Feature.Vector(new OpenLayers.Geometry
                                                .Point(Dico[key][1], Dico[key][2]).transform(fromProjection, toProjection),
                                                {commune: key, nombre: Dico[key][0]});
      i++;
    }
  }
  points_layer.addFeatures(points);
  map.setCenter(position, zoom);
}

//
// process_file
//  allTest: String
//
// Take a text whith multiple lines and words separated by semi-column
// and return a processed Dico.

var process_file = function(allText) {
  console.log('hello');
  var text = allText.split("\n");
  var Dico = {};
  for (var i = 0 ; i < text.length ; i++) {
    var line = text[i].split(";");
    if (Dico[line[1]]) {
      Dico[line[1]][0]++;
    }
    else {
      Dico[line[1]] = [];
      Dico[line[1]][0] = 1;
      Dico[line[1]][1] = line[2];
      Dico[line[1]][2] = line[3];
    }
  }
  return Dico;
}

//
// read_ascend
//  url: String
//
// Read the ascendant.csv file and return a processed Dico from it.

var read_ascend = function(fileURL) {
  /* We assume that the data to read is a csv file (actually ;) of the following format :
    date; commune; longitude; latitude 
    The data is a lines 2D array*/
  var rawFile = new XMLHttpRequest();
  var Dico = {};
  var lines;
  rawFile.open("GET", fileURL, false);
  rawFile.onreadystatechange = function ()
  {
      if(rawFile.readyState === 4)
      {
          if(rawFile.status === 200 || rawFile.status == 0)
          {
            var allText = rawFile.responseText;
            Dico = process_file(allText);
          }
      }
  }
  rawFile.send(null);
  return Dico;
} 
