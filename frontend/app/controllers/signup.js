import Ember from "ember";
import CryptoUtils from "../utils/crypto";
import StorageService from "../services/storage-service";

export default Ember.Controller.extend({

    actions :{
         signup(){

            let user_name = document.getElementById('user-name').value;
            let mobile_number = document.getElementById('user-mobile').value;
            let password = document.getElementById('user-pass').value;
            let public_key = null;

             CryptoUtils.generateRSAKeys().then(function (keys) {
                 public_key=keys.publicKey;

                 Ember.$.ajax({

                     url: 'http://localhost:8080/chatApplication_war_exploded/SignupServlet',
                     type: 'POST',
                     contentType: 'application/json',
                     data:  JSON.stringify({
                         user_name: user_name,
                         mobile_number: mobile_number,
                         user_pass: password,
                         rsa_pubkey : public_key,
                     }),
                     xhrFields: { withCredentials: true },
                     success: function(response) {
                         StorageService.storePrivateKey(keys.privateKey,response.user_id).then(function () {
                             console.log("Private key stored successfully!");
                             window.location.href="chat";
                         }).catch(function (error) {
                             console.error("Error storing private key:", error);
                         });
                     },
                     error: function(error) {
                         alert(error.message);
                     }

                 });


             }).catch(function (error) {
                 console.error("Error generating RSA keys:", error);
             });


        }
    }

});