window.VideoView = Backbone.View.extend({
    self: this,

    initialize: function () {
        //this.model.on("change", this.render, this);
        this.model.hotspots.on("add", this.renderHotspots, this);
        this.model.hotspots.on("remove", this.renderHotspots, this);
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));

        this.renderHotspots();

        return this;
    },

    renderHotspots: function(){
        var hotspots = this.model.hotspots.models;
        var len = hotspots.length;

        $(".hotspot-list").html("");

        for (var i = 0; i < len; i++){
            $(".hotspot-list").append(new VideoHotspotView({model: hotspots[i]}).render().el);
        }

        return this;
    },

    events: {
        "change"                        : "change",
        "click .screen-size"            : "changeVideoPlayerSize",
        "click .add-hotspot"            : "addHotspot",
        "mousedown .hotspot"            : "hotspotSelected",
        "click .hotspot"                : "hotspotSelected",
        "click .hotspot-list-item"      : "selectHotspot",
        "click .hotspot-delete-icon"    : "deleteHotspot",
        "click .save"                   : "beforeSave",
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

    addHotspot: function(event){
        event.preventDefault();

        utils.ensureDragDropContainmentArea();

        var target = event.target;
        var shape = $(target).attr("data-hotspot-shape");
        var hotspotId = "hotspot-" + (this.model.hotspots.length + 1);
        var hotspot = utils.getHotspotTemplate(shape, hotspotId);
        
        $(".video-player-container").append(hotspot.html);

        var hotspots = this.model.hotspots;

        hotspots.add({
            id: hotspotId,
            link: "link",
            top: hotspot.top,
            left: hotspot.left,
            height: hotspot.height,
            width: hotspot.width
        });

        dragresize.select(document.getElementById(hotspotId));

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

        var hotspotElemId = hotspotElem.attr("id");

        //select item in the list
        $(".hotspot-detail").removeClass("active");
        $(".hotspot-detail[data-id='" + hotspotElemId + "'").addClass("active");

        var hotspotProps = utils.getHotspotElemProps(hotspotElem);

        console.log(hotspotProps);
    },

    selectHotspot: function(event){
        event.preventDefault();

        $(".hotspot-list .nav-list li").removeClass("active");

        var hotspotId = $(event.target).parent().addClass("active").attr("data-id");

        dragresize.select(document.getElementById(hotspotId));
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

    beforeSave: function () {
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
                self.render();
                app.navigate('videos/' + model.id, false);
                utils.showAlert('Success!', 'Video saved successfully', 'alert-success');
            },
            error: function () {
                utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
            }
        });
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
    }

});

window.VideoHotspotView = Backbone.View.extend({

    tagName: "li",

    initialize: function () {
        //this.model.on("change", this.render, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});