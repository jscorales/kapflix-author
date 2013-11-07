var mongo = require('mongodb');
var xml_builder = require('xmlbuilder');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var mongoUri = process.env.MONGOLAB_URI ||
                process.env.MONGOHQ_URL ||
                'mongodb://localhost:27017/kapflixdb';

mongo.Db.connect(mongoUri, {native_parser:true}, function(err, db) {
    db.collection('videos', {safe:true}, function(err, collection) {
        if (err) {
            console.log("The 'videos' collection doesn't exist. Creating it with sample data...");
            populateDB(db);
        }

        db.close();
    });
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
        mongo.Db.connect(mongoUri, {safe:true,native_parser:true}, function(err, db) {
            db.collection('videos', {safe:true}, function(err, collection) {
                collection.findOne({'fileName':(id + '.mp4')}, function(err, item) {
                    if (item == null)
                        res.send(404);
                    else
                        res.send(item);
                });
            });
        });
    }
    else{
        mongo.Db.connect(mongoUri, {safe:true,native_parser:true}, function(err, db) {
            console.log('Retrieving video: ' + id);
            db.collection('videos', function(err, collection) {
                collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
                    res.send(item);
                });
            });
        });
    }
};

exports.getVideoXml = function(req,res){
    res.contentType('application/xml');
    var id = req.params.id;
    var _id = null;

    try{
        _id = new BSON.ObjectID(id);
    }
    catch(e){

    }

    if (_id == null){
        console.log('Retrieving video by filename: ' + id);
        mongo.Db.connect(mongoUri, {safe:true,native_parser:true}, function(err, db) {
            db.collection('videos', {safe:true}, function(err, collection) {
                collection.findOne({'fileName':(id + '.mp4')}, function(err, item) {
                    if (item == null)
                        res.send(404);
                    else
                        res.send(createVideoXml(item));
                });
            });
        });
    }
    else{
        mongo.Db.connect(mongoUri, {safe:true,native_parser:true}, function(err, db) {
            console.log('Retrieving video: ' + id);
            db.collection('videos', function(err, collection) {
                collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
                    res.send(createVideoXml(item));
                });
            });
        });
    }
};

var createVideoXml = function(item){

    var builder = require('xmlbuilder');
    var xml = builder.create('kapflix', {'version': '1.0', 'encoding': 'UTF-8'})
          .att("video-filename",item.fileName);

        var hotspots = xml.ele('hotspots');
        if(item.hotspots != null && item.hotspots.length > 0){
            for (var i = 0; i < item.hotspots.length; i++) {

                var hotspotItem = item.hotspots[i];
                var hotspot = hotspots.ele('hotspot',
                    {'id':hotspotItem.id, 'name':hotspotItem.name});
                hotspot.ele('coordinates',{'top':hotspotItem.top, 'left':hotspotItem.left, 'height':hotspotItem.height,'width':hotspotItem.width});
                hotspot.ele('link',{'href':hotspotItem.link});
                hotspot.ele('duration',{'start':hotspotItem.startTime,'end':hotspotItem.endTime});
            }
        }
    var xmlString = xml.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' });
    return xmlString;

    //return xml
};

exports.findByName = function(req, res) {
    var name = req.params.name;
    console.log('Retrieving video: ' + name);
    db.collection('videos', function(err, collection) {
        collection.findOne({'fileName':new BSON.ObjectID(name)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    mongo.Db.connect(mongoUri, {safe:true,native_parser:true}, function(err, db) {
        db.collection('videos', function(err, collection) {
            collection.find().toArray(function(err, items) {
                res.send(items);
            });
        });
    });
};

exports.addVideo = function(req, res) {
    var video = req.body;
    console.log('Adding video: ' + JSON.stringify(video));
    mongo.Db.connect(mongoUri, {safe:true,native_parser:true}, function(err, db) {
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
    });
};

exports.updateVideo = function(req, res) {
    var id = req.params.id;
    var video = req.body;
    delete video._id;
    console.log('Updating video: ' + id);
    console.log(JSON.stringify(video));

    mongo.Db.connect(mongoUri, {safe:true,native_parser:true}, function(err, db) {
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
    });
};

exports.deleteVideo = function(req, res) {
    var id = req.params.id;
    console.log('Deleting video: ' + id);
    mongo.Db.connect(mongoUri, {safe:true,native_parser:true}, function(err, db) {
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
    });
};


/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function(db) {

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
