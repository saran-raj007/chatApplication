import Ember from 'ember';
import CryptoUtils from "../utils/crypto";
import StorageService from "../services/storage-service";

import ENV from 'demoapp/config/environment';





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
    grpMembersencAESKeys : Ember.A(),
    isGroup: false,
    isAdmin : false,
    ViewGrpMembers :Ember.A(),
    showStickerPicker: false,
    forkNewMembers :Ember.A(),
    forkOldMembers :Ember.A(),
    forkID : null,
    tempfork :Ember.A(),
    forkedmsg :  null,
    secretKey :null,
    newForkMemberMessages : Ember.A(),
    forkKeys :Ember.A(),
    newMembersForFork :Ember.A(),
    currentStatus : null,
    messageForwardMode : null,
    forwardMessagearray : Ember.A(),
    countOfforwardMessage : 0,
    stickers: [
        { url: "/Stickers/dumbbell.png" },
        { url: "/Stickers/laptop.png" },
        { url: "/Stickers/listening.png" },
        { url: "/Stickers/tea-time.png" }
    ],





    init(){
        this._super(...arguments);

        const self =this;

        Ember.run.scheduleOnce('afterRender', this, function() {
            let curruser = self.get('model.curruser');
            if (curruser) {
                self.set('sender_id', curruser.user_id);
                self.set('rsaPubown',curruser.rsa_public_key);
            }
            let socket = new WebSocket(`wss://localhost:8443/chatApplication_war_exploded/LiveChat/${this.sender_id}`);
            socket.onopen = () => console.log('WebSocket Connected');
            socket.onmessage = (event) => {
                let receivedMessage = JSON.parse(event.data);
                let msg_pack;
                if(receivedMessage.dataFormat==="delete_message"){
                    self.set('AllMessage', self.get('AllMessage').filter(msg => msg.mess_id !== receivedMessage.msg_id));
                }
                else if(receivedMessage.dataFormat==="status_update"){
                    let user = self.get('model.users').findBy('user_id', receivedMessage.user_id);
                    if (user) {
                        Ember.set(user, 'status', receivedMessage.status);
                    }
                }
                else if(receivedMessage.dataFormat==="Text") {
                    StorageService.getPrivateKey(self.get('sender_id')).then(function (privateKey) {
                        CryptoUtils.decryptMessage(receivedMessage.message, receivedMessage.aes_key_receiver, privateKey, receivedMessage.iv).then(function (message) {
                            msg_pack = {
                                sender_id: receivedMessage.sender_id,
                                message: message,
                                sender_name: receivedMessage.sender_name,
                                dataFormat : 'Text',
                            };
                            self.get('AllMessage').pushObject(msg_pack);

                        }).catch(function (error) {
                            console.log("error on decryption process", error);

                        });
                    }).catch(function (error) {
                        console.log("Error on fetch key form indexDB:", error);

                    });
                }
                else{
                    let imageUrl = `https://localhost:8443/chatApplication_war_exploded/RetriveFile?file_name=${encodeURIComponent(receivedMessage.file_name)}`;
                    msg_pack = {
                        sender_id: receivedMessage.sender_id,
                        file_name: imageUrl,
                        sender_name: receivedMessage.sender_name,
                        dataFormat : 'Sticker',
                    };

                    self.get('AllMessage').pushObject(msg_pack);
                }
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
            if(chat==="Private"){

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
            self.set('currentStatus', (receiver.status==="online") ? receiver.status : receiver.last_seen);
            self.set('selectedUsername',receiver.name);
            self.get('AllMessage').clear();
            self.get('ViewGrpMembers').clear();
            self.get('forwardMessagearray').clear();
            self.set('countOfforwardMessage',0);
            self.set('messageForwardMode',false);
            Ember.$.ajax({
                url : ENV.apiHost+'FetchchatServlet',
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
                    StorageService.getPrivateKey(self.get('sender_id')).then( function (privateKey){
                        if(chat==="Private"){
                            var promises = [];
                            for (let msg of response.messages) {
                                if (msg.dataFormat === "Text") {
                                    let key = (msg.sender_id !== self.get('sender_id')) ? msg.aes_key_receiver : msg.aes_key_sender;

                                    let promise = new Ember.RSVP.Promise(function (resolve, reject) {
                                        CryptoUtils.decryptMessage(msg.message, key, privateKey, msg.iv).then(function (message) {
                                            let msg_pack = {
                                                sender_id: msg.sender_id,
                                                receiver_id : msg.receiver_id,
                                                mess_id :msg.mess_id,
                                                message: message,
                                                dataFormat: "Text",
                                                timestamp : msg.timestamp
                                            };
                                            resolve(msg_pack);
                                        }).catch(function (error) {
                                            console.log("Error in decryption:", error);
                                            reject(error);
                                        });
                                    });
                                    promises.push(promise);
                                } else {
                                    let imageUrl = `https://localhost:8443/chatApplication_war_exploded/RetriveFile?file_name=${encodeURIComponent(msg.file_name)}`;

                                    let stickerPromise = Ember.RSVP.resolve({
                                        mess_id :msg.mess_id,
                                        sender_id: msg.sender_id,
                                        file_name: imageUrl,
                                        receiver_id : msg.receiver_id,
                                        dataFormat: "Sticker",
                                        timestamp: msg.timestamp
                                    });

                                    promises.push(stickerPromise);
                                }
                                console.log(self.get('AllMessage'));
                            }
                            Ember.RSVP.allSettled(promises).then(function (results) {
                                let sortedMessages = results
                                    .filter(result => result.value)
                                    .map(result => result.value)
                                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                                sortedMessages.forEach(function (msg_pack) {
                                    self.get('AllMessage').pushObject(msg_pack);
                                });
                                console.log(self.get('AllMessage').toArray());
                            }).catch(function (error) {
                                console.log("Error in processing messages:", error);
                            });
                            console.log(self.get('AllMessage'));

                        }
                        else{
                            // write code for group chat decrypt
                            var promises = [];
                            self.set('isAdmin',response.isAdmin);
                            console.log(response.messages);
                            for(let msg of response.messages){
                                let msg_pack;
                                if(msg.dataFormat==="Text"){
                                    let promise = new Ember.RSVP.Promise(function (resolve, reject) {
                                        CryptoUtils.decryptMessage(msg.message, msg.enc_aes_key,privateKey, msg.iv).then(function (message) {
                                            msg_pack ={
                                                mess_id :msg.mess_id,
                                                sender_id: msg.sender_id,
                                                message :message,
                                                receiver_id : msg.grp_id,
                                                sender_name : msg.sender_name,
                                                timestamp :msg.timestamp,
                                                dataFormat : "Text",
                                            };
                                            resolve(msg_pack);
                                        }).catch(function (error) {
                                            console.log("Error in decryption:", error);
                                            reject(error);
                                        });
                                    });
                                    promises.push(promise);
                                }
                                else{
                                    let imageUrl = `https://localhost:8443/chatApplication_war_exploded/RetriveFile?file_name=${encodeURIComponent(msg.file_name)}`;

                                    let stickerPromise = Ember.RSVP.resolve({
                                        mess_id :msg.mess_id,
                                        sender_id: msg.sender_id,
                                        receiver_id : msg.receiver_id,
                                        file_name: imageUrl,
                                        dataFormat: "Sticker",
                                        sender_name : msg.sender_name,
                                        timestamp: msg.timestamp,

                                    });
                                    promises.push(stickerPromise);
                                }
                            }
                            Ember.RSVP.allSettled(promises).then(function (results) {
                                let sortedMessages = results
                                    .filter(result => result.value)
                                    .map(result => result.value)
                                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                                sortedMessages.forEach(function (msg_pack) {
                                    self.get('AllMessage').pushObject(msg_pack);
                                });
                                console.log(self.get('AllMessage').toArray());
                            }).catch(function (error) {
                                console.log("Error in processing messages:", error);
                            });
                        }

                    }).catch(function (error){
                        console.log("Error on fetch key form indexDB:", error);

                    });
                    CryptoUtils.generateAESKey().then(function (aesKey) {
                        var receiverPublicKey = response.key;
                        var ownPublicKey =self.get('rsaPubown');
                        self.set('AESkey',aesKey);
                        self.set('rsapubkey',receiverPublicKey);
                        if(chat==="Private") {
                            CryptoUtils.encryptAESKey(aesKey, receiverPublicKey).then(function (encryptedAESKey) {
                                self.set('Ekey', encryptedAESKey);
                            }).catch(function (error) {
                                console.error("Error encrypting AES Key:", error);
                            });
                        }
                        CryptoUtils.encryptAESKey(aesKey, ownPublicKey).then(function (encryptedAESKey) {
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
                        dataFormat : "Text",

                    };
                    if (message && receiver && self.get('socket')) {
                        self.get('AllMessage').pushObject(mesg);
                        self.get('socket').send(JSON.stringify({
                            type : "Private",
                            receiver_id: receiver,
                            ciphertext: encryptedMessage.ciphertext,
                            iv: encryptedMessage.iv,
                            aeskeyReceiver : self.get('Ekey'),
                            aeskeySender : self.get('own'),
                            dataFormat : "Text",

                        }));

                        self.set('newMessage', '');
                        var chatContainer = document.getElementsByClassName("MessageContainer");
                        chatContainer.scrollTop = chatContainer.scrollHeight;
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
        closeCreateGrp : function (){
            Ember.$(".Chat").css("display", "none");
            Ember.$("ViewMember").css("display","none");
            Ember.$(".createGroup").css("display", "none");
            Ember.$(".empty-page").css("display", "block");

        },
        addUsertoGroup(user_id){
                if(event.target.checked){
                    this.get('groupMembers').pushObject(user_id);
                }
                else{
                    this.get('groupMembers').removeObject(user_id);
                }
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
                url : ENV.apiHost+'CreateNewGroup',
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
            let msgtime = new Date();
            let year =msgtime.getFullYear();
            let month =msgtime.getMonth();
            let date =msgtime.getDate();
            let hour =msgtime.getHours();
            let min =msgtime.getMinutes();
            let sec= msgtime.getSeconds();
            let time = `${year}-${month}-${date} ${hour}:${min}:${sec}`;
            console.log(msgtime);
            const self = this;
            let message = document.getElementById('MessageInput').value.trim();
            if (!message) return;

            document.getElementById("MessageInput").value = "";
            let receiver = self.get('receiver_id');
            let sender_id = self.get('sender_id');
            let socket = self.get('socket');
            let AESkey = self.get("AESkey");
            Ember.$.ajax({
                url: ENV.apiHost+'FetchGroupMembersKey',
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
                            if (socket) {
                                socket.send(JSON.stringify({
                                    type: "Group",
                                    grp_id: receiver,
                                    sender_id: sender_id,
                                    ciphertext: encryptedMessage.ciphertext,
                                    iv: encryptedMessage.iv,
                                    members_aesKey: validKeys,
                                    sender_name : self.get('model.curruser.name'),
                                    time :time,
                                    dataFormat : "Text",

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
            self.get('AllMessage').pushObject({ sender_id: sender_id, message: message,dataFormat : "Text",timestamp: time});

        },

        ExitGroup : function (member_id){
            const self =this;
            let member_details ={
                member_id :member_id,
                grp_id : self.get('receiver_id')
            };
            Ember.$.ajax({
                url: ENV.apiHost+'ExitGroupServlet',
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
        OpenViweMember(){
            const self =this;
            self.send("ViewMembers",self.get('receiver_id'));

        },
        ViewMembers :function(grp_id){
            const self =this;
            self.get('ViewGrpMembers').clear();

            Ember.$.ajax({
                url: ENV.apiHost+'FetchGroupMembers',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                xhrFields: { withCredentials: true },
                data: JSON.stringify({grp_id : grp_id}),
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

        makeAdmin : function (member_id,state){
            const self =this;
            let member_details ={
                member_id :member_id,
                grp_id : self.get('receiver_id'),
                state :state,
            };

            Ember.$.ajax({
                url : ENV.apiHost+'RoleChange',
                type : 'POST',
                contentType: 'application/json',
                dataType: 'json',
                xhrFields: { withCredentials: true },
                data: JSON.stringify(member_details),
                success : function (response){
                    Ember.$('#viewmodal').modal('hide');

                },
                error : function (error){
                    console.error(error);

                }
            });

        },
        addMembers : function (){
            const self=this;
            self.get('ViewGrpMembers').clear();
            Ember.$.ajax({
                url: ENV.apiHost+'FetchUsers',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                xhrFields: { withCredentials: true },
                data: JSON.stringify({grp_id : self.get('receiver_id')}),
                success : function (response){
                    for(let mem of response.users){
                        self.get('ViewGrpMembers').pushObject(mem);
                    }
                },
                error : function (error){
                    console.error(error);

                }

            });


        },
        addNewMember : function (){
            const self =this;
            let newMembers ={
                grp_id :self.get('receiver_id'),
                added_by :self.get('sender_id'),
                grpMembers : self.get('groupMembers'),
            };
            Ember.$.ajax({
                url : ENV.apiHost+'AddNewMembers',
                type :'POST',
                data : JSON.stringify(newMembers),
                xhrFields : {withCredentials : true},
                success : function (response){
                    Ember.$('#addmember').modal('hide');

                },
                error : function (error){
                    alert("error on Adding new members ",error);

                }

            });
            self.get('groupMembers').clear();

        },
        openStickerPicker() {
            if(this.get('showStickerPicker')){
                this.set('showStickerPicker', false);
            }
            else{
                this.set('showStickerPicker', true);

            }

        },
        extractSticker : function (url){
            const self =this;
            fetch(url).then(function (response){
                return response.blob();

            }).then(function (blobData){
                console.log(blobData);
                let file = new File([blobData], "sticker.png", { type: blobData.type });

                self.send("sendSticker",blobData);
            })
        },
        sendSticker : function (sticker){
            const self =this;
            let socket = self.get('socket');
            let formData = new FormData();
            formData.append('sticker',sticker);

            Ember.$.ajax({
                url : ENV.apiHost+'FilesHandling',
                type :'POST',
                data : formData,
                processData: false,
                contentType : false,
                xhrFields : {withCredentials : true},
                success : function (response) {
                    let imageUrl = `https://localhost:8443/chatApplication_war_exploded/RetriveFile?file_name=${encodeURIComponent(response.file_name)}`;

                    let sticker_details = {
                        sender_id: self.get('sender_id'),
                        file_name: response.file_name,
                        dataFormat: "Sticker",
                        type: self.get('isGroup') ? 'Group' : 'Private',
                        sender_name: self.get('model.curruser.name')
                    };
                    let sticker_details1 = {
                        sender_id: self.get('sender_id'),
                        file_name: imageUrl,
                        dataFormat: "Sticker",
                        type: self.get('isGroup') ? 'Group' : 'Private',
                        sender_name: self.get('model.curruser.name')
                    };

                    sticker_details[self.get('isGroup') ? 'grp_id' : 'receiver_id'] = self.get('receiver_id');
                    if(socket){
                        socket.send(JSON.stringify(sticker_details));
                    }
                    self.get('AllMessage').pushObject(sticker_details1);
                },
                error : function (error){
                    console.log(error);

                }

            });


        },
        addUserToFork(user_id){
            if(event.target.checked){
                this.get('forkNewMembers').pushObject(user_id);
            }
            else{
                this.get('forkNewMembers').removeObject(user_id);
            }
        },
        ForkMessage : function (message) {
            const self = this;
            self.get('newMembersForFork').clear();
            let isGroup =self.get('isGroup');
            let url =(isGroup) ? ENV.apiHost+"FetchUsers": ENV.apiHost+"FetchNewUsersForFork";
            let datas ={
                grp_id :self.get('receiver_id'),
            }
            Ember.$.ajax({
                url :url,
                type :'POST',
                data : JSON.stringify(datas),
                contentType : 'json',
                xhrFields : {withCredentials : true},
                success : function (response){
                    for(let user of response.users){
                        self.get('newMembersForFork').pushObject(user);
                    }
                },
                error : function (error){
                    console.log(error);
                }

            });

            Ember.$(".createGroup").css("display", "none");
            Ember.$(".ViewGrpMember").css("display", "none");
            Ember.$(".addMembers").css("display", "none");
            Ember.$(".Chat").css("display", "none");
            Ember.$(".forkmsg").css("display", "block");
            document.getElementById("fork-sender").textContent = message.sender_name;
            document.getElementById("fork-msg").textContent = message.message;
            document.getElementById("fork-time").textContent = message.timestamp;
            self.set('forkedmsg', message);
        },
        CreatForkMessage: function () {
            const self = this;
            self.get('ViewGrpMembers').clear();
            let chatName = document.getElementById('chat-title').value;
            let isGroup = self.get('isGroup');
            let sender_id = self.get('sender_id');
            let receiver_id = self.get('receiver_id');
            let forkOldMembers = self.get('forkOldMembers');
            let forkNewMembers = self.get('forkNewMembers');
            let forkKeys = self.get('forkKeys');
            let isChecked = Ember.$("#all").prop("checked");
            let response_data;

            let getMembersPromise = Promise.resolve();

            if (isGroup && isChecked) {
                self.send("ViewMembers", receiver_id);
                getMembersPromise = new Promise(resolve => {
                    Ember.run.later(() => {
                        let ViewGrpMembers = self.get('ViewGrpMembers');
                        if (ViewGrpMembers && ViewGrpMembers.length) {
                            ViewGrpMembers.forEach(member => {
                                if (member.user_id !== sender_id) {
                                    forkOldMembers.pushObject(member.user_id);
                                }
                            });
                        }
                        resolve(ViewGrpMembers);
                    }, 500);
                    self.get('ViewGrpMembers').clear();
                });
            } else if (!isGroup && isChecked) {
                forkOldMembers.pushObject(receiver_id);
            }

            return getMembersPromise.then(() => {
                let tempfork = forkNewMembers.concat(forkOldMembers);
                forkOldMembers.pushObject(sender_id);
                self.set('tempfork', tempfork);

                let msg_pack = {
                    name: chatName,
                    Admin_id: sender_id,
                    grpMembers: tempfork
                };

                return Ember.$.ajax({
                    url: ENV.apiHost+'CreateNewGroup',
                    type: 'POST',
                    data: JSON.stringify(msg_pack),
                    xhrFields: { withCredentials: true }
                });
            }).then(response => {
                self.set('forkID', response.grp_id);
                return Ember.$.ajax({
                    url: ENV.apiHost+'FetchMessageFork',
                    type: 'POST',
                    data: JSON.stringify({
                        msg_id: self.get('forkedmsg').mess_id,
                        msg_time: self.get('forkedmsg').timestamp,
                        dataFormat: self.get('forkedmsg').dataFormat,
                        isGroup: isGroup,
                        sender_id: sender_id,
                        receiver_id: receiver_id
                    }),
                    xhrFields: { withCredentials: true }
                });
            }).then(response => {
                response_data = response;
                self.send('ViewMembers', self.get('forkID'));

                return new Promise(resolve => {
                    Ember.run.later(() => {
                        let ViewGrpMembers = self.get('ViewGrpMembers');
                        console.log("ViewGrpMembers After Fix:", ViewGrpMembers);
                        resolve(ViewGrpMembers);
                    }, 500);
                });
            }).then(ViewGrpMembers => {
                return StorageService.getPrivateKey(self.get('sender_id')).then(RSAPrivateKey => {
                    self.set('secretKey', RSAPrivateKey);
                    console.log(ViewGrpMembers);
                    console.log("ViewGrpMembers Length:", ViewGrpMembers.length);

                    let encryptionPromises = [];
                    self.set('newForkMemberMessages', []);

                    for (let msg of response_data.messages) {
                        let promises = [];
                        let forkKeys = [];

                        for (let member of ViewGrpMembers) {
                            if (!forkOldMembers.includes(member.user_id)) {
                                let key = isGroup ? msg.enc_aes_key : (msg.sender_id === sender_id ? msg.aes_key_sender : msg.aes_key_receiver);
                                console.log(member.rsa_public_key);
                                let promise = CryptoUtils.decryptAESKey(key, RSAPrivateKey)
                                    .then(dec_aes => {
                                        return window.crypto.subtle.exportKey("raw", dec_aes);
                                    })
                                    .then(arrayBuffer => {
                                        return CryptoUtils.encryptAESKey(arrayBuffer, member.rsa_public_key);
                                    })
                                    .then(enc_aes => {
                                        forkKeys.push({ receiver_id: member.user_id, enc_aes: enc_aes });
                                        console.log(forkKeys);
                                    });

                                promises.push(promise);
                            } else if (!isGroup) {

                                forkKeys.push({ receiver_id: msg.receiver_id, enc_aes: msg.aes_key_receiver });
                                forkKeys.push({ receiver_id: msg.sender_id, enc_aes: msg.aes_key_sender });
                            }
                        }
                        console.log(promises);

                        let newForkMemberMessage = {
                            mess_id: msg.mess_id,
                            sender_id: msg.sender_id,
                            receiver_id: isGroup ? msg.grp_id : msg.receiver_id,
                            message: msg.message,
                            iv: msg.iv,
                            created_at: msg.timestamp,
                            enc_aes_keys: forkKeys
                        };

                        let messagePromise = Promise.allSettled(promises).then(() => {
                            self.get('newForkMemberMessages').pushObject(newForkMemberMessage);
                        });

                        encryptionPromises.push(messagePromise);
                    }

                    return Promise.all(encryptionPromises);
                }).then(() => {
                    return Ember.$.ajax({
                        url: ENV.apiHost+'CreateForkMessage',
                        type: 'POST',
                        data: JSON.stringify({
                            isGroup: isGroup,
                            fork_id: self.get('forkID'),
                            messages: self.get('newForkMemberMessages'),
                            receiver_id_file: receiver_id,
                            msg_time: self.get('forkedmsg').timestamp,
                        }),
                        xhrFields: { withCredentials: true }
                    });
                }).then(() => {
                    console.log("Fork message created successfully");
                    window.location.href="chat";
                }).catch(error => console.error(error));

            });
        },
        closeFork: function (){
            Ember.$(".createGroup").css("display", "none");
            Ember.$(".ViewGrpMember").css("display", "none");
            Ember.$(".addMembers").css("display", "none");
            Ember.$(".forkmsg").css("display", "none");
            Ember.$(".Chat").css("display", "block");


        },
        DeleteMessage : function (message,option){
            const self =this;

            let msg_pack ={
                msg_id : message.mess_id,
                request_id : self.get('sender_id'),
                isGroup : self.get('isGroup'),
                receiver_id: message.receiver_id,
                option : option,
                isequal :(message.sender_id === self.get('sender_id')),
                dataFormat : message.dataFormat,
            };

            Ember.$.ajax({
                url : ENV.apiHost + 'DeleteMessage',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify(msg_pack),
                xhrFields: { withCredentials: true },
                success : function (response){
                    self.set('AllMessage', self.get('AllMessage').filter(msg => msg.mess_id !== message.mess_id));
                    console.log("Message Deleted");

                },
                error : function (error){
                    console.error("Error on Deleting Message");

                }

            });

        },
        ForwardMessage : function (action){
            const self =this;
            self.get('forwardMessagearray').clear();
            self.set('countOfforwardMessage',0);
            self.set('messageForwardMode',action);
        },
        updateForwardMessage : function (message){
            const self =this;
            if(event.target.checked){
                self.get('forwardMessagearray').pushObject(message);
                self.incrementProperty('countOfforwardMessage');
            }
            else{
                self.get('forwardMessagearray').removeObject(message);
                self.decrementProperty('countOfforwardMessage');

            }
            console.log(self.get('forwardMessagearray'));
        },
        doForward : function (){
            const self=this;
            let allMessages = self.get('AllMessage');
            let selectedMessageIds = self.get('forwardMessagearray');
            alert(allMessages);
            alert(selectedMessageIds);
            let orderedSelectedMessages = allMessages.filter(msg => selectedMessageIds.includes(msg));
            console.log(orderedSelectedMessages);
        }







    }




});



