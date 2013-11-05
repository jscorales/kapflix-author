window.Hotspot = Backbone.Model.extend({
    defaults: {
        id: null,
        name: "",
        top: 0,
        left: 0,
        height: 0,
        width: 0,
        link: "",
        startTime: "00:00:00",
        endTime: "00:00:00"
    }
});

window.Hotspots = Backbone.Collection.extend({
    model: Hotspot
});

window.UserModel = Backbone.Model.extend({

                defaults : {
                        'firstName' : null,
                        'lastName' : null
                },

                getFullName : function(){
                        return this.get('firstName') + ' ' + this.get('lastName');
                },

                urlRoot : '/users'
        });

window.SessionModel = Backbone.Model.extend({

                url : '/session',

                initialize : function(){
                        //Ajax Request Configuration
                        //To Set The CSRF Token To Request Header
                        $.ajaxSetup({
                                headers : {
                                        'X-CSRF-Token' : csrf
                                }
                        });

                        //Check for sessionStorage support
                        if(Storage && sessionStorage){
                                this.supportStorage = true;
                        }
                },

                get : function(key){
                        if(this.supportStorage){
                                var data = sessionStorage.getItem(key);
                                if(data && data[0] === '{'){
                                        return JSON.parse(data);
                                }else{
                                        return data;
                                }
                        }else{
                                return Backbone.Model.prototype.get.call(this, key);
                        }
                },


                set : function(key, value){
                        if(this.supportStorage){
                                sessionStorage.setItem(key, value);
                        }else{
                                Backbone.Model.prototype.set.call(this, key, value);
                        }
                        return this;
                },

                unset : function(key){
                        if(this.supportStorage){
                                sessionStorage.removeItem(key);
                        }else{
                                Backbone.Model.prototype.unset.call(this, key);
                        }
                        return this;
                },

                clear : function(){
                        if(this.supportStorage){
                                sessionStorage.clear();
                        }else{
                                Backbone.Model.prototype.clear(this);
                        }
                },

                login : function(credentials){
                        var that = this;
                        var login = $.ajax({
                                url : this.url + '/login',
                                data : credentials,
                                type : 'POST'
                        });
                        login.done(function(response){
                                that.set('authenticated', true);
                                that.set('user', JSON.stringify(response.user));
                                if(that.get('redirectFrom')){
                                        var path = that.get('redirectFrom');
                                        that.unset('redirectFrom');
                                        Backbone.history.navigate(path, { trigger : true });
                                }else{
                                        Backbone.history.navigate('', { trigger : true });
                                }
                        });
                        login.fail(function(){
                                Backbone.history.navigate('login', { trigger : true });
                        });
                },

                logout : function(callback){
                        var that = this;
                        $.ajax({
                                url : this.url + '/logout',
                                type : 'DELETE'
                        }).done(function(response){
                                //Clear all session data
                                that.clear();
                                //Set the new csrf token to csrf vaiable and
                                //call initialize to update the $.ajaxSetup
                                // with new csrf
                                csrf = response.csrf;
                                that.initialize();
                                callback();
                        });
                },


                getAuth : function(callback){
                        var that = this;
                        var Session = this.fetch();

                        Session.done(function(response){
                                that.set('authenticated', true);
                                that.set('user', JSON.stringify(response.user));
                        });

                        Session.fail(function(response){
                                response = JSON.parse(response.responseText);
                                that.clear();
                                csrf = response.csrf !== csrf ? response.csrf : csrf;
                                that.initialize();
                        });

                        Session.always(callback);
                }
        });


window.Video = Backbone.Model.extend({

    urlRoot: "/videos",

    idAttribute: "_id",

    initialize: function () {
        this.hotspots = nestCollection(this, 'hotspots', new Hotspots(this.get('hotspots')));
        this.validators = {};

        this.validators.name = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter a name"};
        };
    },

    set: function(attributes, options) {
        var ret = Backbone.Model.prototype.set.call(this, attributes, options);
        if (attributes.hotspots)
            this.hotspots = nestCollection(this, 'hotspots', new Hotspots(this.get('hotspots')));
        return ret;
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    defaults: {
        _id: null,
        name: "",
        fileName: "",
        picture: null,
        hotspots: []
    }
});

window.VideoCollection = Backbone.Collection.extend({

    model: Video,

    url: "/videos"

});

function nestCollection(model, attributeName, nestedCollection) {
    for (var i = 0; i < nestedCollection.length; i++) {
      model.attributes[attributeName][i] = nestedCollection.at(i).attributes;
    }

    nestedCollection.bind('add', function (initiative) {
      if (!model.get(attributeName)) {
        model.attributes[attributeName] = [];
      }
      model.get(attributeName).push(initiative.attributes);
    });

    nestedCollection.bind('remove', function (initiative) {
      var updateObj = {};
      updateObj[attributeName] = _.without(model.get(attributeName), initiative.attributes);
      model.set(updateObj);
    });

    return nestedCollection;
}
