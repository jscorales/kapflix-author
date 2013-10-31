var express = require('express'),
    path = require('path'),
    http = require('http'),
    video = require('./routes/videos');

var app = express();

app.configure(function () {
    app.set('port', 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/videos', video.findAll);
app.get('/videos/:id', video.findById);
app.post('/videos', video.addVideo);
app.put('/videos/:id', video.updateVideo);
app.delete('/videos/:id', video.deleteVideo);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
