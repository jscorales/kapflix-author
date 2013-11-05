window.HeaderView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template());
        return this;
    },

    selectMenuItem: function (menuItem) {
        $('.nav li').removeClass('active');
        if (menuItem) {
            $('.' + menuItem).addClass('active');
        }
    },

    events: {
        "click #loginButton": "login"
    },

    login:function (event) {
        event.preventDefault(); // Don't let this button submit the form
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
