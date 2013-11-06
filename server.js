var express = require('express'),
    path = require('path'),
    http = require('http'),
    video = require('./routes/videos'),
    library = require('./routes/library'),
    uid = require('uid2');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('library_path', '/Users/jcorales/projects/kapflix')
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(express.cookieParser('NOTHING'));
    app.use(express.session());
    app.use(express.static(path.join(__dirname, 'public')));
    // app.use(express.csrf());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(function(req, res, next){
            res.setHeader('X-CSRF-Token', req.session._csrf);
            next();
    });
});

app.get("/", function(req, res){
        //send and csrf token with frist request
        //and assign it to a global csrf variable
        //inside the template
        res.render('index', {
                csrf : req.session._csrf
        });
});

app.get("/session", function(req, res){
        //Check for authentication
        if(req.session.user){
                res.send(200, {
                        auth : true,
                        user : req.session.user
                });
        }else{
                res.send(401, {
                        auth : false,
                        csrf : req.session._csrf
                });
        }
});

app.post("/session/login", function(req, res){
        var email = req.body.email;
        var password = req.body.password;
        return res.send(200, {
                                auth : true,
                                user : user
                        });
        //TODO:

        // for (var i = 0; i < Users.length; i++) {
        //         var user = Users[i];
        //         if(user.email == 'test' && user.password == 'test'){
        //                 req.session.user = user;
        //                 return res.send(200, {
        //                         auth : true,
        //                         user : user
        //                 });
        //         }
        // };
        // return res.send(401);
});

app.del("/session/logout", function(req, res){
        //Sending new csrf to client when user logged out
        //for next user to sign in without refreshing the page
        req.session.user = null;
        req.session._csrf = uid(24);

        res.send(200, {
                csrf : req.session._csrf
        });
});

app.get('/users/:id', Auth, function(req, res){
        //Using the Auth filter for this route
        //to check for authentication before sending data
        var id = req.params.id;

        for (var i = 0; i < Users.length; i++) {
                if(id == Users[i].id){
                        return res.send(Users[i]);
                }
        };
        return res.send(400);
});

/* ------------------------------------------------
        Route Filters
   ------------------------------------------------*/

//Authentication Filter
function Auth (req, res, next) {
        if(req.session.user){
                next();
        }else{
                res.send(401,{
                        flash : 'Plase log in first'
                });
        }
}

app.get('/library/browse', function(req, res){
    library.browse(req, res, __dirname);
});
app.get('/videos', video.findAll);
app.get('/videos/:id', video.findById);
app.post('/videos', video.addVideo);
app.put('/videos/:id', video.updateVideo);
app.delete('/videos/:id', video.deleteVideo);

app.get('/xml/:id', function(req, res){
    res.sendfile('public/xml/question1.xml');
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
