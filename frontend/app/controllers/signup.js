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
                 StorageService.storePrivateKey(keys.privateKey,"privateKey").then(function () {
                     console.log("Private key stored successfully!");
                 }).catch(function (error) {
                     console.error("Error storing private key:", error);
                 });

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
                         window.location.href="chat";
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