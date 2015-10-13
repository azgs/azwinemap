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
  render: function () {
  },
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
    "click span": "getFeatureDetail"
  },
  addToMap: function () {
    this.model.get("layer").addTo(app.map);
  },
  addDataToLayer: function (template) {
    var model = this.model;
    var layer = model.get("layer");
    var wines = model.get("wines");
    if (model.get("isExtent") && layer) {
      app.map.fitBounds(layer);
      model.set("isExtent", false);
    }
    $(this.el).append(template({
      model: model,
      wines: wines
    }))
  },
  filterJSON: function (layer, watcher) {
    layer.setFilter(function (feature) {
      var wines = feature.properties.type;

      // Filter by open now
      if (watcher.indexOf("open") !== -1) {
        var date = new Date();
        var day = date.getDay();
        var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        var open_hours = feature.properties.hours[days[day]];

        if (open_hours.open.match(/^\d\d?:\d\d/g) && open_hours.close.match(/^\d\d?:\d\d/g)) {
          var open_time = new Date();
          open_time.setHours(open_hours.open.split(":")[0]);
          open_time.setMinutes(open_hours.open.split(":")[1].split(" ")[0]);
          open_time.setSeconds(0);
          open_time.setMilliseconds(0);
          if (open_hours.open.match(/pm$/g) && open_time.getHours() < 12)
            open_time.setHours(open_time.getHours() + 12);
          if (open_hours.open.match(/am$/g) && open_time.getHours() == 12)
            open_time.setHours(open_time.getHours() - 12);
          var close_time = new Date();
          close_time.setHours(open_hours.close.split(":")[0]);
          close_time.setMinutes(open_hours.close.split(":")[1].split(" ")[0]);
          close_time.setSeconds(0);
          open_time.setMilliseconds(0);
          if (open_hours.close.match(/pm$/g) && close_time.getHours() < 12)
            close_time.setHours(close_time.getHours() + 12);
          if (open_hours.close.match(/am$/g) && close_time.getHours() == 12)
            close_time.setHours(close_time.getHours() - 12);

          if (date.getTime() >= open_time.getTime() && date.getTime() < close_time.getTime())
            return feature;
        }
      }
      else {
        for (key in wines) {
          if (wines[key] == true)
            if (watcher.indexOf(key) !== -1)
              return feature;
        }
      }
    })
  },
  toggleLayers: function (e) {
    var self = this;
    var layer = this.model.get('layer');
    var wines = this.model.get('wines');
    var filter = e.currentTarget.id;
    var target = $(e.currentTarget);
    var winesList = [];

    for (key in wines) {
      winesList.push(wines[key]['id']);
    }

    var allID = $('#all');
    var cropsID = $("#toggle-crops button");
    var openID = $("#toggle-open button");

    if (filter === "all") {
      self.active = [];
      if (target.hasClass("active")) {
        self.filterJSON(layer, []);
        target.removeClass("active");
      } else {
        self.filterJSON(layer, winesList);
        cropsID.removeClass("active");
        openID.removeClass("active");
        target.addClass("active");
      }
    }
    else if (filter === "open") {
      if (target.hasClass("active")) {
        self.filterJSON(layer, []);
        target.removeClass("active");
      } else {
        target.addClass("active");
        cropsID.removeClass("active");
        allID.removeClass("active");
        self.filterJSON(layer, filter);
      }
    }
    else {
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
        openID.removeClass("active");
        var index = self.active.indexOf(filter);
        if (index === -1) {
          self.active.push(filter);
        }
        self.filterJSON(layer, self.active);
      }

      app.mapContentView = new app.views.MapContentView({
        el: $('#map-content').first()
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
  },
  getFeatureDetail: function (e) {
    app.mapContentView.configureContent(e);
  }
});