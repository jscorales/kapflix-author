window.VideoView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change"                    : "change",
        "click .screen-size"        : "changeVideoPlayerSize",
        "click .add-hotspot"        : "addHotspot",
        "click .save"               : "beforeSave",
        "click .delete"             : "deleteVideo",
        "drop #picture"             : "dropHandler"
    },

    changeVideoPlayerSize: function (event) {
        event.preventDefault();
        
        var target = event.target;
        var screenSize = $(target).attr("data-screen-size");

        switch (screenSize){
            case "iphone3":
                $(".video-player").height(300).width(480);
                break;
            case "iphone4":
                $(".video-player").height(300).width(568);
                break;
        }
    },

    addHotspot: function(event){
        event.preventDefault();

        utils.ensureDragDropContainmentArea();
        
        var target = event.target;
        var shape = $(target).attr("data-hotspot-shape");
        var hotspotHtml = utils.getHotspotTemplate(shape);

        $(".video-player-container").append(hotspotHtml);
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