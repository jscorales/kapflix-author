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
    },

    getVideoPlayerOffset: function(){
        return $(".video-player").offset();
    },

    getHotspotTemplate: function(shape){
        var height = 25;
        var width = 50;
        var videoPlayerOffset = this.getVideoPlayerOffset();
        var top = (($(".video-player").height() / 2) - (height / 2)) + videoPlayerOffset.top;
        var left = (($(".video-player").width() / 2) - (width / 2)) + videoPlayerOffset.left;

        return '<div class="drsElement drsMoveHandle hotspot" style="height:' + height + 'px;width:' + width + 'px;top:' + top + 'px;left:' + left + 'px"></div>';
    }
};