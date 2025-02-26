import Ember from 'ember';
import ENV from 'demoapp/config/environment';

export default Ember.Route.extend({
    model() {
        return Ember.$.ajax({
            url: ENV.apiHost+'ChatServlet',
            type: 'GET',
            xhrFields: { withCredentials: true }
        }).fail((error) => {
            alert(error.message);
            this.replaceWith('Logout');
            alert("Unauthorized access! Redirecting to login...");
            Ember.run(() => {
                this.replaceWith('login');
            });
        });
    }
});
