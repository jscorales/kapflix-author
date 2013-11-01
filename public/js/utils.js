window.utils = {

    // Asynchronously load templates located in separate .html files
    loadTemplate: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (window[view]) {
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    window[view].prototype.template = _.template(data);
                }));
            } else {
                alert(view + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    },

    displayValidationErrors: function (messages) {
        for (var key in messages) {
            if (messages.hasOwnProperty(key)) {
                this.addValidationError(key, messages[key]);
            }
        }
        this.showAlert('Warning!', 'Fix validation errors and try again', 'alert-warning');
    },

    addValidationError: function (field, message) {
        var controlGroup = $('#' + field).parent().parent();
        controlGroup.addClass('error');
        $('.help-inline', controlGroup).html(message);
    },

    removeValidationError: function (field) {
        var controlGroup = $('#' + field).parent().parent();
        controlGroup.removeClass('error');
        $('.help-inline', controlGroup).html('');
    },

    showAlert: function(title, text, klass) {
        $('.alert').removeClass("alert-error alert-warning alert-success alert-info");
        $('.alert').addClass(klass);
        $('.alert').html('<strong>' + title + '</strong> ' + text);
        $('.alert').show();
    },

    hideAlert: function() {
        $('.alert').hide();
    },

    ensureDragDropContainmentArea: function(){
        var videoPlayerOffset = this.getVideoPlayerOffset();

        dragresize.minTop = videoPlayerOffset.top;
        dragresize.minLeft = videoPlayerOffset.left;
        dragresize.maxTop = videoPlayerOffset.top + $(".video-player").height();
        dragresize.maxLeft = videoPlayerOffset.left + $(".video-player").width();

        $(".video-annotations").height($(".video-player").height())
                                .width($(".video-player").width())
                                .css("top", videoPlayerOffset.top + "px")
                                .css("left", videoPlayerOffset.left + "px");
    },

    getVideoPlayerOffset: function(){
        return $(".video-player").offset();
    },

    getHotspotTemplate: function(shape, id){
        var result = {};
        var height = 25;
        var width = 50;
        var videoPlayerOffset = this.getVideoPlayerOffset();
        var top = (($(".video-player").height() / 2) - (height / 2)) + videoPlayerOffset.top;
        var left = (($(".video-player").width() / 2) - (width / 2)) + videoPlayerOffset.left;
        var html = '<div class="drsElement drsMoveHandle hotspot" id="' + id + '" data-link="" style="height:' + height + 'px;width:' + width + 'px;top:' + top + 'px;left:' + left + 'px"></div>';

        result["height"] = height;
        result["width"] = width;
        result["top"] = top;
        result["left"] = left;
        result["html"] = html;

        return result;
    },

    getHotspotElemProps: function(hotspotElem){
        var result = {};
        var elemOffset = $(hotspotElem).offset();
        var videoPlayerOffset = $(".video-player").offset();

        result["id"] = $(hotspotElem).attr("id");
        result["top"] = elemOffset.top - videoPlayerOffset.top;
        result["left"] = elemOffset.left - videoPlayerOffset.left;
        result["height"] = $(hotspotElem).height();
        result["width"] = $(hotspotElem).width();
        result["link"] = $(hotspotElem).attr("data-link");

        return result;
    },

    setHotspotElemProps: function(hotspotElem, hotspotProp){
        var videoPlayerOffset = $(".video-player").offset();
        var height = hotspotProp.height;
        var width = hotspotProp.width;
        var left = hotspotProp.left + videoPlayerOffset.left;
        var top = hotspotProp.top + videoPlayerOffset.top;
        var link = hotspotProp.link;
        var id = hotspotProp.id;

        $(hotspotElem).height(height).width(width).css("left", left + "px").css("top", top + "px").attr("data-id", id).attr("data-link", link);
    }
};