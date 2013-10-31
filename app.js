var express = require("express"),
	routes = require("./routes"),
	http = require("http"),
	path = require("path");

var app = express();

app.configure(function(){
	app.use(exporess.favicon());
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});


app.get('/', function(request, response) {
  response.render('index');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});