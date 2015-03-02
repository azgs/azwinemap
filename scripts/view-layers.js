// Create a global object to store all logic in
var root = this;
root.app == null ? app = root.app = {} : app = root.app;
app.views == null ? app.views = app.views = {} : app.views = app.views;

// Render the basemap
app.views.BaseMapView = Backbone.View.extend({
  initialize: function (options) {
  	active = this.findActiveModel();
  	app.map.addLayer(active.get('layer'));
  },
  render: function () {},
  findActiveModel: function () {
  	if (this.model.get('active')) return this.model;
  }
});

app.views.FarmsView = Backbone.View.extend({
  initialize: function (options) {
    this.active = [];
    this.template = _.template($("#toggle-layers-template").html());
    this.addDataToLayer(this.template);
    this.addToMap();
  },
  render: function () {
  },
  events: {
    "click a": "switchLayers",
    "click button": "toggleLayers",
  },
  addToMap: function () {
    this.model.get("layer").addTo(app.map);
  },
  addDataToLayer: function (template) {
    var model = this.model;
    var layer = model.get("layer");
    var wines = model.get("wines");
    //var crops = model.get('crops');
    //var seasons = model.get('seasons');
    if (model.get("isExtent") && layer) {
      app.map.fitBounds(layer);
      model.set("isExtent", false);
    }
    $(this.el).append(template({
      model: model,
      wines: wines,
      //crops: crops,
      //seasons: seasons,
    }))
  },
  filterJSON: function (layer, watcher) {
    layer.setFilter(function (feature) {
      var wines = feature.properties.type;
      for (key in wines) {
        if (wines[key] == true)
          if (watcher.indexOf(key) !== -1)
            return feature;
      }
    })
  },
  toggleLayers: function (e) {
    var self = this;
    var layer = this.model.get('layer');
    var wines = this.model.get('wines')
 //   var crops = this.model.get('crops');
    var filter = e.currentTarget.id;
    var target = $(e.currentTarget);
    var winesList = []

    for (key in wines) {
      winesList.push(wines[key]['id']);
    }

    var allID = $('#all');
    var cropsID = $("#toggle-crops button");
    //var seasonsID = $('#toggle-seasons button');

    if (filter === "all") {
      self.active = [];
      if (target.hasClass("active")) {
        self.filterJSON(layer, []);
        target.removeClass("active");
      } else {
        self.filterJSON(layer, winesList);
        cropsID.removeClass("active");
      //  seasonsID.removeClass('active');
        target.addClass("active");
      }
    } else {
      if (target.hasClass("active")) {
        var index = self.active.indexOf(filter);
        if (index !== -1) {
          self.active.splice(index, 1);        
        }
        self.filterJSON(layer, self.active);
        target.removeClass("active");
      } else {
        target.addClass("active");
        allID.removeClass("active");
        var index = self.active.indexOf(filter);
        if (index === -1) {
          self.active.push(filter);
        }
        self.filterJSON(layer, self.active);
      }
      
app.mapContentView = new app.views.MapContentView({
  el: $('#map-content').first(),
}).render();

    }
  },
  switchLayers: function (e) {
    var toggle = $(e.currentTarget).attr("id"),
        model = this.collection.get(toggle);
    
    if (model.get("active")) {
      model.set("active", false);
      app.map.removeLayer(model.get("layer"));
    } else {
      model.set("active", true);
      app.map.addLayer(model.get("layer"));
    }
  }
});