// Create a global object to store all logic in
var root = this;
root.app == null ? app = root.app = {} : app = root.app;

app.serviceUrl = "http://winedb.arizonaexperience.org/api/rest/vineyards";

app.intialExtent = L.latLngBounds(
  [37.094259, -115.115688],
  [31.282857, -108.875454]);

app.maxBounds = L.latLngBounds(
  [41.9023, -121.8164],
  [24.6870, -99.668]);

app.mapOptions = {
  maxBounds: app.maxBounds,
};

app.width = window.innerWidth;
if (app.width < 768) { app.mapOptions['zoomControl'] = false; };

// Make a map
app.map = L.map('map', app.mapOptions).fitBounds(app.intialExtent);

if (app.width > 768) {
  app.centerPoint = app.map.getPixelOrigin().x;
  app.offset = app.centerPoint * 0.975;
  app.pan = app.centerPoint - app.offset;
  app.map.panBy([app.pan, 0]);
  $('.icon-bar').addClass('active');
  $('.navbar-toggle').addClass('active');
  $('#content-tab').addClass('active');
}

// Instantiate basemap model/view
app.baseMapView = new app.views.BaseMapView({
  model: new app.models.TileLayer({
    id: 'osm-basemap',
    serviceUrl: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    serviceType: 'WMS',
    active: true,
    detectRetina: true,
  })
}).render();

app.navbarView = new app.views.NavbarView({
  el: $('.navbar').first(),
}).render();

app.contentView = new app.views.ContentView({
  el: $('#content-window').first(),
}).render();

d3.json(app.serviceUrl, function (err, res) {
  if (err) console.log(err);
  if (res) {
    app.farmsView = new app.views.FarmsView({
      el: $('#toggle-layers').first(),
      model: new app.models.GeoJSONLayer({
        id: 'master-layer',
        data: res,
        active: true,
        layerOptions: {
          pointToLayer: function (f, ll) {
            var icon
              , svg
              , tag
              , vineyardType
              , wineryType
              , tasting_roomType;

            
            vineyardType = f.properties.type.vineyard;
            wineryType = f.properties.type.winery;
            tasting_roomType = f.properties.type.tasting_room;
         
             if ((vineyardType && wineryType) || (vineyardType && tasting_roomType) || (tasting_roomType && wineryType)) {
              svg = 'images/color-bottle-composite-icon.svg';
              tag = 'allmarker';
             }
            else {
            if (vineyardType == true) {
              svg = 'images/color-grape-vineyard-icon.svg';
              tag = 'vineyardmarker';
            }
            if (wineryType == true) {
              svg = 'images/color-cask-winery-icon.svg';
              tag = 'winerymarker';
            }
            if (tasting_roomType == true) {
              svg = 'images/color-glass-tasting-room-icon.svg';
              tag = 'tasting_roommarker';
            }
              }
            icon = L.divIcon({
              className: tag,
              html: '<img src=' + svg + '>'
            });
            return L.marker(ll, {icon: icon});
          },
        }
      })
    }).render();

    app.noContentView = new app.views.NoContentView({
      el: $('#get-content').first()
    }).render();

    app.mapContentView = new app.views.MapContentView({
      el: $('#map .leaflet-popup-pane'),
      model: new app.models.MapContentView({
        id: 'contentmodel',
        data: res,
      })
    }).render();

    app.routeView = new app.views.RouteView({
      el: $('#get-directions'),
      model: new app.models.Route({
        farmsData: res,
        lineOptions: {
          style: function (feature) {
            var lineStyle = {
              weight: 3,
              opacity: 1,
              color: "red",
            };
            return lineStyle;
          }
        },
        circleOptions: {
          pointToLayer: function (feature, latlng) {
            markerOptions = {
              radius: 5,
              fillColor: "red",
              color: "orange",
              weight: 3,
              opacity: 1,
              fillOpacity: 1,
            }
          return L.circleMarker(latlng, markerOptions);
          }
        }
      })
    }).render();

    var farmsTypeahead = _.map(res.features, function (f) {
      return {
        name: f.properties.name,
        source: 'Farms',
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      }
    })

    app.typeaheadView = new app.views.TypeaheadView({
      model: new app.models.Typeahead({
        farmsTypeahead: farmsTypeahead,
      })
    }).render();    
  }
});