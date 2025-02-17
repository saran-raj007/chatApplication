import Ember from 'ember';
import CryptoUtils from "../utils/crypto";
import StorageService from "../services/storage-service";
import storageService from "../services/storage-service";
//import {console} from "ember-cli-qunit";



export default Ember.Controller.extend({
    AllMessage : Ember.A(),
    sender_id : '',
    receiver_id : '',
    socket: null,
    selectedUsername: null,
    rsapubkey :null,
    rsaPubown :null,
    AESkey : null,
    Ekey : null,
    own :null,
    groupMembers: Ember.A(),
    grpPubKey: null,
    grpMembersencAESKeys : Ember.A(),
    isGroup: false,
    isAdmin : false,
    ViewGrpMembers :Ember.A(),




    init(){
        this._super(...arguments);

        const self =this;

        Ember.run.scheduleOnce('afterRender', this, function() {
            let curruser = self.get('model.curruser');
            if (curruser) {
                this.set('sender_id', curruser.user_id);
                self.set('rsaPubown',curruser.rsa_public_key);
            }
            let socket = new WebSocket(`ws://localhost:8080/chatApplication_war_exploded/LiveChat/${this.sender_id}`);
            socket.onopen = () => console.log('WebSocket Connected');
            socket.onmessage = (event) => {
                let receivedMessage = JSON.parse(event.data);
                let msg_pack;
                StorageService.getPrivateKey("privateKey").then( function (privateKey){
                    CryptoUtils.decryptMessage(receivedMessage.message, receivedMessage.aes_key_receiver, privateKey, receivedMessage.iv).then(function(message){
                        msg_pack ={
                            sender_id: receivedMessage.sender_id,
                            message :message,
                            sender_name: receivedMessage.sender_name
                        };
                        self.get('AllMessage').pushObject(msg_pack);

                    }).catch(function (error){
                        console.log("error on decryption process",error);

                    });
                }).catch(function (error){
                    console.log("Error on fetch key form indexDB:", error);

                });
            };
            socket.onclose = () => console.log('WebSocket Disconnected');
            socket.onerror = (error) => console.error('WebSocket Error:', error);

            this.set('socket', socket);

        });


    },



    actions : {

        fetchchat(receiver,chat){
            const self =this;
            let datas;
            if(chat=="Private"){

                datas ={
                    userid : receiver.user_id,
                    type : chat,


                };
                self.set('isGroup',false);
                self.set('receiver_id',receiver.user_id);
            }
            else{
                datas ={
                    userid : receiver.group_id,
                    type : chat,

                };
                self.set('isGroup',true);
                self.set('receiver_id',receiver.group_id);

            }
            self.set('selectedUsername',receiver.name);
            self.get('AllMessage').clear();
            self.get('ViewGrpMembers').clear();
            Ember.$.ajax({
                url : 'http://localhost:8080/chatApplication_war_exploded/FetchchatServlet',
                type: 'POST',
                contentType: 'application/json',
                dataType : 'json',
                xhrFields: { withCredentials: true },
                data : JSON.stringify(datas),
                success(response) {
                    self.set('isAdmin',false);
                    Ember.$(".empty-page").css("display", "none");
                    Ember.$(".createGroup").css("display", "none");
                    Ember.$(".ViewGrpMember").css("display","none");
                    Ember.$(".Chat").css("display", "block");
                    StorageService.getPrivateKey("privateKey").then( function (privateKey){
                        if(chat=="Private"){
                            for(let msg of response.messages){
                                let key;
                                if(msg.sender_id!=self.get('sender_id')){
                                    key=msg.aes_key_receiver;
                                }
                                else{
                                    key=msg.aes_key_sender;
                                }
                                let msg_pack;

                                CryptoUtils.decryptMessage(msg.message, key, privateKey, msg.iv).then(function(message){
                                    //et('AllMessage').pushObject(msg_pack);

                                    msg_pack ={
                                        sender_id: msg.sender_id,
                                        message :message,
                                    };

                                    self.get('AllMessage').pushObject(msg_pack);


                                }).catch(function (error){
                                    console.log("error on decryption process",error);

                                });


                            }
                        }
                        else{
                            // write code for group chat decrypt
                            if(response.role=="Admin") self.set('isAdmin',true);
                            for(let msg of response.messages){
                                let msg_pack;

                                CryptoUtils.decryptMessage(msg.message, msg.enc_aes_key, privateKey, msg.iv).then(function(message){
                                    //et('AllMessage').pushObject(msg_pack);

                                    msg_pack ={
                                        sender_id: msg.sender_id,
                                        message :message,
                                        sender_name : msg.sender_name,
                                        timestamp :msg.timestamp,
                                    };

                                    self.get('AllMessage').pushObject(msg_pack);


                                }).catch(function (error){
                                    console.log("error on decryption process",error);

                                });

                            }
                        }


                    }).catch(function (error){
                        console.log("Error on fetch key form indexDB:", error);

                    });

                    //self.set('AllMessage', response.messages);
                    CryptoUtils.generateAESKey().then(function (aesKey) {
                        var receiverPublicKey = response.key;
                        var ownPublicKey =self.get('rsaPubown');
                        self.set('AESkey',aesKey);
                        self.set('rsapubkey',receiverPublicKey);
                        if(chat=="Private") {
                            CryptoUtils.encryptAESKey(aesKey, receiverPublicKey).then(function (encryptedAESKey) {
                                self.set('Ekey', encryptedAESKey);
                            }).catch(function (error) {
                                console.error("Error encrypting AES Key:", error);
                            });
                        }

                        CryptoUtils.encryptAESKey(aesKey, ownPublicKey).then(function (encryptedAESKey) {
                            // console.log("Encrypted AES Key:", encryptedAESKey);
                            self.set('own',encryptedAESKey);
                        }).catch(function (error) {
                            console.error("Error encrypting AES Key:", error);
                        });

                    }).catch(function (error) {
                        console.error("Error generating AES Key:", error);
                    });

                },
                error(err) {
                    console.error("Error sending data:", err);
                }
            });


        },
        sendMessage() {
            let message = document.getElementById('MessageInput').value;
            let self =this;
            document.getElementById("MessageInput").value = "";
            CryptoUtils.importAESKey(self.get('AESkey')).then(function (aesKey) {
                CryptoUtils.encryptMessage(message,aesKey).then(function (encryptedMessage){
                    let receiver = self.get('receiver_id');
                    const mesg ={
                        sender_id : self.get('sender_id'),
                        message :  message,
                    };
                    if (message && receiver && self.get('socket')) {
                        self.get('AllMessage').pushObject(mesg);
                        self.get('socket').send(JSON.stringify({
                            type : "Private",
                            receiver: receiver,
                            ciphertext: encryptedMessage.ciphertext,
                            iv: encryptedMessage.iv,
                            aeskeyReceiver : self.get('Ekey'),
                            aeskeySender : self.get('own'),
                        }));

                        self.set('newMessage', '');
                    }

                }).catch(function (error){
                    console.error("Error on message encryption:", error);


                });
            }).catch(function (error) {
                console.error("Error importing key:", error);
            });


        },

        logout(){

            var self = this;
            document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            Ember.$.ajax({
                url: 'http://localhost:8080/chatApplication_war_exploded/Logout',
                type: 'POST',
                xhrFields: { withCredentials: true },
                success: function() {
                    self.transitionToRoute('login');
                },
                error: function(xhr, status, error) {
                    console.error("Logout failed:", error);
                }
            });
        },

        showGrpCreate(){
            Ember.$(".empty-page").css("display", "none");
            Ember.$(".Chat").css("display", "none");
            Ember.$("ViewMember").css("display","none");
            Ember.$(".createGroup").css("display", "block");

        },
        addUsertoGroup(user_id){
                if(event.target.checked){
                    this.get('groupMembers').pushObject(user_id);
                }
                else{
                    this.get('groupMembers').removeObject(user_id);
                }
               // console.log(this.get('groupMembers'));
        },
        CreateNewGroup(creater_id){
            let self =this;
            let grpName =document.getElementById('grpName').value;
            if(!grpName) return ;
            let grpDetails ={
                name :grpName,
                Admin_id :creater_id,
                grpMembers : self.get('groupMembers'),

            };

            Ember.$.ajax({
                url : 'http://localhost:8080/chatApplication_war_exploded/CreateNewGroup',
                type :'POST',
                data : JSON.stringify(grpDetails),
                xhrFields : {withCredentials : true},
                success : function (response){
                    window.location.href="chat";

                },
                error : function (error){
                    alert("erro on group creation",error);

                }

            });
            console.log("Private key stored successfully!");



        },


        SendMessageOnGroup: function () {
            const self = this;
            let message = document.getElementById('MessageInput').value.trim();
            if (!message) return; // Prevent sending empty messages

            document.getElementById("MessageInput").value = ""; // Clear input field
            let receiver = self.get('receiver_id');
            let sender_id = self.get('sender_id');
            let socket = self.get('socket');
            let AESkey = self.get("AESkey");
            Ember.$.ajax({
                url: 'http://localhost:8080/chatApplication_war_exploded/FetchGroupMembersKey',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                xhrFields: { withCredentials: true },
                data: JSON.stringify({ group_id: receiver })
            }).done(function (response) {
                let encryptionPromises = response.Keys.map(function (key) {
                    return CryptoUtils.encryptAESKey(AESkey, key.rsa_public_key)
                        .then(function (encryptedAESKey) {
                            return {
                                user_id: key.user_id,
                                encryptedAESKey: encryptedAESKey
                            };
                        })
                        .catch(function (error) {
                            console.error("Error encrypting AES key for user:", key.user_id, error);
                            return null;
                        });
                });
                encryptionPromises.push(Promise.resolve({
                    user_id: self.get('sender_id'),
                    encryptedAESKey: self.get('own')
                }));
                Ember.RSVP.all(encryptionPromises).then(function (encryptedKeys) {
                    let validKeys = encryptedKeys.filter(Boolean);
                    CryptoUtils.importAESKey(AESkey)
                        .then(function (aesKeyObj) {
                            return CryptoUtils.encryptMessage(message, aesKeyObj);
                        })
                        .then(function (encryptedMessage) {
                          //  self.get('AllMessage').pushObject({ sender_id: sender_id, message: message });
                            if (socket) {
                                socket.send(JSON.stringify({
                                    type: "Group",
                                    grp_id: receiver,
                                    sender_id: sender_id,
                                    ciphertext: encryptedMessage.ciphertext,
                                    iv: encryptedMessage.iv,
                                    members_aesKey: validKeys,
                                    sender_name : self.get('model.curruser.name'),
                                }));
                            }
                        })
                        .catch(function (error) {
                            console.error("Error encrypting message:", error);
                        });
                });
            }).fail(function (error) {
                console.error("Error fetching group keys:", error);
            });
        },

        ExitGroup : function (member_id){
            const self =this;
            let member_details ={
                member_id :member_id,
                grp_id : self.get('receiver_id')
            };
            Ember.$.ajax({
                url: 'http://localhost:8080/chatApplication_war_exploded/ExitGroupServlet',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                xhrFields: { withCredentials: true },
                data: JSON.stringify(member_details),
                success : function (response){
                    window.location.href="chat";

                },
                error : function (error){
                    console.log(error);
                }

            });
        },
        ViewMembers :function(){
            const self =this;
            Ember.$(".empty-page").css("display", "none");
            Ember.$(".Chat").css("display", "none");
            Ember.$(".createGroup").css("display", "none");
            Ember.$(".ViewGrpMember").css("display","block");


            Ember.$.ajax({
                url: 'http://localhost:8080/chatApplication_war_exploded/FetchGroupMembers',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                xhrFields: { withCredentials: true },
                data: JSON.stringify({grp_id : self.get('receiver_id')}),
                success : function (response){
                    for(let mem of response.grp_members){
                        self.get('ViewGrpMembers').pushObject(mem);
                    }
                },
                error : function (error){
                    console.error(error);

                }

            });


        },
        closeViewMember : function (){
            const self =this;
            self.get('ViewGrpMembers').clear();
            Ember.$(".empty-page").css("display", "none");
            Ember.$(".createGroup").css("display", "none");
            Ember.$(".ViewGrpMember").css("display","none");
            Ember.$(".Chat").css("display", "block");

        },

        makeAdmin : function (member_id){
            const self =this;
            let member_details ={
                member_id :member_id,
                grp_id : self.get('receiver_id'),
            };

            Ember.$.ajax({
                url : 'http://localhost:8080/chatApplication_war_exploded/MakeAdmin',
                type : 'POST',
                contentType: 'application/json',
                dataType: 'json',
                xhrFields: { withCredentials: true },
                data: JSON.stringify(member_details),
                success : function (response){

                },
                error : function (error){

                }
            });

        }

    }


});
