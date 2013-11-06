// utils.loadTemplate(['HomeView', 'HeaderView', 'VideoView', 'VideoListItemView', 'VideoHotspotView', 'AboutView'], function() {
//     app = new AppRouter();
//     Backbone.history.start();
// });

var BaseRouter = Backbone.Router.extend({
      before: function(){},
      after: function(){},
      route : function(route, name, callback){

          if (!_.isRegExp(route)) route = this._routeToRegExp(route);
          if (_.isFunction(name)) {
              callback = name;
              name = '';
          }
          if (!callback) callback = this[name];

          var router = this;

          Backbone.history.route(route, function(fragment) {
              var args = router._extractParameters(route, fragment);

              var next = function(){
                  callback && callback.apply(router, args);
                  router.trigger.apply(router, ['route:' + name].concat(args));
                  router.trigger('route', name, args);
                  Backbone.history.trigger('route', router, name, args);
                  router.after.apply(router, args);
              }
              router.before.apply(router, [args, next]);
          });
          return this;
      }
  });


var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "home",
        "videos"            : "videoDetails",
        "videos/page/:page" : "list",
        "videos/add"        : "addVideo",
        "videos/:id"        : "videoDetails",
        "about"             : "about",
        'login'             : 'showLogin'
    },

    // Routes that need authentication and if user is not authenticated
      // gets redirect to login page
      requresAuth : ['#profile'],

      // Routes that should not be accessible if user is authenticated
      // for example, login, register, forgetpasword ...
      preventAccessWhenAuth : ['#login'],

      before : function(params, next){
          //Checking if user is authenticated or not
          //then check the path if the path requires authentication
          var isAuth = Session.get('authenticated');
          var path = Backbone.history.location.hash;
          var needAuth = _.contains(this.requresAuth, path);
          var cancleAccess = _.contains(this.preventAccessWhenAuth, path);

          if(needAuth && !isAuth){
              //If user gets redirect to login because wanted to access
              // to a route that requires login, save the path in session
              // to redirect the user back to path after successful login
              Session.set('redirectFrom', path);
              Backbone.history.navigate('login', { trigger : true });
          }else if(isAuth && cancleAccess){
              //User is authenticated and tries to go to login, register ...
              // so redirect the user to home page
              Backbone.history.navigate('', { trigger : true });
          }else{
              //No problem, handle the route!!
              return next();
          }
      },

    fetchError : function(error){
          //If during fetching data from server, session expired
          // and server send 401, call getAuth to get the new CSRF
          // and reset the session settings and then redirect the user
          // to login
          if(error.status === 401){
              Session.getAuth(function(){
                  Backbone.history.navigate('login', { trigger : true });
              });
          }
      },

      after : function(){
          //empty
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
        // this.headerView.selectMenuItem('home-menu');
    },

  list: function(page) {
        var p = page ? parseInt(page, 10) : 1;
        var videoList = new VideoCollection();
        videoList.fetch({success: function(){
            $("#content").html(new VideoListView({model: videoList, page: p}).el);
        }});
        this.headerView.selectMenuItem('list-menu');
    },

    videoDetails: function (id) {
        var video = new Video({_id: id});
        video.fetch({success: function(){
            var videoView = new VideoView({model: video});
            $("#content").html(videoView.el);
            videoView.renderHotspots(video);
        }});
        this.headerView.selectMenuItem('add-menu');
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

utils.loadTemplate(['HomeView', 'HeaderView', 'VideoView', 'VideoListItemView', 'VideoHotspotView', 'VideoHotspotListView', 'AboutView'], function() {
    app = new AppRouter();
    app.authenticated = false;
    app.vent = _.extend({}, Backbone.Events);
    Backbone.history.start();
});

