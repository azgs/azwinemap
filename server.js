var express = require("express")
  ,	fs = require("fs")
  , path = require("path")
  ;

var app = express();

var style = path.join(__dirname, "style")
  , script = path.join(__dirname, "scripts")
  , vendor = path.join(__dirname, "vendor")
  , images = path.join(__dirname, "images")
  , home = path.join(__dirname, "index.html")
  ;

app.use("/style", express.static(style));
app.use("/scripts", express.static(script));
app.use("/vendor", express.static(vendor));
app.use("/images", express.static(images));

app.get("/", function (req, res) {
  fs.readFile(home, "utf8", function (err, text) {
    res.send(text);
  })
});

app.get("/images", function (req, res) {
	res.send(req);
});

var server = app.listen(3000, function () {
  console.log("Listening on port %d", server.address().port);
});