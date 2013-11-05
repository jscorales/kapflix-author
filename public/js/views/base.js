window BaseView = Backbone.View.extend({
                close : function(){
                        if(this.childViews){
                                this.childViews.close();
                        }
                        this.remove();
                }
        });
