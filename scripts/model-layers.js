// Create a global object to store all logic in
var root = this;
root.app == null ? app = root.app = {} : app = root.app;
app.models == null ? app.models = app.models = {} : app.models = app.models;

app.models.MapContentView = Backbone.Model.extend({
  defaults: {
    id: 'undefined',
    data: 'undefined',
  }
});

// Base model for how we define a Leaflet layer
app.models.LayerModel = Backbone.Model.extend({
  defaults: {
  	id: 'undefined',
    data: 'undefined',
  	active: false,
  	detectRetina: true,
    isExtent: false,
    layerOptions: 'undefined',
  },
  initialize: function (options) {
    var model = this;
    model.createLayer(options, function (layer) {
      model.set('layer', layer);
    });
  },
  createLayer: function (options) {},
});

// Model for how we define a Leaflet GeoJSON layer
app.models.GeoJSONLayer = app.models.LayerModel.extend({
  createLayer: function (options, callback) {
    var data = this.get('data');
    var layerOptions = this.get('layerOptions');
    var layer = L.filterGeoJson(data, layerOptions);
    this.toggleSupport(data);
    callback(layer);
  },
  toggleSupport: function (data) {
    var self = this;
    var sanityCrop = [];
    self.set('wines', []);

    _.each(data.features, function (layer) {
      // Convert military time to am/pm
      _.map(layer.properties.hours, function(day) {
        var hour = day.open.match(/\d\d?:\d\d/g);
        if (hour) {
          var hours24 = Number(day.open.match(/^\d\d?/g));
          var hours = ((hours24 + 11) % 12) + 1;
          var amPm = hours24 > 11 ? 'pm' : 'am';
          var minutes = day.open.match(/\d\d$/g);
          var newHour = hours + ':' + minutes + " " + amPm;
          day.open = newHour;
        }
        hour = day.close.match(/\d\d?:\d\d/g);
        if (hour) {
          var hours24 = Number(day.close.match(/^\d\d?/g));
          var hours = ((hours24 + 11) % 12) + 1;
          var amPm = hours24 > 11 ? 'pm' : 'am';
          var minutes = day.close.match(/\d\d$/g);
          var newHour = hours + ':' + minutes + " " + amPm;
          day.close = newHour;
        }
        return [day.open, day.close, day.call];
      });
      var wines = layer.properties.type;
      for (key in wines) {
        if (wines[key] == true) {
          if (_.findWhere(self.get('wines'), {id: key}) === undefined)
            self.get('wines').push({"id": key, "display": key.replace(/_/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})});
        }
      }
    })
  },
});

// Model for how we define a Leaflet Tile layer
app.models.TileLayer = app.models.LayerModel.extend({
  createLayer: function (options, callback) {
    var model = this;
  	if (model.get("serviceUrl")) {
  	  var layer = new L.tileLayer(model.get("serviceUrl"), options);
      callback(layer);
  	}
  }
});

// Base model for how we define a collection of layers
app.models.LayerCollection = Backbone.Model.extend({
  model: app.models.LayerModel
});