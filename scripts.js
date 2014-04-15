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
    },{
      rules: [
      new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({
          type: OpenLayers.Filter.Comparison.LESS_THAN,
          property: "type",
          value: 1
        }),
        symbolizer: {
          "pointRadius": 12,
          "fillColor": "yellow"
        }
      }),
      new OpenLayers.Rule({
        elseFilter: true,
        symbolizer: {
          "fillColor": "red",
          "pointRadius": 8.2
        }
      })
      ]
    }),
    "select": new OpenLayers.Style({
    })
  });

  var points = [];
  var coord = [{lon: -1.61, lat: 49.63}, {lon: -1.22, lat: 49.54}, {lon: -1.33, lat: 49.40}, {lon: -1.15, lat: 49.10}]
  for(var i = 0 ; i < coord.length ; i ++) {
    points[i] = new OpenLayers.Feature.Vector(new OpenLayers.Geometry
                                                .Point(coord[i].lon, coord[i].lat).transform(fromProjection, toProjection),
                                                {message: 'hello', type: parseInt(Math.random()*3)});
  }

  var points_layer = new OpenLayers.Layer.Vector("Points Layer", {
      styleMap: styleMap,
      eventListeners: {
        'featureselected':function(evt){
          var feature = evt.feature;
          var popup = new OpenLayers.Popup.FramedCloud("popup",
              OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
              null,
              feature.attributes.message +" <br>" + feature.attributes.location,
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
  points_layer.addFeatures(points);
  map.setCenter(position, zoom);
}
