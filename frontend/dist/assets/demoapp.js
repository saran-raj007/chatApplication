"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('demoapp/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'demoapp/config/environment'], function (exports, _ember, _emberResolver, _emberLoadInitializers, _demoappConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _demoappConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _demoappConfigEnvironment['default'].podModulePrefix,
    Resolver: _emberResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _demoappConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('demoapp/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'demoapp/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _demoappConfigEnvironment) {

  var name = _demoappConfigEnvironment['default'].APP.name;
  var version = _demoappConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});
define('demoapp/controllers/array', ['exports', '@ember/controller'], function (exports, _emberController) {
  exports['default'] = _emberController['default'];
});
define("demoapp/controllers/chat", ["exports", "ember", "demoapp/utils/crypto", "demoapp/services/storage-service"], function (exports, _ember, _demoappUtilsCrypto, _demoappServicesStorageService) {
    //import {console} from "ember-cli-qunit";

    exports["default"] = _ember["default"].Controller.extend({
        AllMessage: _ember["default"].A(),
        sender_id: '',
        receiver_id: '',
        socket: null,
        selectedUsername: null,
        rsapubkey: null,
        rsaPubown: null,
        AESkey: null,
        Ekey: null,
        own: null,
        groupMembers: _ember["default"].A(),
        grpPubKey: null,
        grpMembersencAESKeys: _ember["default"].A(),
        isGroup: false,
        isAdmin: false,
        ViewGrpMembers: _ember["default"].A(),
        showStickerPicker: false,
        stickers: [{ url: "/Stickers/dumbbell.png" }, { url: "/Stickers/laptop.png" }, { url: "/Stickers/listening.png" }, { url: "/Stickers/tea-time.png" }],

        init: function init() {
            this._super.apply(this, arguments);

            var self = this;

            _ember["default"].run.scheduleOnce('afterRender', this, function () {
                var curruser = self.get('model.curruser');
                if (curruser) {
                    self.set('sender_id', curruser.user_id);
                    self.set('rsaPubown', curruser.rsa_public_key);
                }
                var socket = new WebSocket("ws://localhost:8080/chatApplication_war_exploded/LiveChat/" + this.sender_id);
                socket.onopen = function () {
                    return console.log('WebSocket Connected');
                };
                socket.onmessage = function (event) {
                    var receivedMessage = JSON.parse(event.data);
                    var msg_pack = undefined;
                    if (receivedMessage.dataFormat === "Text") {
                        _demoappServicesStorageService["default"].getPrivateKey("privateKey").then(function (privateKey) {
                            _demoappUtilsCrypto["default"].decryptMessage(receivedMessage.message, receivedMessage.aes_key_receiver, privateKey, receivedMessage.iv).then(function (message) {
                                msg_pack = {
                                    sender_id: receivedMessage.sender_id,
                                    message: message,
                                    sender_name: receivedMessage.sender_name,
                                    dataFormat: 'Text'
                                };
                                self.get('AllMessage').pushObject(msg_pack);
                            })["catch"](function (error) {
                                console.log("error on decryption process", error);
                            });
                        })["catch"](function (error) {
                            console.log("Error on fetch key form indexDB:", error);
                        });
                    } else {
                        msg_pack = {
                            sender_id: receivedMessage.sender_id,
                            file_name: receivedMessage.file_name,
                            sender_name: receivedMessage.sender_name,
                            dataFormat: 'Sticker'
                        };
                        self.get('AllMessage').pushObject(msg_pack);
                    }
                };
                socket.onclose = function () {
                    return console.log('WebSocket Disconnected');
                };
                socket.onerror = function (error) {
                    return console.error('WebSocket Error:', error);
                };
                this.set('socket', socket);
            });
        },

        actions: {

            fetchchat: function fetchchat(receiver, chat) {
                var self = this;
                var datas = undefined;
                if (chat === "Private") {

                    datas = {
                        userid: receiver.user_id,
                        type: chat

                    };
                    self.set('isGroup', false);
                    self.set('receiver_id', receiver.user_id);
                } else {
                    datas = {
                        userid: receiver.group_id,
                        type: chat

                    };
                    self.set('isGroup', true);
                    self.set('receiver_id', receiver.group_id);
                }
                self.set('selectedUsername', receiver.name);
                self.get('AllMessage').clear();
                self.get('ViewGrpMembers').clear();
                _ember["default"].$.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/FetchchatServlet',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    xhrFields: { withCredentials: true },
                    data: JSON.stringify(datas),
                    success: function success(response) {
                        self.set('isAdmin', false);
                        _ember["default"].$(".empty-page").css("display", "none");
                        _ember["default"].$(".createGroup").css("display", "none");
                        _ember["default"].$(".ViewGrpMember").css("display", "none");
                        _ember["default"].$(".Chat").css("display", "block");
                        _demoappServicesStorageService["default"].getPrivateKey("privateKey").then(function (privateKey) {
                            if (chat === "Private") {
                                var promises = [];
                                var _iteratorNormalCompletion = true;
                                var _didIteratorError = false;
                                var _iteratorError = undefined;

                                try {
                                    var _loop = function () {
                                        var msg = _step.value;

                                        if (msg.dataFormat === "Text") {
                                            (function () {
                                                var key = msg.sender_id !== self.get('sender_id') ? msg.aes_key_receiver : msg.aes_key_sender;

                                                var promise = new _ember["default"].RSVP.Promise(function (resolve, reject) {
                                                    _demoappUtilsCrypto["default"].decryptMessage(msg.message, key, privateKey, msg.iv).then(function (message) {
                                                        var msg_pack = {
                                                            sender_id: msg.sender_id,
                                                            message: message,
                                                            dataFormat: "Text",
                                                            timestamp: msg.timestamp
                                                        };
                                                        resolve(msg_pack);
                                                    })["catch"](function (error) {
                                                        console.log("Error in decryption:", error);
                                                        reject(error);
                                                    });
                                                });
                                                promises.push(promise);
                                            })();
                                        } else {
                                            var stickerPromise = _ember["default"].RSVP.resolve({
                                                sender_id: msg.sender_id,
                                                file_name: msg.file_name,
                                                dataFormat: "Sticker",
                                                timestamp: msg.timestamp
                                            });

                                            promises.push(stickerPromise);
                                        }
                                        console.log(self.get('AllMessage'));
                                    };

                                    for (var _iterator = response.messages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                        _loop();
                                    }
                                } catch (err) {
                                    _didIteratorError = true;
                                    _iteratorError = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion && _iterator["return"]) {
                                            _iterator["return"]();
                                        }
                                    } finally {
                                        if (_didIteratorError) {
                                            throw _iteratorError;
                                        }
                                    }
                                }

                                _ember["default"].RSVP.allSettled(promises).then(function (results) {
                                    var sortedMessages = results.filter(function (result) {
                                        return result.value;
                                    }).map(function (result) {
                                        return result.value;
                                    }).sort(function (a, b) {
                                        return new Date(a.timestamp) - new Date(b.timestamp);
                                    });
                                    sortedMessages.forEach(function (msg_pack) {
                                        self.get('AllMessage').pushObject(msg_pack);
                                    });
                                    console.log(self.get('AllMessage').toArray());
                                })["catch"](function (error) {
                                    console.log("Error in processing messages:", error);
                                });
                                console.log(self.get('AllMessage'));
                            } else {
                                // write code for group chat decrypt
                                var promises = [];
                                self.set('isAdmin', response.isAdmin);
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    var _loop2 = function () {
                                        var msg = _step2.value;

                                        var msg_pack = undefined;
                                        if (msg.dataFormat === "Text") {
                                            var promise = new _ember["default"].RSVP.Promise(function (resolve, reject) {
                                                _demoappUtilsCrypto["default"].decryptMessage(msg.message, msg.enc_aes_key, privateKey, msg.iv).then(function (message) {
                                                    msg_pack = {
                                                        sender_id: msg.sender_id,
                                                        message: message,
                                                        sender_name: msg.sender_name,
                                                        timestamp: msg.timestamp,
                                                        dataFormat: "Text"
                                                    };
                                                    resolve(msg_pack);
                                                })["catch"](function (error) {
                                                    console.log("Error in decryption:", error);
                                                    reject(error);
                                                });
                                            });
                                            promises.push(promise);
                                        } else {
                                            var stickerPromise = _ember["default"].RSVP.resolve({
                                                sender_id: msg.sender_id,
                                                file_name: msg.file_name,
                                                dataFormat: "Sticker",
                                                sender_name: msg.sender_name,
                                                timestamp: msg.timestamp

                                            });
                                            promises.push(stickerPromise);
                                        }
                                    };

                                    for (var _iterator2 = response.messages[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        _loop2();
                                    }
                                } catch (err) {
                                    _didIteratorError2 = true;
                                    _iteratorError2 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                                            _iterator2["return"]();
                                        }
                                    } finally {
                                        if (_didIteratorError2) {
                                            throw _iteratorError2;
                                        }
                                    }
                                }

                                _ember["default"].RSVP.allSettled(promises).then(function (results) {
                                    var sortedMessages = results.filter(function (result) {
                                        return result.value;
                                    }).map(function (result) {
                                        return result.value;
                                    }).sort(function (a, b) {
                                        return new Date(a.timestamp) - new Date(b.timestamp);
                                    });
                                    sortedMessages.forEach(function (msg_pack) {
                                        self.get('AllMessage').pushObject(msg_pack);
                                    });
                                    console.log(self.get('AllMessage').toArray());
                                })["catch"](function (error) {
                                    console.log("Error in processing messages:", error);
                                });
                            }
                        })["catch"](function (error) {
                            console.log("Error on fetch key form indexDB:", error);
                        });

                        //self.set('AllMessage', response.messages);
                        _demoappUtilsCrypto["default"].generateAESKey().then(function (aesKey) {
                            var receiverPublicKey = response.key;
                            var ownPublicKey = self.get('rsaPubown');
                            self.set('AESkey', aesKey);
                            self.set('rsapubkey', receiverPublicKey);
                            if (chat == "Private") {
                                _demoappUtilsCrypto["default"].encryptAESKey(aesKey, receiverPublicKey).then(function (encryptedAESKey) {
                                    self.set('Ekey', encryptedAESKey);
                                })["catch"](function (error) {
                                    console.error("Error encrypting AES Key:", error);
                                });
                            }
                            _demoappUtilsCrypto["default"].encryptAESKey(aesKey, ownPublicKey).then(function (encryptedAESKey) {
                                // console.log("Encrypted AES Key:", encryptedAESKey);
                                self.set('own', encryptedAESKey);
                            })["catch"](function (error) {
                                console.error("Error encrypting AES Key:", error);
                            });
                        })["catch"](function (error) {
                            console.error("Error generating AES Key:", error);
                        });
                    },
                    error: function error(err) {
                        console.error("Error sending data:", err);
                    }
                });
            },
            sendMessage: function sendMessage() {
                var message = document.getElementById('MessageInput').value;
                var self = this;
                document.getElementById("MessageInput").value = "";
                _demoappUtilsCrypto["default"].importAESKey(self.get('AESkey')).then(function (aesKey) {
                    _demoappUtilsCrypto["default"].encryptMessage(message, aesKey).then(function (encryptedMessage) {
                        var receiver = self.get('receiver_id');
                        var mesg = {
                            sender_id: self.get('sender_id'),
                            message: message,
                            dataFormat: "Text"

                        };
                        if (message && receiver && self.get('socket')) {
                            self.get('AllMessage').pushObject(mesg);
                            self.get('socket').send(JSON.stringify({
                                type: "Private",
                                receiver_id: receiver,
                                ciphertext: encryptedMessage.ciphertext,
                                iv: encryptedMessage.iv,
                                aeskeyReceiver: self.get('Ekey'),
                                aeskeySender: self.get('own'),
                                dataFormat: "Text"

                            }));

                            self.set('newMessage', '');
                            var chatContainer = document.getElementsByClassName("MessageContainer");
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                        }
                    })["catch"](function (error) {
                        console.error("Error on message encryption:", error);
                    });
                })["catch"](function (error) {
                    console.error("Error importing key:", error);
                });
            },

            logout: function logout() {

                var self = this;
                document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                _ember["default"].$.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/Logout',
                    type: 'POST',
                    xhrFields: { withCredentials: true },
                    success: function success() {
                        self.transitionToRoute('login');
                    },
                    error: function error(xhr, status, _error) {
                        console.error("Logout failed:", _error);
                    }
                });
            },

            showGrpCreate: function showGrpCreate() {
                _ember["default"].$(".empty-page").css("display", "none");
                _ember["default"].$(".Chat").css("display", "none");
                _ember["default"].$("ViewMember").css("display", "none");
                _ember["default"].$(".createGroup").css("display", "block");
            },
            addUsertoGroup: function addUsertoGroup(user_id) {
                if (event.target.checked) {
                    this.get('groupMembers').pushObject(user_id);
                } else {
                    this.get('groupMembers').removeObject(user_id);
                }
                // console.log(this.get('groupMembers'));
            },
            CreateNewGroup: function CreateNewGroup(creater_id) {
                var self = this;
                var grpName = document.getElementById('grpName').value;
                if (!grpName) return;
                var grpDetails = {
                    name: grpName,
                    Admin_id: creater_id,
                    grpMembers: self.get('groupMembers')

                };

                _ember["default"].$.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/CreateNewGroup',
                    type: 'POST',
                    data: JSON.stringify(grpDetails),
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        window.location.href = "chat";
                    },
                    error: function error(_error2) {
                        alert("erro on group creation", _error2);
                    }

                });
                console.log("Private key stored successfully!");
            },

            SendMessageOnGroup: function SendMessageOnGroup() {
                var msgtime = new Date();
                var year = msgtime.getFullYear();
                var month = msgtime.getMonth();
                var date = msgtime.getDate();
                var hour = msgtime.getHours();
                var min = msgtime.getMinutes();
                var sec = msgtime.getSeconds();
                var time = year + "-" + month + "-" + date + " " + hour + ":" + min + ":" + sec;
                console.log(msgtime);
                var self = this;
                var message = document.getElementById('MessageInput').value.trim();
                if (!message) return;

                document.getElementById("MessageInput").value = "";
                var receiver = self.get('receiver_id');
                var sender_id = self.get('sender_id');
                var socket = self.get('socket');
                var AESkey = self.get("AESkey");
                _ember["default"].$.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/FetchGroupMembersKey',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    xhrFields: { withCredentials: true },
                    data: JSON.stringify({ group_id: receiver })
                }).done(function (response) {
                    var encryptionPromises = response.Keys.map(function (key) {
                        return _demoappUtilsCrypto["default"].encryptAESKey(AESkey, key.rsa_public_key).then(function (encryptedAESKey) {
                            return {
                                user_id: key.user_id,
                                encryptedAESKey: encryptedAESKey
                            };
                        })["catch"](function (error) {
                            console.error("Error encrypting AES key for user:", key.user_id, error);
                            return null;
                        });
                    });
                    encryptionPromises.push(Promise.resolve({
                        user_id: self.get('sender_id'),
                        encryptedAESKey: self.get('own')
                    }));
                    _ember["default"].RSVP.all(encryptionPromises).then(function (encryptedKeys) {
                        var validKeys = encryptedKeys.filter(Boolean);
                        _demoappUtilsCrypto["default"].importAESKey(AESkey).then(function (aesKeyObj) {
                            return _demoappUtilsCrypto["default"].encryptMessage(message, aesKeyObj);
                        }).then(function (encryptedMessage) {
                            self.get('AllMessage').pushObject({ sender_id: sender_id, message: message, dataFormat: "Text", timestamp: time });
                            if (socket) {
                                socket.send(JSON.stringify({
                                    type: "Group",
                                    grp_id: receiver,
                                    sender_id: sender_id,
                                    ciphertext: encryptedMessage.ciphertext,
                                    iv: encryptedMessage.iv,
                                    members_aesKey: validKeys,
                                    sender_name: self.get('model.curruser.name'),
                                    time: time,
                                    dataFormat: "Text"

                                }));
                            }
                        })["catch"](function (error) {
                            console.error("Error encrypting message:", error);
                        });
                    });
                }).fail(function (error) {
                    console.error("Error fetching group keys:", error);
                });
            },

            ExitGroup: function ExitGroup(member_id) {
                var self = this;
                var member_details = {
                    member_id: member_id,
                    grp_id: self.get('receiver_id')
                };
                _ember["default"].$.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/ExitGroupServlet',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    xhrFields: { withCredentials: true },
                    data: JSON.stringify(member_details),
                    success: function success(response) {
                        window.location.href = "chat";
                    },
                    error: function error(_error3) {
                        console.log(_error3);
                    }

                });
            },
            ViewMembers: function ViewMembers() {
                var self = this;
                self.get('ViewGrpMembers').clear();
                _ember["default"].$(".empty-page").css("display", "none");
                _ember["default"].$(".Chat").css("display", "none");
                _ember["default"].$(".createGroup").css("display", "none");
                _ember["default"].$(".addMembers").css("display", "none");
                _ember["default"].$(".ViewGrpMember").css("display", "block");

                _ember["default"].$.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/FetchGroupMembers',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    xhrFields: { withCredentials: true },
                    data: JSON.stringify({ grp_id: self.get('receiver_id') }),
                    success: function success(response) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = response.grp_members[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var mem = _step3.value;

                                self.get('ViewGrpMembers').pushObject(mem);
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                                    _iterator3["return"]();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }
                    },
                    error: function error(_error4) {
                        console.error(_error4);
                    }

                });
            },
            closeViewMember: function closeViewMember() {
                _ember["default"].$(".empty-page").css("display", "none");
                _ember["default"].$(".createGroup").css("display", "none");
                _ember["default"].$(".ViewGrpMember").css("display", "none");
                _ember["default"].$(".addMembers").css("display", "none");
                _ember["default"].$(".Chat").css("display", "block");
            },

            makeAdmin: function makeAdmin(member_id, state) {
                var self = this;
                var member_details = {
                    member_id: member_id,
                    grp_id: self.get('receiver_id'),
                    state: state
                };

                _ember["default"].$.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/RoleChange',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    xhrFields: { withCredentials: true },
                    data: JSON.stringify(member_details),
                    success: function success(response) {
                        _ember["default"].$(".empty-page").css("display", "none");
                        _ember["default"].$(".createGroup").css("display", "none");
                        _ember["default"].$(".ViewGrpMember").css("display", "none");
                        _ember["default"].$(".addMembers").css("display", "none");
                        _ember["default"].$(".Chat").css("display", "block");
                    },
                    error: function error(_error5) {
                        console.error(_error5);
                    }
                });
            },
            addMembers: function addMembers() {
                var self = this;
                self.get('ViewGrpMembers').clear();
                _ember["default"].$(".empty-page").css("display", "none");
                _ember["default"].$(".createGroup").css("display", "none");
                _ember["default"].$(".ViewGrpMember").css("display", "none");
                _ember["default"].$(".Chat").css("display", "none");
                _ember["default"].$(".addMembers").css("display", "block");
                _ember["default"].$.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/FetchUsers',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    xhrFields: { withCredentials: true },
                    data: JSON.stringify({ grp_id: self.get('receiver_id') }),
                    success: function success(response) {
                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = response.users[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                var mem = _step4.value;

                                self.get('ViewGrpMembers').pushObject(mem);
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                                    _iterator4["return"]();
                                }
                            } finally {
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }
                    },
                    error: function error(_error6) {
                        console.error(_error6);
                    }

                });
            },
            addNewMember: function addNewMember() {
                var self = this;
                var newMembers = {
                    grp_id: self.get('receiver_id'),
                    added_by: self.get('sender_id'),
                    grpMembers: self.get('groupMembers')
                };
                _ember["default"].$.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/AddNewMembers',
                    type: 'POST',
                    data: JSON.stringify(newMembers),
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        _ember["default"].$(".createGroup").css("display", "none");
                        _ember["default"].$(".ViewGrpMember").css("display", "none");
                        _ember["default"].$(".addMembers").css("display", "none");
                        _ember["default"].$(".Chat").css("display", "block");
                    },
                    error: function error(_error7) {
                        alert("error on Adding new members ", _error7);
                    }

                });
                self.get('groupMembers').clear();
            },
            openStickerPicker: function openStickerPicker() {
                if (this.get('showStickerPicker')) {
                    this.set('showStickerPicker', false);
                } else {
                    this.set('showStickerPicker', true);
                }
            },
            extractSticker: function extractSticker(url) {
                var self = this;
                fetch(url).then(function (response) {
                    return response.blob();
                }).then(function (blobData) {
                    console.log(blobData);
                    var file = new File([blobData], "sticker.png", { type: blobData.type });

                    self.send("sendSticker", blobData);
                });
            },
            sendSticker: function sendSticker(sticker) {
                var self = this;
                var socket = self.get('socket');
                var formData = new FormData();
                formData.append('sticker', sticker);

                _ember["default"].$.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/FilesHandling',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        var sticker_details = {
                            sender_id: self.get('sender_id'),
                            file_name: response.file_name,
                            dataFormat: "Sticker",
                            type: self.get('isGroup') ? 'Group' : 'Private',
                            sender_name: self.get('model.curruser.name')
                        };
                        sticker_details[self.get('isGroup') ? 'grp_id' : 'receiver_id'] = self.get('receiver_id');
                        if (socket) {
                            socket.send(JSON.stringify(sticker_details));
                        }
                        self.get('AllMessage').pushObject(sticker_details);
                    },
                    error: function error(_error8) {
                        console.log(_error8);
                    }

                });
            }

        }

    });
});
define('demoapp/controllers/login', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
        actions: {
            login: function login() {
                var self = this;
                var user_mbnum = document.getElementById('user-mb').value;
                var user_pass = document.getElementById('user-pass').value;
                if (!user_mbnum || !user_pass) {
                    alert("Fill all the fields");
                    return;
                }
                $.ajax({
                    url: 'http://localhost:8080/chatApplication_war_exploded/LoginServlet',
                    type: 'POST',
                    contentType: 'application/json',
                    xhrFields: { withCredentials: true },
                    data: JSON.stringify({
                        user_mbnum: user_mbnum,
                        user_pass: user_pass
                    }),
                    success: function success(response) {

                        window.location.href = "chat";
                    },
                    error: function error(_error) {
                        alert("Invalid user name or password");
                        console.log(_error);
                    }
                });
            }
        }
    });
});
define('demoapp/controllers/object', ['exports', '@ember/controller'], function (exports, _emberController) {
  exports['default'] = _emberController['default'];
});
define("demoapp/controllers/signup", ["exports", "ember", "demoapp/utils/crypto", "demoapp/services/storage-service"], function (exports, _ember, _demoappUtilsCrypto, _demoappServicesStorageService) {
    exports["default"] = _ember["default"].Controller.extend({

        actions: {
            signup: function signup() {

                var user_name = document.getElementById('user-name').value;
                var mobile_number = document.getElementById('user-mobile').value;
                var password = document.getElementById('user-pass').value;
                var public_key = null;

                _demoappUtilsCrypto["default"].generateRSAKeys().then(function (keys) {
                    public_key = keys.publicKey;

                    _ember["default"].$.ajax({

                        url: 'http://localhost:8080/chatApplication_war_exploded/SignupServlet',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            user_name: user_name,
                            mobile_number: mobile_number,
                            user_pass: password,
                            rsa_pubkey: public_key
                        }),
                        xhrFields: { withCredentials: true },
                        success: function success(response) {
                            _demoappServicesStorageService["default"].storePrivateKey(keys.privateKey, response.user_id).then(function () {
                                console.log("Private key stored successfully!");
                                window.location.href = "chat";
                            })["catch"](function (error) {
                                console.error("Error storing private key:", error);
                            });
                        },
                        error: function error(_error) {
                            alert(_error.message);
                        }

                    });
                })["catch"](function (error) {
                    console.error("Error generating RSA keys:", error);
                });
            }
        }

    });
});
define('demoapp/helpers/eq', ['exports', 'ember'], function (exports, _ember) {
    exports.eq = eq;

    function eq(params) {
        return params[0] === params[1];
    }

    exports['default'] = _ember['default'].Helper.helper(eq);
});
define('demoapp/helpers/neq', ['exports', 'ember'], function (exports, _ember) {
    exports.neq = neq;

    function neq(params) {
        return params[0] !== params[1];
    }

    exports['default'] = _ember['default'].Helper.helper(neq);
});
define('demoapp/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'demoapp/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _demoappConfigEnvironment) {
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(_demoappConfigEnvironment['default'].APP.name, _demoappConfigEnvironment['default'].APP.version)
  };
});
define('demoapp/initializers/export-application-global', ['exports', 'ember', 'demoapp/config/environment'], function (exports, _ember, _demoappConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_demoappConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _demoappConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_demoappConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('demoapp/router', ['exports', 'ember', 'demoapp/config/environment'], function (exports, _ember, _demoappConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _demoappConfigEnvironment['default'].locationType
  });

  Router.map(function () {
    this.route('login');
    this.route('signup');
    this.route('chat');
  });

  exports['default'] = Router;
});
define('demoapp/routes/chat', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Route.extend({
        model: function model() {
            var _this = this;

            return _ember['default'].$.ajax({
                url: 'http://localhost:8080/chatApplication_war_exploded/ChatServlet',
                type: 'GET',
                xhrFields: { withCredentials: true }
            }).fail(function (error) {
                alert(error.message);
                alert("Unauthorized access! Redirecting to login...");
                _ember['default'].run(function () {
                    _this.replaceWith('login');
                });
            });
        }
    });
});
define('demoapp/routes/login', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('demoapp/routes/signup', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define("demoapp/services/storage-service", ["exports", "ember"], function (exports, _ember) {

    var StorageService = {
        storePrivateKey: function storePrivateKey(encryptedKey, name) {
            return new Promise(function (resolve, reject) {
                var request = indexedDB.open("ChatAppDB", 1);

                request.onupgradeneeded = function (event) {
                    var db = event.target.result;
                    if (!db.objectStoreNames.contains("keys")) {
                        db.createObjectStore("keys", { keyPath: "id" });
                    }
                };

                request.onsuccess = function (event) {
                    var db = event.target.result;
                    var transaction = db.transaction("keys", "readwrite");
                    var store = transaction.objectStore("keys");

                    var putRequest = store.put({ id: name, data: encryptedKey });

                    putRequest.onsuccess = function () {
                        resolve(true);
                    };

                    putRequest.onerror = function () {
                        reject(putRequest.error);
                    };
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };
            });
        },

        getPrivateKey: function getPrivateKey(name) {
            return new Promise(function (resolve, reject) {
                var request = indexedDB.open("ChatAppDB", 1);

                request.onsuccess = function (event) {
                    var db = event.target.result;
                    var transaction = db.transaction("keys", "readonly");
                    var store = transaction.objectStore("keys");

                    var getRequest = store.get(name);

                    getRequest.onsuccess = function () {
                        if (getRequest.result) {
                            resolve(getRequest.result.data);
                        } else {
                            resolve(null);
                        }
                    };

                    getRequest.onerror = function () {
                        reject(getRequest.error);
                    };
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };
            });
        }
    };

    exports["default"] = StorageService;
});
define("demoapp/services/user-service", ["exports"], function (exports) {});
define("demoapp/templates/chat", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@1.13.12",
          "loc": {
            "source": null,
            "start": {
              "line": 17,
              "column": 4
            },
            "end": {
              "line": 25,
              "column": 4
            }
          },
          "moduleName": "demoapp/templates/chat.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "group");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "avatar");
          var el3 = dom.createElement("img");
          dom.setAttribute(el3, "src", "assets/profile.png");
          dom.setAttribute(el3, "alt", "");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          dom.setAttribute(el2, "class", "GroupName");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "GroupDescrp");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element17 = dom.childAt(fragment, [1]);
          var morphs = new Array(3);
          morphs[0] = dom.createElementMorph(element17);
          morphs[1] = dom.createMorphAt(dom.childAt(element17, [3]), 0, 0);
          morphs[2] = dom.createMorphAt(dom.childAt(element17, [5]), 0, 0);
          return morphs;
        },
        statements: [["element", "action", ["fetchchat", ["get", "message", ["loc", [null, [18, 47], [18, 54]]]], "Private"], [], ["loc", [null, [18, 26], [18, 67]]]], ["content", "message.name", ["loc", [null, [20, 33], [20, 49]]]], ["content", "message.mobile_number", ["loc", [null, [21, 38], [21, 63]]]]],
        locals: ["message"],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@1.13.12",
          "loc": {
            "source": null,
            "start": {
              "line": 26,
              "column": 8
            },
            "end": {
              "line": 34,
              "column": 8
            }
          },
          "moduleName": "demoapp/templates/chat.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "group");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "avatar");
          var el3 = dom.createElement("img");
          dom.setAttribute(el3, "src", "assets/profile.png");
          dom.setAttribute(el3, "alt", "");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          dom.setAttribute(el2, "class", "GroupName");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "GroupDescrp");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element16 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element16);
          morphs[1] = dom.createMorphAt(dom.childAt(element16, [3]), 0, 0);
          return morphs;
        },
        statements: [["element", "action", ["fetchchat", ["get", "group", ["loc", [null, [27, 51], [27, 56]]]], "Group"], [], ["loc", [null, [27, 30], [27, 67]]]], ["content", "group.name", ["loc", [null, [29, 37], [29, 51]]]]],
        locals: ["group"],
        templates: []
      };
    })();
    var child2 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@1.13.12",
            "loc": {
              "source": null,
              "start": {
                "line": 52,
                "column": 20
              },
              "end": {
                "line": 54,
                "column": 20
              }
            },
            "moduleName": "demoapp/templates/chat.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                     ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            var el2 = dom.createTextNode("Add Member");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element13 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createElementMorph(element13);
            return morphs;
          },
          statements: [["element", "action", ["addMembers"], ["on", "click"], ["loc", [null, [53, 29], [53, 63]]]]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@1.13.12",
          "loc": {
            "source": null,
            "start": {
              "line": 50,
              "column": 16
            },
            "end": {
              "line": 56,
              "column": 16
            }
          },
          "moduleName": "demoapp/templates/chat.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fas fa-sign-out-alt logout-icon");
          dom.setAttribute(el1, "title", "Logout");
          var el2 = dom.createTextNode(">");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          var el2 = dom.createTextNode("View Members");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element14 = dom.childAt(fragment, [1]);
          var element15 = dom.childAt(fragment, [5]);
          var morphs = new Array(3);
          morphs[0] = dom.createElementMorph(element14);
          morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
          morphs[2] = dom.createElementMorph(element15);
          return morphs;
        },
        statements: [["element", "action", ["ExitGroup", ["get", "model.curruser.user_id", ["loc", [null, [51, 99], [51, 121]]]]], ["on", "click"], ["loc", [null, [51, 78], [51, 134]]]], ["block", "if", [["get", "isAdmin", ["loc", [null, [52, 26], [52, 33]]]]], [], 0, null, ["loc", [null, [52, 20], [54, 27]]]], ["element", "action", ["ViewMembers"], ["on", "click"], ["loc", [null, [55, 28], [55, 63]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    var child3 = (function () {
      var child0 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "revision": "Ember@1.13.12",
              "loc": {
                "source": null,
                "start": {
                  "line": 64,
                  "column": 20
                },
                "end": {
                  "line": 75,
                  "column": 20
                }
              },
              "moduleName": "demoapp/templates/chat.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1, "class", "message you");
              var el2 = dom.createTextNode("\n                            ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("div");
              dom.setAttribute(el2, "class", "messageHeader");
              var el3 = dom.createTextNode("\n                                ");
              dom.appendChild(el2, el3);
              var el3 = dom.createElement("span");
              dom.setAttribute(el3, "class", "senderName");
              var el4 = dom.createComment("");
              dom.appendChild(el3, el4);
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n                            ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n                            ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("p");
              dom.setAttribute(el2, "class", "messageContent");
              var el3 = dom.createComment("");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n                            ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("div");
              dom.setAttribute(el2, "class", "messageDetails");
              var el3 = dom.createTextNode("\n                                ");
              dom.appendChild(el2, el3);
              var el3 = dom.createElement("span");
              dom.setAttribute(el3, "class", "messageTime");
              var el4 = dom.createComment("");
              dom.appendChild(el3, el4);
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n\n                            ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n                        ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element12 = dom.childAt(fragment, [1]);
              var morphs = new Array(3);
              morphs[0] = dom.createMorphAt(dom.childAt(element12, [1, 1]), 0, 0);
              morphs[1] = dom.createMorphAt(dom.childAt(element12, [3]), 0, 0);
              morphs[2] = dom.createMorphAt(dom.childAt(element12, [5, 1]), 0, 0);
              return morphs;
            },
            statements: [["content", "message.sender_name", ["loc", [null, [67, 57], [67, 80]]]], ["content", "message.message", ["loc", [null, [69, 54], [69, 73]]]], ["content", "message.timestamp", ["loc", [null, [71, 58], [71, 79]]]]],
            locals: [],
            templates: []
          };
        })();
        var child1 = (function () {
          return {
            meta: {
              "revision": "Ember@1.13.12",
              "loc": {
                "source": null,
                "start": {
                  "line": 75,
                  "column": 20
                },
                "end": {
                  "line": 84,
                  "column": 20
                }
              },
              "moduleName": "demoapp/templates/chat.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1, "class", "message me");
              var el2 = dom.createTextNode("\n                            ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("div");
              dom.setAttribute(el2, "class", "messageHeader");
              var el3 = dom.createTextNode("\n                            ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n                            ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("p");
              dom.setAttribute(el2, "class", "messageContent");
              var el3 = dom.createComment("");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n                            ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("div");
              dom.setAttribute(el2, "class", "messageDetails");
              var el3 = dom.createTextNode("\n                                ");
              dom.appendChild(el2, el3);
              var el3 = dom.createElement("span");
              dom.setAttribute(el3, "class", "messageTime");
              var el4 = dom.createComment("");
              dom.appendChild(el3, el4);
              dom.appendChild(el2, el3);
              var el3 = dom.createTextNode("\n                            ");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n                        ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element11 = dom.childAt(fragment, [1]);
              var morphs = new Array(2);
              morphs[0] = dom.createMorphAt(dom.childAt(element11, [3]), 0, 0);
              morphs[1] = dom.createMorphAt(dom.childAt(element11, [5, 1]), 0, 0);
              return morphs;
            },
            statements: [["content", "message.message", ["loc", [null, [79, 54], [79, 73]]]], ["content", "message.timestamp", ["loc", [null, [81, 58], [81, 79]]]]],
            locals: [],
            templates: []
          };
        })();
        return {
          meta: {
            "revision": "Ember@1.13.12",
            "loc": {
              "source": null,
              "start": {
                "line": 63,
                "column": 16
              },
              "end": {
                "line": 85,
                "column": 16
              }
            },
            "moduleName": "demoapp/templates/chat.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [["block", "if", [["subexpr", "neq", [["get", "message.sender_id", ["loc", [null, [64, 31], [64, 48]]]], ["get", "model.curruser.user_id", ["loc", [null, [64, 49], [64, 71]]]]], [], ["loc", [null, [64, 26], [64, 72]]]]], [], 0, 1, ["loc", [null, [64, 20], [84, 27]]]]],
          locals: [],
          templates: [child0, child1]
        };
      })();
      var child1 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "revision": "Ember@1.13.12",
              "loc": {
                "source": null,
                "start": {
                  "line": 87,
                  "column": 20
                },
                "end": {
                  "line": 91,
                  "column": 20
                }
              },
              "moduleName": "demoapp/templates/chat.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1, "class", "message syou");
              var el2 = dom.createTextNode("\n                        ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("img");
              dom.setAttribute(el2, "class", "sticker-icon");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n                    ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element10 = dom.childAt(fragment, [1, 1]);
              var morphs = new Array(1);
              morphs[0] = dom.createAttrMorph(element10, 'src');
              return morphs;
            },
            statements: [["attribute", "src", ["concat", ["http://localhost:8080/chatApplication_war_exploded/uploads/", ["get", "message.file_name", ["loc", [null, [89, 95], [89, 112]]]]]]]],
            locals: [],
            templates: []
          };
        })();
        var child1 = (function () {
          return {
            meta: {
              "revision": "Ember@1.13.12",
              "loc": {
                "source": null,
                "start": {
                  "line": 91,
                  "column": 20
                },
                "end": {
                  "line": 95,
                  "column": 20
                }
              },
              "moduleName": "demoapp/templates/chat.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1, "class", " message sme");
              var el2 = dom.createTextNode("\n                            ");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("img");
              dom.setAttribute(el2, "class", "sticker-icon");
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n                        ");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element9 = dom.childAt(fragment, [1, 1]);
              var morphs = new Array(1);
              morphs[0] = dom.createAttrMorph(element9, 'src');
              return morphs;
            },
            statements: [["attribute", "src", ["concat", ["http://localhost:8080/chatApplication_war_exploded/uploads/", ["get", "message.file_name", ["loc", [null, [93, 99], [93, 116]]]]]]]],
            locals: [],
            templates: []
          };
        })();
        return {
          meta: {
            "revision": "Ember@1.13.12",
            "loc": {
              "source": null,
              "start": {
                "line": 86,
                "column": 16
              },
              "end": {
                "line": 96,
                "column": 16
              }
            },
            "moduleName": "demoapp/templates/chat.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [["block", "if", [["subexpr", "neq", [["get", "message.sender_id", ["loc", [null, [87, 31], [87, 48]]]], ["get", "model.curruser.user_id", ["loc", [null, [87, 49], [87, 71]]]]], [], ["loc", [null, [87, 26], [87, 72]]]]], [], 0, 1, ["loc", [null, [87, 20], [95, 27]]]]],
          locals: [],
          templates: [child0, child1]
        };
      })();
      return {
        meta: {
          "revision": "Ember@1.13.12",
          "loc": {
            "source": null,
            "start": {
              "line": 62,
              "column": 12
            },
            "end": {
              "line": 97,
              "column": 12
            }
          },
          "moduleName": "demoapp/templates/chat.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          morphs[1] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["subexpr", "eq", [["get", "message.dataFormat", ["loc", [null, [63, 26], [63, 44]]]], "Text"], [], ["loc", [null, [63, 22], [63, 52]]]]], [], 0, null, ["loc", [null, [63, 16], [85, 23]]]], ["block", "if", [["subexpr", "eq", [["get", "message.dataFormat", ["loc", [null, [86, 26], [86, 44]]]], "Sticker"], [], ["loc", [null, [86, 22], [86, 55]]]]], [], 1, null, ["loc", [null, [86, 16], [96, 23]]]]],
        locals: ["message"],
        templates: [child0, child1]
      };
    })();
    var child4 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@1.13.12",
            "loc": {
              "source": null,
              "start": {
                "line": 107,
                "column": 16
              },
              "end": {
                "line": 109,
                "column": 16
              }
            },
            "moduleName": "demoapp/templates/chat.hbs"
          },
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.setAttribute(el1, "class", "sticker-icon");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element8 = dom.childAt(fragment, [1]);
            var morphs = new Array(2);
            morphs[0] = dom.createAttrMorph(element8, 'src');
            morphs[1] = dom.createElementMorph(element8);
            return morphs;
          },
          statements: [["attribute", "src", ["concat", [["get", "sticker.url", ["loc", [null, [108, 32], [108, 43]]]]]]], ["element", "action", ["extractSticker", ["get", "sticker.url", ["loc", [null, [108, 94], [108, 105]]]]], [], ["loc", [null, [108, 68], [108, 107]]]]],
          locals: ["sticker"],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@1.13.12",
          "loc": {
            "source": null,
            "start": {
              "line": 105,
              "column": 8
            },
            "end": {
              "line": 111,
              "column": 8
            }
          },
          "moduleName": "demoapp/templates/chat.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "sticker-picker");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          return morphs;
        },
        statements: [["block", "each", [["get", "stickers", ["loc", [null, [107, 24], [107, 32]]]]], [], 0, null, ["loc", [null, [107, 16], [109, 25]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    var child5 = (function () {
      return {
        meta: {
          "revision": "Ember@1.13.12",
          "loc": {
            "source": null,
            "start": {
              "line": 122,
              "column": 16
            },
            "end": {
              "line": 131,
              "column": 16
            }
          },
          "moduleName": "demoapp/templates/chat.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "groupnew");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "avatargrp");
          var el3 = dom.createElement("img");
          dom.setAttribute(el3, "src", "assets/profile.png");
          dom.setAttribute(el3, "alt", "");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          dom.setAttribute(el2, "class", "GroupName");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "GroupDescrp");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("input");
          dom.setAttribute(el2, "type", "checkbox");
          dom.setAttribute(el2, "class", "GroupDescrp");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("hr");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element6 = dom.childAt(fragment, [1]);
          var element7 = dom.childAt(element6, [7]);
          var morphs = new Array(3);
          morphs[0] = dom.createMorphAt(dom.childAt(element6, [3]), 0, 0);
          morphs[1] = dom.createMorphAt(dom.childAt(element6, [5]), 0, 0);
          morphs[2] = dom.createElementMorph(element7);
          return morphs;
        },
        statements: [["content", "message.name", ["loc", [null, [125, 45], [125, 61]]]], ["content", "message.mobile_number", ["loc", [null, [126, 50], [126, 75]]]], ["element", "action", ["addUsertoGroup", ["get", "message.user_id", ["loc", [null, [127, 95], [127, 110]]]]], ["on", "change"], ["loc", [null, [127, 69], [127, 124]]]]],
        locals: ["message"],
        templates: []
      };
    })();
    var child6 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@1.13.12",
            "loc": {
              "source": null,
              "start": {
                "line": 151,
                "column": 20
              },
              "end": {
                "line": 153,
                "column": 20
              }
            },
            "moduleName": "demoapp/templates/chat.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createTextNode("Admin");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "revision": "Ember@1.13.12",
            "loc": {
              "source": null,
              "start": {
                "line": 153,
                "column": 20
              },
              "end": {
                "line": 155,
                "column": 20
              }
            },
            "moduleName": "demoapp/templates/chat.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createTextNode("Member");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child2 = (function () {
        return {
          meta: {
            "revision": "Ember@1.13.12",
            "loc": {
              "source": null,
              "start": {
                "line": 156,
                "column": 24
              },
              "end": {
                "line": 158,
                "column": 20
              }
            },
            "moduleName": "demoapp/templates/chat.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createTextNode("(YOU)");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child3 = (function () {
        var child0 = (function () {
          var child0 = (function () {
            return {
              meta: {
                "revision": "Ember@1.13.12",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 162,
                    "column": 32
                  },
                  "end": {
                    "line": 164,
                    "column": 32
                  }
                },
                "moduleName": "demoapp/templates/chat.hbs"
              },
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("                                    ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("button");
                var el2 = dom.createTextNode("Dismiss as Admin");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var element3 = dom.childAt(fragment, [1]);
                var morphs = new Array(1);
                morphs[0] = dom.createElementMorph(element3);
                return morphs;
              },
              statements: [["element", "action", ["makeAdmin", ["get", "member.user_id", ["loc", [null, [163, 65], [163, 79]]]], false], [], ["loc", [null, [163, 44], [163, 87]]]]],
              locals: [],
              templates: []
            };
          })();
          var child1 = (function () {
            return {
              meta: {
                "revision": "Ember@1.13.12",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 164,
                    "column": 32
                  },
                  "end": {
                    "line": 166,
                    "column": 32
                  }
                },
                "moduleName": "demoapp/templates/chat.hbs"
              },
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("                                    ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("button");
                var el2 = dom.createTextNode("Make as Admin");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var element2 = dom.childAt(fragment, [1]);
                var morphs = new Array(1);
                morphs[0] = dom.createElementMorph(element2);
                return morphs;
              },
              statements: [["element", "action", ["makeAdmin", ["get", "member.user_id", ["loc", [null, [165, 65], [165, 79]]]], true], [], ["loc", [null, [165, 44], [165, 86]]]]],
              locals: [],
              templates: []
            };
          })();
          return {
            meta: {
              "revision": "Ember@1.13.12",
              "loc": {
                "source": null,
                "start": {
                  "line": 160,
                  "column": 28
                },
                "end": {
                  "line": 167,
                  "column": 28
                }
              },
              "moduleName": "demoapp/templates/chat.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("button");
              var el2 = dom.createTextNode("Remove");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element4 = dom.childAt(fragment, [1]);
              var morphs = new Array(2);
              morphs[0] = dom.createElementMorph(element4);
              morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
              dom.insertBoundary(fragment, null);
              return morphs;
            },
            statements: [["element", "action", ["ExitGroup", ["get", "member.user_id", ["loc", [null, [161, 61], [161, 75]]]]], [], ["loc", [null, [161, 40], [161, 77]]]], ["block", "if", [["get", "member.isAdmin", ["loc", [null, [162, 39], [162, 53]]]]], [], 0, 1, ["loc", [null, [162, 32], [166, 39]]]]],
            locals: [],
            templates: [child0, child1]
          };
        })();
        return {
          meta: {
            "revision": "Ember@1.13.12",
            "loc": {
              "source": null,
              "start": {
                "line": 159,
                "column": 24
              },
              "end": {
                "line": 168,
                "column": 24
              }
            },
            "moduleName": "demoapp/templates/chat.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [["block", "if", [["subexpr", "neq", [["get", "model.curruser.user_id", ["loc", [null, [160, 39], [160, 61]]]], ["get", "member.user_id", ["loc", [null, [160, 62], [160, 76]]]]], [], ["loc", [null, [160, 34], [160, 77]]]]], [], 0, null, ["loc", [null, [160, 28], [167, 35]]]]],
          locals: [],
          templates: [child0]
        };
      })();
      return {
        meta: {
          "revision": "Ember@1.13.12",
          "loc": {
            "source": null,
            "start": {
              "line": 146,
              "column": 12
            },
            "end": {
              "line": 172,
              "column": 12
            }
          },
          "moduleName": "demoapp/templates/chat.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "groupnew");
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "avatargrp");
          var el3 = dom.createElement("img");
          dom.setAttribute(el3, "src", "assets/profile.png");
          dom.setAttribute(el3, "alt", "");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          dom.setAttribute(el2, "class", "GroupName");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("hr");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element5 = dom.childAt(fragment, [1]);
          var morphs = new Array(5);
          morphs[0] = dom.createMorphAt(dom.childAt(element5, [3]), 0, 0);
          morphs[1] = dom.createMorphAt(dom.childAt(element5, [5]), 0, 0);
          morphs[2] = dom.createMorphAt(element5, 7, 7);
          morphs[3] = dom.createMorphAt(element5, 8, 8);
          morphs[4] = dom.createMorphAt(element5, 9, 9);
          return morphs;
        },
        statements: [["content", "member.name", ["loc", [null, [149, 41], [149, 56]]]], ["content", "member.mobile_number", ["loc", [null, [150, 35], [150, 59]]]], ["block", "if", [["get", "member.isAdmin", ["loc", [null, [151, 26], [151, 40]]]]], [], 0, 1, ["loc", [null, [151, 20], [155, 27]]]], ["block", "if", [["subexpr", "eq", [["get", "model.curruser.user_id", ["loc", [null, [156, 34], [156, 56]]]], ["get", "member.user_id", ["loc", [null, [156, 58], [156, 72]]]]], [], ["loc", [null, [156, 30], [156, 73]]]]], [], 2, null, ["loc", [null, [156, 24], [158, 27]]]], ["block", "if", [["get", "isAdmin", ["loc", [null, [159, 30], [159, 37]]]]], [], 3, null, ["loc", [null, [159, 24], [168, 31]]]]],
        locals: ["member"],
        templates: [child0, child1, child2, child3]
      };
    })();
    var child7 = (function () {
      return {
        meta: {
          "revision": "Ember@1.13.12",
          "loc": {
            "source": null,
            "start": {
              "line": 184,
              "column": 16
            },
            "end": {
              "line": 193,
              "column": 16
            }
          },
          "moduleName": "demoapp/templates/chat.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "groupnew");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "avatargrp");
          var el3 = dom.createElement("img");
          dom.setAttribute(el3, "src", "assets/profile.png");
          dom.setAttribute(el3, "alt", "");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          dom.setAttribute(el2, "class", "");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("input");
          dom.setAttribute(el2, "type", "checkbox");
          dom.setAttribute(el2, "class", "GroupDescrp");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("hr");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [7]);
          var morphs = new Array(3);
          morphs[0] = dom.createMorphAt(dom.childAt(element0, [3]), 0, 0);
          morphs[1] = dom.createMorphAt(dom.childAt(element0, [5]), 0, 0);
          morphs[2] = dom.createElementMorph(element1);
          return morphs;
        },
        statements: [["content", "member.name", ["loc", [null, [187, 36], [187, 51]]]], ["content", "member.mobile_number", ["loc", [null, [188, 39], [188, 63]]]], ["element", "action", ["addUsertoGroup", ["get", "member.user_id", ["loc", [null, [189, 95], [189, 109]]]]], ["on", "change"], ["loc", [null, [189, 69], [189, 123]]]]],
        locals: ["member"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@1.13.12",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 203,
            "column": 7
          }
        },
        "moduleName": "demoapp/templates/chat.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("link");
        dom.setAttribute(el1, "rel", "stylesheet");
        dom.setAttribute(el1, "href", "assets/chat.css");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("link");
        dom.setAttribute(el1, "rel", "stylesheet");
        dom.setAttribute(el1, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("main");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "sideNav1");
        var el3 = dom.createTextNode("\n\n\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "sideNav2");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "SideNavhead");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h2");
        var el5 = dom.createTextNode(" Welcome ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("input");
        dom.setAttribute(el4, "type", "hidden");
        dom.setAttribute(el4, "id", "curruserid");
        dom.setAttribute(el4, "name", "curruserid");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "icon-container");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("i");
        dom.setAttribute(el5, "class", "fas fa-sign-out-alt logout-icon");
        dom.setAttribute(el5, "title", "Logout");
        var el6 = dom.createTextNode(">");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("i");
        dom.setAttribute(el5, "class", "fas fa-users create-group-icon");
        dom.setAttribute(el5, "title", "Create Group");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "empty-page");
        var el3 = dom.createTextNode("\n\n\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("section");
        dom.setAttribute(el2, "class", "Chat");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "ChatHead");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4, "class", "chatDetails");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("img");
        dom.setAttribute(el5, "src", "assets/profile.png");
        dom.setAttribute(el5, "alt", "");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5, "class", "recevName");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "grpOperations");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("hr");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "MessageContainer");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "messageCenter");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("form");
        dom.setAttribute(el4, "id", "MessageForm");
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("input");
        dom.setAttribute(el5, "type", "text");
        dom.setAttribute(el5, "id", "MessageInput");
        dom.setAttribute(el5, "name", "MessageInput");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        var el6 = dom.createTextNode("stickers");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "submit");
        dom.setAttribute(el5, "class", "Send");
        var el6 = dom.createTextNode("send");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("section");
        dom.setAttribute(el2, "class", "createGroup");
        var el3 = dom.createTextNode("\n\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "grp-field");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "for", "grpName");
        var el6 = dom.createTextNode("Group Name: ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("input");
        dom.setAttribute(el5, "type", "text");
        dom.setAttribute(el5, "name", "grpNmae");
        dom.setAttribute(el5, "id", "grpName");
        dom.setAttribute(el5, "required", "");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "grp-field");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h3");
        var el6 = dom.createTextNode("Add Members");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "button-container");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "submit");
        dom.setAttribute(el5, "class", "submit-button");
        var el6 = dom.createTextNode("Create Group");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("section");
        dom.setAttribute(el2, "class", "ViewGrpMember");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "viewHeader");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h1");
        var el5 = dom.createTextNode("Group Members");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("br");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        var el5 = dom.createTextNode("Close");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("br");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("section");
        dom.setAttribute(el2, "class", "addMembers");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "viewHeader");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h1");
        var el6 = dom.createTextNode("Add Members");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("br");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        var el6 = dom.createTextNode("Close");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("br");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "grp-field");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "button-container");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "submit");
        dom.setAttribute(el5, "class", "submit-button");
        var el6 = dom.createTextNode("Add Members");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element18 = dom.childAt(fragment, [4]);
        var element19 = dom.childAt(element18, [3]);
        var element20 = dom.childAt(element19, [1]);
        var element21 = dom.childAt(element20, [3]);
        var element22 = dom.childAt(element20, [5]);
        var element23 = dom.childAt(element22, [1]);
        var element24 = dom.childAt(element22, [3]);
        var element25 = dom.childAt(element18, [7]);
        var element26 = dom.childAt(element25, [1]);
        var element27 = dom.childAt(element25, [7]);
        var element28 = dom.childAt(element27, [1]);
        var element29 = dom.childAt(element28, [3]);
        var element30 = dom.childAt(element18, [9, 1]);
        var element31 = dom.childAt(element18, [11]);
        var element32 = dom.childAt(element31, [1, 4]);
        var element33 = dom.childAt(element31, [4]);
        var element34 = dom.childAt(element18, [13, 1]);
        var element35 = dom.childAt(element34, [1, 4]);
        var morphs = new Array(20);
        morphs[0] = dom.createMorphAt(dom.childAt(element20, [1]), 1, 1);
        morphs[1] = dom.createAttrMorph(element21, 'value');
        morphs[2] = dom.createElementMorph(element23);
        morphs[3] = dom.createElementMorph(element24);
        morphs[4] = dom.createMorphAt(element19, 3, 3);
        morphs[5] = dom.createMorphAt(element19, 4, 4);
        morphs[6] = dom.createMorphAt(dom.childAt(element26, [1, 3]), 0, 0);
        morphs[7] = dom.createMorphAt(dom.childAt(element26, [3]), 1, 1);
        morphs[8] = dom.createMorphAt(dom.childAt(element25, [5]), 3, 3);
        morphs[9] = dom.createElementMorph(element28);
        morphs[10] = dom.createElementMorph(element29);
        morphs[11] = dom.createMorphAt(element27, 3, 3);
        morphs[12] = dom.createElementMorph(element30);
        morphs[13] = dom.createMorphAt(dom.childAt(element30, [3]), 3, 3);
        morphs[14] = dom.createElementMorph(element32);
        morphs[15] = dom.createElementMorph(element33);
        morphs[16] = dom.createMorphAt(element33, 1, 1);
        morphs[17] = dom.createElementMorph(element34);
        morphs[18] = dom.createElementMorph(element35);
        morphs[19] = dom.createMorphAt(dom.childAt(element34, [4]), 1, 1);
        return morphs;
      },
      statements: [["content", "model.curruser.name", ["loc", [null, [10, 25], [10, 48]]]], ["attribute", "value", ["concat", [["get", "model.curruser.user_id", ["loc", [null, [11, 42], [11, 64]]]]]]], ["element", "action", ["logout"], [], ["loc", [null, [13, 74], [13, 94]]]], ["element", "action", ["showGrpCreate"], ["on", "click"], ["loc", [null, [14, 79], [14, 116]]]], ["block", "each", [["get", "model.users", ["loc", [null, [17, 12], [17, 23]]]]], [], 0, null, ["loc", [null, [17, 4], [25, 13]]]], ["block", "each", [["get", "model.groups", ["loc", [null, [26, 16], [26, 28]]]]], [], 1, null, ["loc", [null, [26, 8], [34, 17]]]], ["content", "selectedUsername", ["loc", [null, [47, 37], [47, 57]]]], ["block", "if", [["get", "isGroup", ["loc", [null, [50, 22], [50, 29]]]]], [], 2, null, ["loc", [null, [50, 16], [56, 23]]]], ["block", "each", [["get", "AllMessage", ["loc", [null, [62, 20], [62, 30]]]]], [], 3, null, ["loc", [null, [62, 12], [97, 21]]]], ["element", "action", [["subexpr", "if", [["get", "isGroup", ["loc", [null, [100, 44], [100, 51]]]], "SendMessageOnGroup", "sendMessage"], [], ["loc", [null, [100, 40], [100, 87]]]]], ["on", "submit"], ["loc", [null, [100, 31], [100, 102]]]], ["element", "action", ["openStickerPicker"], [], ["loc", [null, [102, 34], [102, 64]]]], ["block", "if", [["get", "showStickerPicker", ["loc", [null, [105, 14], [105, 31]]]]], [], 4, null, ["loc", [null, [105, 8], [111, 15]]]], ["element", "action", ["CreateNewGroup", ["get", "model.curruser.user_id", ["loc", [null, [116, 40], [116, 62]]]]], ["on", "submit"], ["loc", [null, [116, 14], [116, 77]]]], ["block", "each", [["get", "model.users", ["loc", [null, [122, 24], [122, 35]]]]], [], 5, null, ["loc", [null, [122, 16], [131, 25]]]], ["element", "action", ["closeViewMember"], ["on", "click"], ["loc", [null, [142, 20], [142, 59]]]], ["element", "action", ["RemoveMember", ["get", "model.curruser.user_id", ["loc", [null, [145, 38], [145, 60]]]]], ["on", "submit"], ["loc", [null, [145, 14], [145, 75]]]], ["block", "each", [["get", "ViewGrpMembers", ["loc", [null, [146, 20], [146, 34]]]]], [], 6, null, ["loc", [null, [146, 12], [172, 21]]]], ["element", "action", ["addNewMember"], ["on", "submit"], ["loc", [null, [178, 14], [178, 53]]]], ["element", "action", ["closeViewMember"], ["on", "click"], ["loc", [null, [181, 24], [181, 63]]]], ["block", "each", [["get", "ViewGrpMembers", ["loc", [null, [184, 24], [184, 38]]]]], [], 7, null, ["loc", [null, [184, 16], [193, 25]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5, child6, child7]
    };
  })());
});
define("demoapp/templates/login", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@1.13.12",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 15,
            "column": 0
          }
        },
        "moduleName": "demoapp/templates/login.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("link");
        dom.setAttribute(el1, "rel", "stylesheet");
        dom.setAttribute(el1, "href", "assets/login.css");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "login-container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Login");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("form");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "mobile");
        var el4 = dom.createTextNode("Mobile Number");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "number");
        dom.setAttribute(el3, "id", "user-mb");
        dom.setAttribute(el3, "name", "user-mb");
        dom.setAttribute(el3, "placeholder", "Enter Mobile Number");
        dom.setAttribute(el3, "pattern", "\\d{10}");
        dom.setAttribute(el3, "maxlength", "10");
        dom.setAttribute(el3, "required", "");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "password");
        var el4 = dom.createTextNode("Password");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "password");
        dom.setAttribute(el3, "id", "user-pass");
        dom.setAttribute(el3, "name", "user-pass");
        dom.setAttribute(el3, "placeholder", "Enter Password");
        dom.setAttribute(el3, "required", "");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3, "type", "submit");
        var el4 = dom.createTextNode("Login");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2, "href", "/signup");
        var el3 = dom.createTextNode("Signup?");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [2, 3]);
        var morphs = new Array(1);
        morphs[0] = dom.createElementMorph(element0);
        return morphs;
      },
      statements: [["element", "action", ["login"], ["on", "submit"], ["loc", [null, [4, 8], [4, 38]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("demoapp/templates/signup", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@1.13.12",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 21,
            "column": 0
          }
        },
        "moduleName": "demoapp/templates/signup.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("link");
        dom.setAttribute(el1, "rel", "stylesheet");
        dom.setAttribute(el1, "href", "assets/signup.css");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "signup-container");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Sign Up");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("form");
        var el3 = dom.createTextNode("\n    \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "name");
        var el4 = dom.createTextNode("Name");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "text");
        dom.setAttribute(el3, "id", "user-name");
        dom.setAttribute(el3, "name", "user-name");
        dom.setAttribute(el3, "placeholder", "Enter your name");
        dom.setAttribute(el3, "required", "");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "mobile");
        var el4 = dom.createTextNode("Mobile Number");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "number");
        dom.setAttribute(el3, "id", "user-mobile");
        dom.setAttribute(el3, "name", "user-mobile");
        dom.setAttribute(el3, "placeholder", "Enter your mobile number");
        dom.setAttribute(el3, "maxlength", "10");
        dom.setAttribute(el3, "required", "");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("    <label for=\"profile-pic\">Profile Picture</label>");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("    <input type=\"file\" id=\"profile-pic\"  accept=\"image/*\">");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "password");
        var el4 = dom.createTextNode("Password");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "password");
        dom.setAttribute(el3, "id", "user-pass");
        dom.setAttribute(el3, "placeholder", "Enter your password");
        dom.setAttribute(el3, "required", "");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3, "type", "submit");
        var el4 = dom.createTextNode("Sign Up");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [2, 3]);
        var morphs = new Array(1);
        morphs[0] = dom.createElementMorph(element0);
        return morphs;
      },
      statements: [["element", "action", ["signup"], ["on", "submit"], ["loc", [null, [4, 8], [4, 42]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("demoapp/utils/crypto", ["exports", "ember"], function (exports, _ember) {
    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    var CryptoUtils = {
        generateRSAKeys: function generateRSAKeys() {
            return new Promise(function (resolve, reject) {
                window.crypto.subtle.generateKey({
                    name: "RSA-OAEP",
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256"
                }, true, ["encrypt", "decrypt"]).then(function (keyPair) {
                    return Promise.all([window.crypto.subtle.exportKey("spki", keyPair.publicKey), window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey)]).then(function (keys) {
                        var publicKey = btoa(String.fromCharCode.apply(null, new Uint8Array(keys[0])));
                        var privateKey = btoa(String.fromCharCode.apply(null, new Uint8Array(keys[1])));

                        resolve({
                            publicKey: publicKey,
                            privateKey: privateKey
                        });
                    });
                })["catch"](reject);
            });
        },

        generateAESKey: function generateAESKey() {
            return new Promise(function (resolve, reject) {
                window.crypto.subtle.generateKey({
                    name: "AES-GCM",
                    length: 128
                }, true, ["encrypt", "decrypt"]).then(function (key) {
                    window.crypto.subtle.exportKey("raw", key).then(function (exportedKey) {
                        resolve(new Uint8Array(exportedKey));
                    })["catch"](reject);
                })["catch"](reject);
            });
        },

        importAESKey: function importAESKey(keyBase64) {
            return new _ember["default"].RSVP.Promise(function (resolve, reject) {
                try {
                    var rawKey = new Uint8Array(keyBase64);

                    window.crypto.subtle.importKey("raw", keyBase64, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]).then(resolve)["catch"](reject);
                } catch (error) {
                    reject(error);
                }
            });
        },

        encryptAESKey: function encryptAESKey(aesKey, publicKey) {
            return new Promise(function (resolve, reject) {
                var decodedKey = Uint8Array.from(atob(publicKey), function (c) {
                    return c.charCodeAt(0);
                });

                window.crypto.subtle.importKey("spki", decodedKey, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]).then(function (importedKey) {
                    return window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, importedKey, aesKey);
                }).then(function (encryptedKey) {
                    var encryptedStr = btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedKey)));
                    resolve(encryptedStr);
                })["catch"](reject);
            });
        },

        decryptAESKey: function decryptAESKey(encryptedAESKey, privateKey) {

            return new Promise(function (resolve, reject) {
                var decodedPrivateKey = new Uint8Array(atob(privateKey).split("").map(function (c) {
                    return c.charCodeAt(0);
                }));
                window.crypto.subtle.importKey("pkcs8", decodedPrivateKey, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]).then(function (importedPrivateKey) {
                    console.log(importedPrivateKey);
                    var decodedAESKey = new Uint8Array(atob(encryptedAESKey).split("").map(function (c) {
                        return c.charCodeAt(0);
                    }));
                    return window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, importedPrivateKey, decodedAESKey);
                }).then(function (decryptedAESKeyBuffer) {

                    console.log(decryptedAESKeyBuffer);

                    return window.crypto.subtle.importKey("raw", decryptedAESKeyBuffer, { name: "AES-GCM" }, true, ["decrypt"]);
                }).then(function (aesKey) {
                    console.log(aesKey);
                    resolve(aesKey);
                })["catch"](reject);
            });
        },

        encryptMessage: function encryptMessage(message, aesKey) {

            return new Promise(function (resolve, reject) {
                var iv = window.crypto.getRandomValues(new Uint8Array(12));
                window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, aesKey, new TextEncoder().encode(message)).then(function (encrypted) {
                    resolve({
                        ciphertext: btoa(String.fromCharCode.apply(String, _toConsumableArray(new Uint8Array(encrypted)))),
                        iv: btoa(String.fromCharCode.apply(String, _toConsumableArray(iv)))
                    });
                })["catch"](reject);
            });
        },

        decryptMessage: function decryptMessage(message, aesKey, rsaKey, iv) {
            return this.decryptAESKey(aesKey, rsaKey).then(function (daesKey) {
                var encryptedMessage = new Uint8Array(atob(message).split("").map(function (c) {
                    return c.charCodeAt(0);
                }));
                var iv_new = new Uint8Array(atob(iv).split("").map(function (c) {
                    return c.charCodeAt(0);
                }));
                return window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv_new }, daesKey, encryptedMessage);
            }).then(function (decryptedMessageBuffer) {
                var msg = new TextDecoder().decode(decryptedMessageBuffer);
                return msg;
            })["catch"](function (error) {
                console.error("Decryption failed:", error);
                throw error;
            });
        },
        // -------------------------------------------------------------------------------------------------------------------------------
        generateECDHKeyPair: function generateECDHKeyPair() {
            return new Promise(function (resolve, reject) {
                window.crypto.subtle.generateKey({
                    name: "ECDH",
                    namedCurve: "P-256"
                }, true, ["deriveKey"]).then(function (keyPair) {
                    var publicKeyPromise = window.crypto.subtle.exportKey("spki", keyPair.publicKey);
                    var privateKeyPromise = window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

                    _ember["default"].RSVP.all([publicKeyPromise, privateKeyPromise]).then(function (keys) {
                        var publicKey = btoa(String.fromCharCode.apply(String, _toConsumableArray(new Uint8Array(keys[0]))));
                        var privateKey = btoa(String.fromCharCode.apply(String, _toConsumableArray(new Uint8Array(keys[1]))));

                        resolve({
                            publicKey: publicKey,
                            privateKey: privateKey
                        });
                    })["catch"](reject);
                })["catch"](reject);
            });
        },
        deriveSharedKey: function deriveSharedKey(privatekey, grpPublicKey) {
            alert(privatekey);
            var privateKeyBytes = Uint8Array.from(atob(privatekey), function (c) {
                return c.charCodeAt(0);
            }).buffer;
            var publicKeyBytes = Uint8Array.from(atob(grpPublicKey), function (c) {
                return c.charCodeAt(0);
            }).buffer;
            return window.crypto.subtle.importKey("pkcs8", privateKeyBytes, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]).then(function (privateKey) {
                return window.crypto.subtle.importKey("spki", publicKeyBytes, { name: "ECDH", namedCurve: "P-256" }, false, []).then(function (publicKey) {
                    return window.crypto.subtle.deriveKey({ name: "ECDH", "public": publicKey }, privateKey, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
                });
            })["catch"](function (error) {
                console.error("Error deriving shared key:", error);
                return null;
            });
        },
        encryptAESKeyForGroup: function encryptAESKeyForGroup(sharedKey, aesKey) {
            // var base64Key = btoa(sharedKey);
            // alert(base64Key);
            console.log("Shared Key:", sharedKey);
            var iv = window.crypto.getRandomValues(new Uint8Array(12));
            return window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, sharedKey, aesKey).then(function (encryptedAESKey) {
                console.log(encryptedAESKey);
                return {
                    encryptedAESKey: btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedAESKey))),
                    iv: btoa(String.fromCharCode.apply(null, iv))
                };
            })["catch"](function (error) {
                console.error("Error encrypting AES key:", error);
                return null;
            });
        },
        decryptAESKeyForGroup: function decryptAESKeyForGroup(sharedKey, encryptedAESKeyBase64, ivBase64) {
            console.log(encryptedAESKeyBase64);
            console.log(ivBase64);
            return new _ember["default"].RSVP.Promise(function (resolve, reject) {
                var encryptedAESKey = new Uint8Array(atob(encryptedAESKeyBase64).split("").map(function (c) {
                    return c.charCodeAt(0);
                }));
                var iv = new Uint8Array(atob(ivBase64).split("").map(function (c) {
                    return c.charCodeAt(0);
                }));
                console.log(encryptedAESKey);
                console.log(iv);

                window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, sharedKey, encryptedAESKey).then(function (decryptedAESKeyBuffer) {
                    alert("fuck");
                    return window.crypto.subtle.importKey("raw", decryptedAESKeyBuffer, { name: "AES-GCM" }, false, ["decrypt"]);
                }).then(resolve)["catch"](reject);
            });
        }

    };

    exports["default"] = CryptoUtils;
});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('demoapp/config/environment', ['ember'], function(Ember) {
  var prefix = 'demoapp';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (!runningTests) {
  require("demoapp/app")["default"].create({"name":"demoapp","version":"0.0.0+dbc3bdb1"});
}

/* jshint ignore:end */
//# sourceMappingURL=demoapp.map