//$(document).ready(readyFn);
//$(window).on("load", readyFn);
var osmSource = new ol.source.OSM();
$(function(){
  //create map
  var map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: osmSource
      })
    ],
    target: "map",
    controls: ol.control.defaults({
      attributionOptions: {
        collapsible: false
      }
    }),
    loadTilesWhileAnimating: true,
    view: new ol.View({
      center: ol.proj.fromLonLat([106.834512, 34.181135]),
      zoom: 4
    })
  });
  // Modify zoom
  $("#zoom-out").get(0).onclick = function(){
    var view = map.getView();
    var zoom = view.getZoom();
    view.setZoom(zoom - 1);
  };
  $("#zoom-in").get(0).onclick = function(){
    var view = map.getView();
    var zoom = view.getZoom();
    view.setZoom(zoom + 1);
  };
  //Remove to another center
  $("#pan-to-hometown").get(0).onclick = function(){
    var view = map.getView();
    view.animate({
      center: ol.proj.fromLonLat([117.41727, 32.941487]),
      duration: 2000,
      zoom: 10
    });
  };
  //Add point
  var redLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [new ol.Feature(
        new ol.geom.Point(ol.proj.fromLonLat([114.327961, 30.545111])))]
    }),
    style: new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: "rgba(255,0,0,0.8)"
        }),
        stroke: new ol.style.Stroke({
          color: "rgb(255,0,0)",
          width: 1
        }),
        radius: 5
      })
    })
  });
  map.addLayer(redLayer);
  //defined a vectorSource
  var vectorSource = new ol.source.Vector({
    url: "https://openlayers.org/en/v4.6.4/examples/data/geojson/countries.geojson",
    format: new ol.format.GeoJSON()
  });
  //Add country box
  var dragBoxLayer = new ol.layer.Vector({
    source: vectorSource
  });
  map.addLayer(dragBoxLayer);
  //Add a normal select interaction to handle click
  var select = new ol.interaction.Select();
  map.addInteraction(select);
  //Add a DragBox interaction used to select features by drawing boxes
  var dragBox = new ol.interaction.DragBox({
    condition: ol.events.condition.platformModifierKeyOnly
  });
  map.addInteraction(dragBox);
  var selectedFeatures = select.getFeatures();
  dragBox.on("boxend", function(){
    // features that intersect the box are added to the collection of selected features
    var extent = dragBox.getGeometry().getExtent();
    vectorSource.forEachFeatureIntersectingExtent(extent, function(feature){
      selectedFeatures.push(feature);
    });
  });
  // clear selection when drawing a new box and when clicking on the map
  dragBox.on("boxstart", function(){
    selectedFeatures.clear();
  });

  //Add tooltip
  $(".ol-zoom-in, .ol-zoom-out").tooltip({
    placement: "right"
  });
  $(".ol-rotate-reset, .ol-attribution button[title]").tooltip({
    placement: "left"
  });
  //modify the bottom-right div of copyright style
  $(".ol-attribution").removeClass("ol-uncollapsible");
  //Add black grid tiles that named by osmSource.getTileGrid()
  var tileDebugLayer = new ol.layer.Tile({
    source: new ol.source.TileDebug({
      projection: "EPSG:3857",
      tileGrid: osmSource.getTileGrid()
    })
  });
  map.addLayer(tileDebugLayer);

});

