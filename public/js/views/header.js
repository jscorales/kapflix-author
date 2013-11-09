window.HeaderView = Backbone.View.extend({

    initialize: function () {
        //if (!app.authenticated)
            this.render();
    },

    render: function () {
        $(this.el).html(this.template());
        return this;
    },

    selectMenuItem: function (menuItem) {
        $('.nav li').removeClass('active');
        if (menuItem) {
            $('.brand-home' + menuItem).addClass('active');
        }
    },

    events: {
        "click .brand"      : "goHome",
        "click #loginButton": "login",
        "click #signOut" : "signOut",
        "click .dropdown": "selectMenuItem"
    },

    goHome: function(event){
        event.preventDefault();

        window.location.replace('/');
    },

    signOut: function(event){
        event.preventDefault();

        this.$el.find("#loginForm").show();
        this.$el.find("#menu").hide();
        this.$el.find("#resources").hide();
        app.authenticated = false;

        utils.setSessionProperty('isAuthenticated', 'false');

        window.location.replace('#');

    },

    login:function (event) {
        event.preventDefault(); // Don't let this button submit the form
        app.vent.trigger('some_event');
        app.authenticated = true;
        if(app.authenticated){
            this.$el.find("#loginForm").hide();
            this.$el.find("#menu").show();
            this.$el.find("#resources").show();
        }
        else{
            this.$el.find("#loginForm").show();
            this.$el.find("#menu").hide();
            this.$el.find("#resources").hide();
        }

        utils.setSessionProperty('isAuthenticated', 'true');

        window.location.replace('#videos');

        //TODO: Implemet LDAP Authentication later

        // $('.alert-error').hide(); // Hide any errors on a new submit
        // var url = '../api/login';
        // console.log('Loggin in... ');
        // var formValues = {
        //     email: $('#inputEmail').val(),
        //     password: $('#inputPassword').val()
        // };

        // $.ajax({
        //     url:url,
        //     type:'POST',
        //     dataType:"json",
        //     data: formValues,
        //     success:function (data) {
        //         console.log(["Login request details: ", data]);

        //         if(data.error) {  // If there is an error, show the error messages
        //             $('.alert-error').text(data.error.text).show();
        //         }
        //         else { // If not, send them back to the home page
        //             window.location.replace('#');
        //         }
        //     }
        // });
    }

});
//window.app.vent.on('some_event', window.HeaderView.hideLogin);
