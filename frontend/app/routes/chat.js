import Ember from 'ember';

export default Ember.Route.extend({
    model() {
        return Ember.$.ajax({
            url: 'http://localhost:8080/chatApplication_war_exploded/ChatServlet',
            type: 'GET',
            xhrFields: { withCredentials: true }
        }).fail((error) => {
            alert(error.message);
            alert("Unauthorized access! Redirecting to login...");
            Ember.run(() => {
                this.replaceWith('login');
            });
        });
    }
});
