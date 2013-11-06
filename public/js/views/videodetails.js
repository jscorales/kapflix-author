window.VideoView = Backbone.View.extend({
    self: this,

    browseType: '', //link or video
    targetLink: null,

    initialize: function () {
        //this.model.on("change", this.render, this);
        this.model.hotspots.on("add", this.renderHotspotList, this);
        this.model.hotspots.on("remove", this.renderHotspotList, this);
        //this.model.hotspots.on("change", this.renderHotspotList, this);
        this.render();
    },

    render: function () {
        var self = this;
        $(this.el).html(this.template(this.model.toJSON()));

        $(".video-player", this.el).videoPlayer();
        var videoPlayerElem = $(".video-player", this.el)[0];
        if (videoPlayerElem){
            videoPlayerElem.addEventListener("loadeddata", function(){
                self.renderVideoProperties();
            });
        }

        var hotspots = this.model.get("hotspots");
        if (hotspots.length > 0){
            this.renderHotspotList();
        }

        this.initDragResize();

        return this;
    },

    //$("#cnvRs").val( parseInt($("#cnvHr").val()*3600000) + parseInt($("#cnvMn").val()*60000) + parseInt($("#cnvSc").val()*1000) );
    
    renderVideoProperties: function(){
        var videoPlayerElem = $(".video-player")[0];

        var videoSrc = videoPlayerElem.currentSrc;
        videoSrc = videoSrc.substr(videoSrc.lastIndexOf('/') + 1);
        $(".video-name").text(videoSrc);
        $(".video-duration").text(utils.formatTime(videoPlayerElem.duration));
        $(".video-resolution").text(videoPlayerElem.videoWidth + "x" + videoPlayerElem.videoHeight);
    },

    renderHotspots: function(){

        var hotspots = this.model.hotspots.models;
        var len = hotspots.length;

        $(".video-player-container .hotspot").remove();

        for (var i = 0; i < len; i++){
            var html = utils.createHotspotHtml($(".video-player-container", this.el), hotspots[i]);
            $(".video-player-container", this.el).append(html);
        }

        utils.ensureDragDropContainmentArea();
    },

    renderHotspotList: function(){
        var hotspots = this.model.hotspots.models;
        var len = hotspots.length;

        $(".hotspot-list").html("");

        for (var i = 0; i < len; i++){
            $(".hotspot-list", this.el).append(new VideoHotspotListView({model: hotspots[i]}).render().el);
        }

        return this;
    },

    events: {
        "change"                        : "change",
        "click .screen-size"            : "changeVideoPlayerSize",
        "mousedown .add-hotspot"        : "addHotspotMouseDown",
        "mouseup .add-hotspot"          : "addHotspotMouseUp",
        "click .add-hotspot"            : "addHotspot",
        "mousedown .hotspot"            : "hotspotSelected",
        "click .hotspot"                : "hotspotSelected",
        "click .hotspot-detail"         : "hotspotDetailSelected",
        "click .hotspot-list-item"      : "selectHotspot",
        "click .hotspot-delete-icon"    : "deleteHotspot",
        "click .browse-cancel-btn"      : "browseDialogCanceled",
        "click .browse-ok-btn"          : "browseDialogCanceled",
        "change .hotspot-link"          : "hotspotLinkChanged",
        "change .hotspot-name"          : "hotspotNameChanged",
        "change .time-picker-input"     : "hotspotTimeChanged",
        "click  .add-video"             : "addVideo",
        "click .btn-load-video"         : "addVideo",
        "click  a.thumbnail"            : "videoSelected",
        "click .link-browse"            : "browseLink",
        "click .btn-save"               : "beforeSave",
        "click .btn-save-template"      : "saveTemplate",
        "click .delete"                 : "deleteVideo",
        "drop #picture"                 : "dropHandler"
    },

    changeVideoPlayerSize: function (event) {
        event.preventDefault();
        
        var target = event.target;
        var screenSize = $(target).attr("data-screen-size");

        switch (screenSize){
            case "iphone3":
                $(".video-player-container").height(320).width(480);
                $(".video-player").height(320).width(480);
                break;
            case "iphone4":
                $(".video-player-container").height(320).width(568);
                $(".video-player").height(320).width(568);
                break;
        }
    },

    addHotspotMouseDown: function(event){
        if ($(event.currentTarget).parents('.navbar').hasClass("disabled"))
            return;

        $("li.divider-vertical").removeClass("active");
        $(event.currentTarget).parent().addClass("active");
    },

    addHotspotMouseUp: function(event){
        $("li.divider-vertical").removeClass("active");
    },

    addHotspot: function(event){
        event.preventDefault();

        if ($(event.currentTarget).parents('.navbar').hasClass("disabled"))
            return;

        utils.ensureDragDropContainmentArea();

        var target = event.currentTarget;
        var shape = $(target).attr("data-hotspot-shape");
        if (shape !== "rectangular"){
            alert($(target).attr("title") + " hotspot is not yet supported.");
            return;
        }

        var hotspotId = "hotspot-" + (this.model.hotspots.length + 1);
        var hotspot = utils.getHotspotTemplate(shape, hotspotId);
        
        $(".video-player-container").append(hotspot.html);

        var hotspots = this.model.hotspots;

        hotspots.add({
            id: hotspotId,
            name: hotspotId,
            link: "",
            top: hotspot.top,
            left: hotspot.left,
            height: hotspot.height,
            width: hotspot.width
        });

        dragresize.select(document.getElementById(hotspotId));

        //this.renderHotspotList();

        //select item in the list
        $(".hotspot-detail").removeClass("active");
        $(".hotspot-detail[data-id='" + hotspotId + "'").addClass("active");
    },

    deleteHotspot: function(event){
        var hotspotId = $(event.currentTarget).attr("data-id");
        var hotspot = this.model.hotspots.get(hotspotId);
        if (hotspot !== undefined)
            this.model.hotspots.remove(hotspot);

        $("#" + hotspotId).remove();

        return false;
    },

    hotspotSelected: function(event){
        var hotspotElem = $(event.target);
        if (!hotspotElem.hasClass("hotspot"))
            hotspotElem = $(hotspotElem.parent());

        var hotspotId = hotspotElem.attr("id");

        var hotspotProps = utils.getHotspotElemProps(hotspotElem);
        var hotspot = this.model.hotspots.get(hotspotId);

        if (hotspot.top != hotspotProps.top &&
            hotspot.left != hotspotProps.left &&
            hotspot.width != hotspotProps.width &&
            hotspot.height != hotspotProps.height){
            hotspot.set("top", hotspotProps.top);
            hotspot.set("left", hotspotProps.left);
            hotspot.set("width", hotspotProps.width);
            hotspot.set("height", hotspotProps.height);

            this.renderHotspotList();
        }

        //select item in the list
        $(".hotspot-detail").removeClass("active");
        $(".hotspot-detail[data-id='" + hotspotId + "'").addClass("active");
    },

    hotspotDetailSelected: function(event){
        var hotspotId = $(event.currentTarget).attr("data-id");

        dragresize.select(document.getElementById(hotspotId));

        $(".hotspot-detail").removeClass("active");
        $(event.currentTarget).addClass("active");
    },

    selectHotspot: function(event){
        event.preventDefault();

        $(".hotspot-list .nav-list li").removeClass("active");

        var hotspotId = $(event.target).parent().addClass("active").attr("data-id");

        dragresize.select(document.getElementById(hotspotId));
    },

    hotspotNameChanged: function(event){
        var link = $(event.currentTarget);
        var hotspotId = link.parents(".hotspot-detail").attr("data-id");

        if (!hotspotId || hotspotId == '')
            return;

        var hotspot = this.model.hotspots.get(hotspotId);
        if (hotspot && hotspot.get("name") != link.val()){
            hotspot.set("name", link.val());
        }
    },

    hotspotLinkChanged: function(event){
        var link = $(event.currentTarget);
        var hotspotId = link.parents(".hotspot-detail").attr("data-id");

        if (!hotspotId || hotspotId == '')
            return;

        var hotspot = this.model.hotspots.get(hotspotId);
        if (hotspot && hotspot.get("link") != link.val()){
            hotspot.set("link", link.val());
        }
    },

    hotspotTimeChanged: function(event){
        var time = $(event.currentTarget);
        var timeNameAttr = time.attr("name");
        var timeType = timeNameAttr.indexOf("start") >= 0 ? "startTime" : (timeNameAttr.indexOf("end") >= 0 ? "endTime" : "");
        
        if (timeType == "")
            return;

        var hotspotId = time.parents(".hotspot-detail").attr("data-id");

        if (!hotspotId || hotspotId == '')
            return;

        var hotspot = this.model.hotspots.get(hotspotId);
        if (hotspot && hotspot.get(timeType) != time.val()){
            hotspot.set(timeType, time.val());
        }
    },

    browseDialogCanceled: function(event){
        $("#browseVideoModal").modal("hide");
    },

    showBrowseVideo: function(){
        var library = new Library();
        library.fetch({success: function(){
            $('.modal-body').html('<ul class="thumbnails"></ul>');
            var videos = library.models;
            for (var i = 0; i < videos.length; i++){
              $('.modal-body .thumbnails').append(new VideoListItemView({model: videos[i]}).render().el);  
            }
            
            $('a.thumbnail').attr('href', '#');
            $('.thumbnail img').height(32).width(32);
            $('#browseVideoModal').modal('show');
        }});
    },

    addVideo: function(event){
        event.preventDefault();

        this.browseType = "video";
        this.targetLink = null;

        this.showBrowseVideo();
    },

    browseLink: function(event){
        event.preventDefault();
        var target = $(event.currentTarget);

        this.browseType = "link";
        this.targetLink = target.parent().find('.hotspot-link');
        
        this.showBrowseVideo();
    },

    videoSelected: function(event){
        $('#browseVideoModal').modal('hide');

        event.preventDefault();

        var target = $(event.currentTarget);

        var videoName = target.find('.video-data .video-name').text();
        var videoFilename = target.find('.video-data .video-filename').text();
        var videoThumbnail = target.find('.video-data .video-thumbnail').text();

        if (this.browseType == "video"){
            var video = new Video({'_id': videoName});
            video.fetch({success: function(){
                app.navigate('/videos/' + videoName, {trigger: true});
            },
            error: function(model, res, options){
                if (res.status == 404){
                    var video = new Video({name: videoName, fileName: videoFilename, thumbnail: videoThumbnail});
                    var videoView = new VideoView({model: video});
                    $("#content").html(videoView.el);
                    videoView.renderHotspots(video);
                }
            }});
        }
        else{
            if (this.targetLink == null)
                return;

            var hotspotId = $(this.targetLink).attr("data-target-id");

            if (!hotspotId || hotspotId == '')
                return;

            var hotspot = this.model.hotspots.get(hotspotId);
            if (hotspot && hotspot.get("link") != videoFilename){
                hotspot.set("link", videoFilename);
                $(this.targetLink).val(videoFilename);
            }
        }

        this.browseType = '';
        this.targetLink = null;
    },

    change: function (event) {
        // Remove any existing alert message
        utils.hideAlert();

        // Apply the change to the model
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);

        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
            utils.removeValidationError(target.id);
        }
    },

    beforeSave: function (event) {
        if ($(event.currentTarget).hasClass('disabled'))
            return false;

        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        this.saveVideo();
        return false;
    },

    saveVideo: function () {
        var self = this;
        console.log('before save');
        this.model.save(null, {
            success: function (model) {
                //self.render();
                //app.navigate('videos/' + model.id, false);
                utils.showAlert('Success!', 'Video saved successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
            }
        });
    },

    saveTemplate: function(event){
        event.preventDefault();
    },

    deleteVideo: function () {
        this.model.destroy({
            success: function () {
                alert('Video deleted successfully');
                window.history.back();
            }
        });
        return false;
    },

    dropHandler: function (event) {
        event.stopPropagation();
        event.preventDefault();
        var e = event.originalEvent;
        e.dataTransfer.dropEffect = 'copy';
        this.pictureFile = e.dataTransfer.files[0];

        // Read the image file from the local file system and display it in the img tag
        var reader = new FileReader();
        reader.onloadend = function () {
            $('#picture').attr('src', reader.result);
        };
        reader.readAsDataURL(this.pictureFile);
    },

    initDragResize: function(){
        window.dragresize = new DragResize('dragresize',
         { minWidth: 10, minHeight: 10, minLeft: 0, minTop: 0, maxLeft: 600, maxTop: 320 });

        window.dragresize.isElement = function(elm)
        {
            if (elm.className && elm.className.indexOf('drsElement') > -1) return true;
        };
        window.dragresize.isHandle = function(elm)
        {
            if (elm.className && elm.className.indexOf('drsMoveHandle') > -1) return true;
        };

        window.dragresize.ondragfocus = function() { };
        window.dragresize.ondragstart = function(isResize) { };
        window.dragresize.ondragmove = function(isResize) { };
        window.dragresize.ondragend = function(isResize) { };
        window.dragresize.ondragblur = function() { 
            $('.hotspot-detail').removeClass('active');
        };

        window.dragresize.apply(document);
    }

});

window.VideoHotspotView = Backbone.View.extend({
    
    initialize: function(){
        var template = _.template('<div class="drsElement drsMoveHandle hotspot" id="<%= id %>" data-link="<%= link %>" style="top:<%= top %>px;left:<%= left %>px;height:<%= height %>px;width:<%= width %>px;"></div>');
        var html = template({
            id: this.model.get("id"),
            link: this.model.get("link"),
            top: this.model.get("top"),
            left: this.model.get("left"),
            height: this.model.get("height"),
            width: this.model.get("width")
        });
        this.setElement(html);
    },

    //render: function(){
    //    $(this.el).html(this.template(this.model.toJSON()));

    //    return this;
    //}
});

window.VideoHotspotListView = Backbone.View.extend({

    tagName: "li",

    initialize: function () {
        //this.model.on("change", this.render, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));

        $(".time-picker", this.el).timepicker();
        return this;
    }
});