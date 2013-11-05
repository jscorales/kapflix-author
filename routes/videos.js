var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('kapflixdb', server, {safe: true});

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'kapflixdb' database");
        db.collection('videos', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'videos' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    var _id = null;

    try{
        _id = new BSON.ObjectID(id);
    }
    catch(e){

    }

    if (_id == null){
        console.log('Retrieving video by filename: ' + id);
        db.collection('videos', function(err, collection) {
            collection.findOne({'fileName':(id + '.mp4')}, function(err, item) {
                if (item == null)
                    res.send(404);
                else
                    res.send(item);
            });
        });
    }
    else{
        console.log('Retrieving video: ' + id);
        db.collection('videos', function(err, collection) {
            collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
                res.send(item);
            });
        });
    }
};

exports.findByName = function(req, res) {
    var name = req.params.id;
    console.log('Retrieving video: ' + id);
    db.collection('videos', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('videos', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addVideo = function(req, res) {
    var video = req.body;
    console.log('Adding video: ' + JSON.stringify(video));
    db.collection('videos', function(err, collection) {
        collection.insert(video, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.updateVideo = function(req, res) {
    var id = req.params.id;
    var video = req.body;
    delete video._id;
    console.log('Updating video: ' + id);
    console.log(JSON.stringify(video));
    db.collection('videos', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, video, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating video: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(video);
            }
        });
    });
};

exports.deleteVideo = function(req, res) {
    var id = req.params.id;
    console.log('Deleting video: ' + id);
    db.collection('videos', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var videos = [
    {
        name: "question1",
        fileName: "question1.mp4",
        thumbnail: "question1.jpg",
        hotspots: []
    },
    {
        name: "question1-hint",
        fileName: "question1-hint.mp4",
        thumbnail: "question1-hint.jpg",
        hotspots: []
    },
    {
        name: "question1-choice-a",
        fileName: "question1-choice-a.mp4",
        thumbnail: "question1-choice-a.jpg",
        hotspots: []
    },
    {
        name: "question1-choice-b",
        fileName: "question1-choice-b.mp4",
        thumbnail: "question1-choice-b.jpg",
        hotspots: []
    },
    {
        name: "question1-choice-c",
        fileName: "question1-choice-c.mp4",
        thumbnail: "question1-choice-c.jpg",
        hotspots: []
    }];

    db.collection('videos', function(err, collection) {
        collection.insert(videos, {safe:true}, function(err, result) {});
    });

};