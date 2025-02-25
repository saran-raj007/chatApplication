import Ember from 'ember';
import ENV from 'demoapp/config/environment';

export default Ember.Controller.extend({
    actions: {
        login() {
            const self =this;
            let user_mbnum = document.getElementById('user-mb').value;
            let user_pass = document.getElementById('user-pass').value;
            if(!user_mbnum || !user_pass){
                alert("Fill all the fields");
                return ;
            }
            $.ajax({
                url: ENV.apiHost+'LoginServlet',
                type: 'POST',
                contentType: 'application/json',
                xhrFields: { withCredentials: true },
                data:  JSON.stringify({
                    user_mbnum: user_mbnum,
                    user_pass: user_pass
                }),
                success: function(response) {
                    window.location.href="chat";
                },
                error: function(error) {
                    alert("Invalid user name or password");
                    console.log(error);
                }
            });
        }
    }
});
