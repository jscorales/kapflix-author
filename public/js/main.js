var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "home",
        "videos"	        : "list",
        "videos/page/:page"	: "list",
        "videos/add"        : "addVideo",
        "videos/:id"        : "videoDetails",
        "about"             : "about"
    },

    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    home: function (id) {
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#content').html(this.homeView.el);
        this.headerView.selectMenuItem('home-menu');
    },

	list: function(page) {
        var p = page ? parseInt(page, 10) : 1;
        var videoList = new VideoCollection();
        videoList.fetch({success: function(){
            $("#content").html(new VideoListView({model: videoList, page: p}).el);
        }});
        this.headerView.selectMenuItem('home-menu');
    },

    videoDetails: function (id) {
        var video = new Video({_id: id});
        video.fetch({success: function(){
            $("#content").html(new VideoView({model: video}).el);
        }});
        this.headerView.selectMenuItem();
    },

	addVideo: function() {
        var video = new Video();
        $('#content').html(new VideoView({model: video}).el);
        this.headerView.selectMenuItem('add-menu');
	},

    about: function () {
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('#content').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
    }

});

utils.loadTemplate(['HomeView', 'HeaderView', 'VideoView', 'VideoListItemView', 'VideoHotspotView', 'AboutView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});