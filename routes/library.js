var fs = require("fs");
var path = require("path");
var videothumb = require("video-thumb");

var videosDir = "public/videos";
var thumbnailDir = "public/pics";

exports.browse = function(req, res, appDir){
	var videosPath = path.join(appDir, videosDir);

	fs.readdir(videosPath, function(err, files){
		var videos = processFiles(req, res, appDir, files);
		
		res.send(videos);
	});
};

var processFiles = function(req, res, appDir, files){
	var videos = [];

	for (var i = 0; i < files.length; i++){
		var file = files[i];
		//check if files is mp4
		var ext = path.extname(file);
		if (ext !== ".mp4")
			continue;

		var thumbnail = generateThumbnail(file, appDir);

		videos.push({
			name: path.basename(file, '.mp4'),
			fileName: file,
			thumbnail: thumbnail
		});
	}

	return videos;
};

var generateThumbnail = function(file, appDir){
	var videoPath = path.join(appDir, videosDir, file);
	var thumbnailPath = path.join(appDir, thumbnailDir);
	var videoName = path.basename(file, '.mp4');
	var outputThumbnailPath = path.join(thumbnailPath, (videoName + '.jpg'));

	if (!fs.existsSync(outputThumbnailPath)){
		videothumb.extract(videoPath, outputThumbnailPath, '00:00:01', '250x300');
	}

	return path.basename(outputThumbnailPath);
};

