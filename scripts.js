var init = function() {
  /* Map and base layer*/
  map = new OpenLayers.Map("map");
  var mapnik = new OpenLayers.Layer.OSM();
  var fromProjection = new OpenLayers.Projection("EPSG:4326");
  var toProjection = new OpenLayers.Projection("EPSG:900913");
  var position = new OpenLayers.LonLat(-1.05, 49.05).transform(fromProjection, toProjection);
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
  var defaultStyle = new OpenLayers.Style({
    'pointRadius': 10,
    'fillColor': "yellow"
  });


  var styleMap = new OpenLayers.StyleMap({
    'default': defaultStyle
  });

  var point = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(-1.37, 49.38).transform(fromProjection, toProjection));
  var points_layer = new OpenLayers.Layer.Vector("Points Layer", {
      styleMap: styleMap
  });
  map.addLayer(points_layer);
  points_layer.addFeatures([point]);

  map.setCenter(position, zoom);
}
