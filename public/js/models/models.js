window.Hotspot = Backbone.Model.extend({
    defaults: {
        id: null,
        name: "",
        top: 0,
        left: 0,
        height: 0,
        width: 0,
        link: ""
    }
});

window.Hotspots = Backbone.Collection.extend({
    model: Hotspot
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