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
define("demoapp/controllers/chat", ["exports", "ember", "demoapp/utils/crypto", "demoapp/services/storage-service", "demoapp/config/environment"], function (exports, _ember, _demoappUtilsCrypto, _demoappServicesStorageService, _demoappConfigEnvironment) {
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
        grpMembersencAESKeys: _ember["default"].A(),
        isGroup: false,
        isAdmin: false,
        ViewGrpMembers: _ember["default"].A(),
        showStickerPicker: false,
        forkNewMembers: _ember["default"].A(),
        forkOldMembers: _ember["default"].A(),
        forkID: null,
        tempfork: _ember["default"].A(),
        forkedmsg: null,
        secretKey: null,
        newForkMemberMessages: _ember["default"].A(),
        forkKeys: _ember["default"].A(),
        newMembersForFork: _ember["default"].A(),
        currentStatus: null,
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
                var socket = new WebSocket("wss://localhost:8443/chatApplication_war_exploded/LiveChat/" + this.sender_id);
                socket.onopen = function () {
                    return console.log('WebSocket Connected');
                };
                socket.onmessage = function (event) {
                    var receivedMessage = JSON.parse(event.data);
                    var msg_pack = undefined;
                    if (receivedMessage.dataFormat === "status_update") {
                        var user = self.get('model.users').findBy('user_id', receivedMessage.user_id);
                        if (user) {
                            _ember["default"].set(user, 'status', receivedMessage.status);
                        }
                    } else if (receivedMessage.dataFormat === "Text") {
                        _demoappServicesStorageService["default"].getPrivateKey(self.get('sender_id')).then(function (privateKey) {
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
                        var imageUrl = "https://localhost:8443/chatApplication_war_exploded/RetriveFile?file_name=" + encodeURIComponent(receivedMessage.file_name);
                        msg_pack = {
                            sender_id: receivedMessage.sender_id,
                            file_name: imageUrl,
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
                self.set('currentStatus', receiver.status === "online" ? receiver.status : receiver.last_seen);
                self.set('selectedUsername', receiver.name);
                self.get('AllMessage').clear();
                self.get('ViewGrpMembers').clear();
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + 'FetchchatServlet',
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
                        _demoappServicesStorageService["default"].getPrivateKey(self.get('sender_id')).then(function (privateKey) {
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
                                                            mess_id: msg.mess_id,
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
                                            var imageUrl = "https://localhost:8443/chatApplication_war_exploded/RetriveFile?file_name=" + encodeURIComponent(msg.file_name);

                                            var stickerPromise = _ember["default"].RSVP.resolve({
                                                mess_id: msg.mess_id,
                                                sender_id: msg.sender_id,
                                                file_name: imageUrl,
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
                                console.log(response.messages);
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
                                                        mess_id: msg.mess_id,
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
                                            var imageUrl = "https://localhost:8443/chatApplication_war_exploded/RetriveFile?file_name=" + encodeURIComponent(msg.file_name);

                                            var stickerPromise = _ember["default"].RSVP.resolve({
                                                mess_id: msg.mess_id,
                                                sender_id: msg.sender_id,
                                                file_name: imageUrl,
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
                        _demoappUtilsCrypto["default"].generateAESKey().then(function (aesKey) {
                            var receiverPublicKey = response.key;
                            var ownPublicKey = self.get('rsaPubown');
                            self.set('AESkey', aesKey);
                            self.set('rsapubkey', receiverPublicKey);
                            if (chat === "Private") {
                                _demoappUtilsCrypto["default"].encryptAESKey(aesKey, receiverPublicKey).then(function (encryptedAESKey) {
                                    self.set('Ekey', encryptedAESKey);
                                })["catch"](function (error) {
                                    console.error("Error encrypting AES Key:", error);
                                });
                            }
                            _demoappUtilsCrypto["default"].encryptAESKey(aesKey, ownPublicKey).then(function (encryptedAESKey) {
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
            closeCreateGrp: function closeCreateGrp() {
                _ember["default"].$(".Chat").css("display", "none");
                _ember["default"].$("ViewMember").css("display", "none");
                _ember["default"].$(".createGroup").css("display", "none");
                _ember["default"].$(".empty-page").css("display", "block");
            },
            addUsertoGroup: function addUsertoGroup(user_id) {
                if (event.target.checked) {
                    this.get('groupMembers').pushObject(user_id);
                } else {
                    this.get('groupMembers').removeObject(user_id);
                }
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
                    url: _demoappConfigEnvironment["default"].apiHost + 'CreateNewGroup',
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
                    url: _demoappConfigEnvironment["default"].apiHost + 'FetchGroupMembersKey',
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
                self.get('AllMessage').pushObject({ sender_id: sender_id, message: message, dataFormat: "Text", timestamp: time });
            },

            ExitGroup: function ExitGroup(member_id) {
                var self = this;
                var member_details = {
                    member_id: member_id,
                    grp_id: self.get('receiver_id')
                };
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + 'ExitGroupServlet',
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
            OpenViweMember: function OpenViweMember() {
                var self = this;
                _ember["default"].$(".empty-page").css("display", "none");
                _ember["default"].$(".Chat").css("display", "none");
                _ember["default"].$(".createGroup").css("display", "none");
                _ember["default"].$(".addMembers").css("display", "none");
                _ember["default"].$(".ViewGrpMember").css("display", "block");
                self.send("ViewMembers", self.get('receiver_id'));
            },
            ViewMembers: function ViewMembers(grp_id) {
                var self = this;
                self.get('ViewGrpMembers').clear();

                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + 'FetchGroupMembers',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    xhrFields: { withCredentials: true },
                    data: JSON.stringify({ grp_id: grp_id }),
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
                    url: _demoappConfigEnvironment["default"].apiHost + 'RoleChange',
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
                    url: _demoappConfigEnvironment["default"].apiHost + 'FetchUsers',
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
                    url: _demoappConfigEnvironment["default"].apiHost + 'AddNewMembers',
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
                    url: _demoappConfigEnvironment["default"].apiHost + 'FilesHandling',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        var imageUrl = "https://localhost:8443/chatApplication_war_exploded/RetriveFile?file_name=" + encodeURIComponent(response.file_name);

                        var sticker_details = {
                            sender_id: self.get('sender_id'),
                            file_name: response.file_name,
                            dataFormat: "Sticker",
                            type: self.get('isGroup') ? 'Group' : 'Private',
                            sender_name: self.get('model.curruser.name')
                        };
                        var sticker_details1 = {
                            sender_id: self.get('sender_id'),
                            file_name: imageUrl,
                            dataFormat: "Sticker",
                            type: self.get('isGroup') ? 'Group' : 'Private',
                            sender_name: self.get('model.curruser.name')
                        };

                        sticker_details[self.get('isGroup') ? 'grp_id' : 'receiver_id'] = self.get('receiver_id');
                        if (socket) {
                            socket.send(JSON.stringify(sticker_details));
                        }
                        self.get('AllMessage').pushObject(sticker_details1);
                    },
                    error: function error(_error8) {
                        console.log(_error8);
                    }

                });
            },
            addUserToFork: function addUserToFork(user_id) {
                if (event.target.checked) {
                    this.get('forkNewMembers').pushObject(user_id);
                } else {
                    this.get('forkNewMembers').removeObject(user_id);
                }
            },
            ForkMessage: function ForkMessage(message) {
                var self = this;
                self.get('newMembersForFork').clear();
                var isGroup = self.get('isGroup');
                var url = isGroup ? _demoappConfigEnvironment["default"].apiHost + "FetchUsers" : _demoappConfigEnvironment["default"].apiHost + "FetchNewUsersForFork";
                var datas = {
                    grp_id: self.get('receiver_id')
                };
                _ember["default"].$.ajax({
                    url: url,
                    type: 'POST',
                    data: JSON.stringify(datas),
                    contentType: 'json',
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        var _iteratorNormalCompletion5 = true;
                        var _didIteratorError5 = false;
                        var _iteratorError5 = undefined;

                        try {
                            for (var _iterator5 = response.users[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                var user = _step5.value;

                                self.get('newMembersForFork').pushObject(user);
                            }
                        } catch (err) {
                            _didIteratorError5 = true;
                            _iteratorError5 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                                    _iterator5["return"]();
                                }
                            } finally {
                                if (_didIteratorError5) {
                                    throw _iteratorError5;
                                }
                            }
                        }
                    },
                    error: function error(_error9) {
                        console.log(_error9);
                    }

                });

                _ember["default"].$(".createGroup").css("display", "none");
                _ember["default"].$(".ViewGrpMember").css("display", "none");
                _ember["default"].$(".addMembers").css("display", "none");
                _ember["default"].$(".Chat").css("display", "none");
                _ember["default"].$(".forkmsg").css("display", "block");
                document.getElementById("fork-sender").textContent = message.sender_name;
                document.getElementById("fork-msg").textContent = message.message;
                document.getElementById("fork-time").textContent = message.timestamp;
                self.set('forkedmsg', message);
            },
            CreatForkMessage: function CreatForkMessage() {
                var self = this;
                self.get('ViewGrpMembers').clear();
                var chatName = document.getElementById('chat-title').value;
                var isGroup = self.get('isGroup');
                var sender_id = self.get('sender_id');
                var receiver_id = self.get('receiver_id');
                var forkOldMembers = self.get('forkOldMembers');
                var forkNewMembers = self.get('forkNewMembers');
                var forkKeys = self.get('forkKeys');
                var isChecked = _ember["default"].$("#all").prop("checked");
                var response_data = undefined;

                var getMembersPromise = Promise.resolve();

                if (isGroup && isChecked) {
                    self.send("ViewMembers", receiver_id);
                    getMembersPromise = new Promise(function (resolve) {
                        _ember["default"].run.later(function () {
                            var ViewGrpMembers = self.get('ViewGrpMembers');
                            if (ViewGrpMembers && ViewGrpMembers.length) {
                                ViewGrpMembers.forEach(function (member) {
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

                return getMembersPromise.then(function () {
                    var tempfork = forkNewMembers.concat(forkOldMembers);
                    forkOldMembers.pushObject(sender_id);
                    self.set('tempfork', tempfork);

                    var msg_pack = {
                        name: chatName,
                        Admin_id: sender_id,
                        grpMembers: tempfork
                    };

                    // 1️⃣ Create new group chat
                    return _ember["default"].$.ajax({
                        url: _demoappConfigEnvironment["default"].apiHost + 'CreateNewGroup',
                        type: 'POST',
                        data: JSON.stringify(msg_pack),
                        xhrFields: { withCredentials: true }
                    });
                }).then(function (response) {
                    self.set('forkID', response.grp_id);
                    return _ember["default"].$.ajax({
                        url: _demoappConfigEnvironment["default"].apiHost + 'FetchMessageFork',
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
                }).then(function (response) {
                    response_data = response;
                    self.send('ViewMembers', self.get('forkID'));

                    return new Promise(function (resolve) {
                        _ember["default"].run.later(function () {
                            var ViewGrpMembers = self.get('ViewGrpMembers');
                            console.log("ViewGrpMembers After Fix:", ViewGrpMembers);
                            resolve(ViewGrpMembers);
                        }, 500);
                    });
                }).then(function (ViewGrpMembers) {
                    return _demoappServicesStorageService["default"].getPrivateKey(self.get('sender_id')).then(function (RSAPrivateKey) {
                        self.set('secretKey', RSAPrivateKey);
                        console.log(ViewGrpMembers);
                        console.log("ViewGrpMembers Length:", ViewGrpMembers.length);

                        var encryptionPromises = [];
                        self.set('newForkMemberMessages', []);

                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                            var _loop3 = function () {
                                var msg = _step6.value;

                                var promises = [];
                                var forkKeys = [];

                                _iteratorNormalCompletion7 = true;
                                _didIteratorError7 = false;
                                _iteratorError7 = undefined;

                                try {
                                    var _loop4 = function () {
                                        var member = _step7.value;

                                        if (!forkOldMembers.includes(member.user_id)) {
                                            var key = isGroup ? msg.enc_aes_key : msg.sender_id === sender_id ? msg.aes_key_sender : msg.aes_key_receiver;
                                            console.log(member.rsa_public_key);
                                            var promise = _demoappUtilsCrypto["default"].decryptAESKey(key, RSAPrivateKey).then(function (dec_aes) {
                                                return window.crypto.subtle.exportKey("raw", dec_aes);
                                            }).then(function (arrayBuffer) {
                                                return _demoappUtilsCrypto["default"].encryptAESKey(arrayBuffer, member.rsa_public_key);
                                            }).then(function (enc_aes) {
                                                forkKeys.push({ receiver_id: member.user_id, enc_aes: enc_aes });
                                                console.log(forkKeys);
                                            });

                                            promises.push(promise);
                                        } else if (!isGroup) {

                                            forkKeys.push({ receiver_id: msg.receiver_id, enc_aes: msg.aes_key_receiver });
                                            forkKeys.push({ receiver_id: msg.sender_id, enc_aes: msg.aes_key_sender });
                                        }
                                    };

                                    for (_iterator7 = ViewGrpMembers[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                        _loop4();
                                    }
                                } catch (err) {
                                    _didIteratorError7 = true;
                                    _iteratorError7 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                                            _iterator7["return"]();
                                        }
                                    } finally {
                                        if (_didIteratorError7) {
                                            throw _iteratorError7;
                                        }
                                    }
                                }

                                console.log(promises);

                                var newForkMemberMessage = {
                                    mess_id: msg.mess_id,
                                    sender_id: msg.sender_id,
                                    receiver_id: isGroup ? msg.grp_id : msg.receiver_id,
                                    message: msg.message,
                                    iv: msg.iv,
                                    created_at: msg.timestamp,
                                    enc_aes_keys: forkKeys
                                };

                                var messagePromise = Promise.allSettled(promises).then(function () {
                                    self.get('newForkMemberMessages').pushObject(newForkMemberMessage);
                                });

                                encryptionPromises.push(messagePromise);
                            };

                            for (var _iterator6 = response_data.messages[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                var _iteratorNormalCompletion7;

                                var _didIteratorError7;

                                var _iteratorError7;

                                var _iterator7, _step7;

                                _loop3();
                            }
                        } catch (err) {
                            _didIteratorError6 = true;
                            _iteratorError6 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                                    _iterator6["return"]();
                                }
                            } finally {
                                if (_didIteratorError6) {
                                    throw _iteratorError6;
                                }
                            }
                        }

                        return Promise.all(encryptionPromises);
                    }).then(function () {
                        return _ember["default"].$.ajax({
                            url: _demoappConfigEnvironment["default"].apiHost + 'CreateForkMessage',
                            type: 'POST',
                            data: JSON.stringify({
                                isGroup: isGroup,
                                fork_id: self.get('forkID'),
                                messages: self.get('newForkMemberMessages'),
                                receiver_id_file: receiver_id,
                                msg_time: self.get('forkedmsg').timestamp
                            }),
                            xhrFields: { withCredentials: true }
                        });
                    }).then(function () {
                        console.log("Fork message created successfully");
                        window.location.href = "chat";
                    })["catch"](function (error) {
                        return console.error(error);
                    });
                });
            },
            closeFork: function closeFork() {
                _ember["default"].$(".createGroup").css("display", "none");
                _ember["default"].$(".ViewGrpMember").css("display", "none");
                _ember["default"].$(".addMembers").css("display", "none");
                _ember["default"].$(".forkmsg").css("display", "none");
                _ember["default"].$(".Chat").css("display", "block");
            },
            DeleteMessage: function DeleteMessage(message) {
                var self = this;
                var msg_pack = {
                    msg_id: message.mess_id,
                    isGroup: self.get('isGroup'),
                    dataFormat: message.dataFormat
                };

                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + 'DeleteMessage',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(msg_pack),
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        self.set('AllMessage', self.get('AllMessage').filter(function (msg) {
                            return msg.mess_id !== message.mess_id;
                        }));
                        console.log("Message Deleted");
                    },
                    error: function error(_error10) {
                        console.error("Error on Deleting Message");
                    }

                });
            }

        }

    });
});
define('demoapp/controllers/login', ['exports', 'ember', 'demoapp/config/environment'], function (exports, _ember, _demoappConfigEnvironment) {
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
                    url: _demoappConfigEnvironment['default'].apiHost + 'LoginServlet',
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
define("demoapp/controllers/signup", ["exports", "ember", "demoapp/utils/crypto", "demoapp/services/storage-service", "demoapp/config/environment"], function (exports, _ember, _demoappUtilsCrypto, _demoappServicesStorageService, _demoappConfigEnvironment) {
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

                        url: _demoappConfigEnvironment["default"].apiHost + 'SignupServlet',
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
define('demoapp/routes/chat', ['exports', 'ember', 'demoapp/config/environment'], function (exports, _ember, _demoappConfigEnvironment) {
    exports['default'] = _ember['default'].Route.extend({
        model: function model() {
            var _this = this;

            return _ember['default'].$.ajax({
                url: _demoappConfigEnvironment['default'].apiHost + 'ChatServlet',
                type: 'GET',
                xhrFields: { withCredentials: true }
            }).fail(function (error) {
                alert(error.message);
                _this.replaceWith('Logout');
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
define("demoapp/templates/chat",["exports"],function(exports){exports["default"] = Ember.HTMLBars.template((function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":24,"column":12},"end":{"line":32,"column":12}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                ");dom.appendChild(el0,el1);var el1=dom.createElement("li");dom.setAttribute(el1,"class","card flex-row align-items-center justify-content-around   group ");var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatar");dom.setAttribute(el2,"style","width: 50px; height: 50px;");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","align-items-center");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","text-success");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element35=dom.childAt(fragment,[1]);var morphs=new Array(4);morphs[0] = dom.createElementMorph(element35);morphs[1] = dom.createMorphAt(dom.childAt(element35,[3]),0,0);morphs[2] = dom.createMorphAt(dom.childAt(element35,[5]),0,0);morphs[3] = dom.createMorphAt(dom.childAt(element35,[7]),0,0);return morphs;},statements:[["element","action",["fetchchat",["get","message",["loc",[null,[25,115],[25,122]]]],"Private"],[],["loc",[null,[25,94],[25,135]]]],["content","message.name",["loc",[null,[27,54],[27,70]]]],["content","message.mobile_number",["loc",[null,[28,39],[28,64]]]],["content","message.status",["loc",[null,[29,51],[29,69]]]]],locals:["message"],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":33,"column":12},"end":{"line":40,"column":12}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                ");dom.appendChild(el0,el1);var el1=dom.createElement("li");dom.setAttribute(el1,"class","card flex-row text-align-center group");var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatar");dom.setAttribute(el2,"style","width: 50px; height: 50px;");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","GroupName");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element34=dom.childAt(fragment,[1]);var morphs=new Array(2);morphs[0] = dom.createElementMorph(element34);morphs[1] = dom.createMorphAt(dom.childAt(element34,[3]),0,0);return morphs;},statements:[["element","action",["fetchchat",["get","group",["loc",[null,[34,87],[34,92]]]],"Group"],[],["loc",[null,[34,66],[34,103]]]],["content","group.name",["loc",[null,[36,41],[36,55]]]]],locals:["group"],templates:[]};})();var child2=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":61,"column":20},"end":{"line":63,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-person-add add fs-1");dom.setAttribute(el1,"title","Add members");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element31=dom.childAt(fragment,[1]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element31);return morphs;},statements:[["element","action",["addMembers"],["on","click"],["loc",[null,[62,81],[62,115]]]]],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":59,"column":16},"end":{"line":65,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-box-arrow-right text-danger  fs-1");dom.setAttribute(el1,"title","Exit");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createComment("");dom.appendChild(el0,el1);var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-eye-fill text-warning fs-1");dom.setAttribute(el1,"title","View members");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element32=dom.childAt(fragment,[1]);var element33=dom.childAt(fragment,[5]);var morphs=new Array(3);morphs[0] = dom.createElementMorph(element32);morphs[1] = dom.createMorphAt(fragment,3,3,contextualElement);morphs[2] = dom.createElementMorph(element33);return morphs;},statements:[["element","action",["ExitGroup",["get","model.curruser.user_id",["loc",[null,[60,131],[60,153]]]]],["on","click"],["loc",[null,[60,110],[60,166]]]],["block","if",[["get","isAdmin",["loc",[null,[61,26],[61,33]]]]],[],0,null,["loc",[null,[61,20],[63,27]]]],["element","action",["OpenViweMember"],["on","click"],["loc",[null,[64,85],[64,123]]]]],locals:[],templates:[child0]};})();var child3=(function(){var child0=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":72,"column":20},"end":{"line":96,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","message  card d-flex flex-column w-25 you");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex flex-row justify-content-between");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("span");dom.setAttribute(el3,"class","senderName");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","dropdown");var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("button");dom.setAttribute(el4,"class","btn");dom.setAttribute(el4,"type","button");dom.setAttribute(el4,"data-bs-toggle","dropdown");dom.setAttribute(el4,"aria-expanded","false");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);dom.setNamespace("http://www.w3.org/2000/svg");var el5=dom.createElement("svg");dom.setAttribute(el5,"width","12");dom.setAttribute(el5,"height","14");dom.setAttribute(el5,"fill","currentColor");dom.setAttribute(el5,"class","bi bi-three-dots-vertical");dom.setAttribute(el5,"viewBox","0 0 16 16");var el6=dom.createTextNode("\n                                            ");dom.appendChild(el5,el6);var el6=dom.createElement("path");dom.setAttribute(el6,"d","M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);dom.setNamespace(null);var el4=dom.createElement("ul");dom.setAttribute(el4,"class","dropdown-menu dropdown-menu-dark bg-dark");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("fork from here");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Delete message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("hr");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","messageContent");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                        ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element26=dom.childAt(fragment,[1]);var element27=dom.childAt(element26,[1]);var element28=dom.childAt(element27,[3,3]);var element29=dom.childAt(element28,[1,0]);var element30=dom.childAt(element28,[3,0]);var morphs=new Array(5);morphs[0] = dom.createElementMorph(element26);morphs[1] = dom.createMorphAt(dom.childAt(element27,[1]),0,0);morphs[2] = dom.createElementMorph(element29);morphs[3] = dom.createElementMorph(element30);morphs[4] = dom.createMorphAt(dom.childAt(element26,[5]),0,0);return morphs;},statements:[["element","action",["toggleMenu"],["on","click"],["loc",[null,[73,79],[73,115]]]],["content","message.sender_name",["loc",[null,[75,57],[75,80]]]],["element","action",["ForkMessage",["get","message",["loc",[null,[83,92],[83,99]]]]],["on","click"],["loc",[null,[83,69],[83,112]]]],["element","action",["DeleteMessage",["get","message",["loc",[null,[84,94],[84,101]]]]],["on","click"],["loc",[null,[84,69],[84,114]]]],["content","message.message",["loc",[null,[92,54],[92,73]]]]],locals:[],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":96,"column":20},"end":{"line":126,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","message me  card d-flex flex-column w-25");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex flex-row justify-content-between");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("span");dom.setAttribute(el3,"class","senderName");var el4=dom.createTextNode("you");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","dropdown");var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("button");dom.setAttribute(el4,"class","btn");dom.setAttribute(el4,"type","button");dom.setAttribute(el4,"data-bs-toggle","dropdown");dom.setAttribute(el4,"aria-expanded","false");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);dom.setNamespace("http://www.w3.org/2000/svg");var el5=dom.createElement("svg");dom.setAttribute(el5,"width","12");dom.setAttribute(el5,"height","14");dom.setAttribute(el5,"fill","currentColor");dom.setAttribute(el5,"class","bi bi-three-dots-vertical");dom.setAttribute(el5,"viewBox","0 0 16 16");var el6=dom.createTextNode("\n                                            ");dom.appendChild(el5,el6);var el6=dom.createElement("path");dom.setAttribute(el6,"d","M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);dom.setNamespace(null);var el4=dom.createElement("ul");dom.setAttribute(el4,"class","dropdown-menu dropdown-menu-dark bg-dark");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("fork from here");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Delete message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("hr");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex justify-content-start");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("p");dom.setAttribute(el3,"class","messageContent");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","messageDetails");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("span");dom.setAttribute(el3,"class","messageTime");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                        ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element22=dom.childAt(fragment,[1]);var element23=dom.childAt(element22,[1,3,3]);var element24=dom.childAt(element23,[1,0]);var element25=dom.childAt(element23,[3,0]);var morphs=new Array(4);morphs[0] = dom.createElementMorph(element24);morphs[1] = dom.createElementMorph(element25);morphs[2] = dom.createMorphAt(dom.childAt(element22,[5,1]),0,0);morphs[3] = dom.createMorphAt(dom.childAt(element22,[7,1]),0,0);return morphs;},statements:[["element","action",["ForkMessage",["get","message",["loc",[null,[107,92],[107,99]]]]],["on","click"],["loc",[null,[107,69],[107,112]]]],["element","action",["DeleteMessage",["get","message",["loc",[null,[108,94],[108,101]]]]],["on","click"],["loc",[null,[108,69],[108,114]]]],["content","message.message",["loc",[null,[117,58],[117,77]]]],["content","message.timestamp",["loc",[null,[121,58],[121,79]]]]],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":71,"column":16},"end":{"line":127,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createComment("");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(1);morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);dom.insertBoundary(fragment,0);dom.insertBoundary(fragment,null);return morphs;},statements:[["block","if",[["subexpr","neq",[["get","message.sender_id",["loc",[null,[72,31],[72,48]]]],["get","model.curruser.user_id",["loc",[null,[72,49],[72,71]]]]],[],["loc",[null,[72,26],[72,72]]]]],[],0,1,["loc",[null,[72,20],[126,27]]]]],locals:[],templates:[child0,child1]};})();var child1=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":129,"column":20},"end":{"line":150,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","message syou");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex justify-content-between");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","dropdown");var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("span");dom.setAttribute(el4,"class","text-danger");var el5=dom.createComment("");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("button");dom.setAttribute(el4,"class","btn");dom.setAttribute(el4,"type","button");dom.setAttribute(el4,"data-bs-toggle","dropdown");dom.setAttribute(el4,"aria-expanded","false");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);dom.setNamespace("http://www.w3.org/2000/svg");var el5=dom.createElement("svg");dom.setAttribute(el5,"width","12");dom.setAttribute(el5,"height","14");dom.setAttribute(el5,"fill","currentColor");dom.setAttribute(el5,"class","bi bi-three-dots-vertical");dom.setAttribute(el5,"viewBox","0 0 16 16");var el6=dom.createTextNode("\n                                            ");dom.appendChild(el5,el6);var el6=dom.createElement("path");dom.setAttribute(el6,"d","M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);dom.setNamespace(null);var el4=dom.createElement("ul");dom.setAttribute(el4,"class","dropdown-menu dropdown-menu-dark bg-dark");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("fork from here");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Delete message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("img");dom.setAttribute(el2,"class","sticker-icon");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element16=dom.childAt(fragment,[1]);var element17=dom.childAt(element16,[1,1]);var element18=dom.childAt(element17,[5]);var element19=dom.childAt(element18,[1,0]);var element20=dom.childAt(element18,[3,0]);var element21=dom.childAt(element16,[3]);var morphs=new Array(4);morphs[0] = dom.createMorphAt(dom.childAt(element17,[1]),0,0);morphs[1] = dom.createElementMorph(element19);morphs[2] = dom.createElementMorph(element20);morphs[3] = dom.createAttrMorph(element21,'src');return morphs;},statements:[["content","message.sender_name",["loc",[null,[133,62],[133,85]]]],["element","action",["ForkMessage",["get","message",["loc",[null,[141,92],[141,99]]]]],["on","click"],["loc",[null,[141,69],[141,112]]]],["element","action",["DeleteMessage",["get","message",["loc",[null,[142,94],[142,101]]]]],["on","click"],["loc",[null,[142,69],[142,114]]]],["attribute","src",["concat",[["get","message.file_name",["loc",[null,[148,36],[148,53]]]]]]]],locals:[],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":150,"column":20},"end":{"line":170,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class"," message sme");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex justify-content-between");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","dropdown");var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("span");dom.setAttribute(el4,"class","text-danger");var el5=dom.createTextNode("you");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("button");dom.setAttribute(el4,"class","btn");dom.setAttribute(el4,"type","button");dom.setAttribute(el4,"data-bs-toggle","dropdown");dom.setAttribute(el4,"aria-expanded","false");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);dom.setNamespace("http://www.w3.org/2000/svg");var el5=dom.createElement("svg");dom.setAttribute(el5,"width","12");dom.setAttribute(el5,"height","14");dom.setAttribute(el5,"fill","currentColor");dom.setAttribute(el5,"class","bi bi-three-dots-vertical");dom.setAttribute(el5,"viewBox","0 0 16 16");var el6=dom.createTextNode("\n                                            ");dom.appendChild(el5,el6);var el6=dom.createElement("path");dom.setAttribute(el6,"d","M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);dom.setNamespace(null);var el4=dom.createElement("ul");dom.setAttribute(el4,"class","dropdown-menu dropdown-menu-dark bg-dark");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("fork from here");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Delete message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("img");dom.setAttribute(el2,"class","sticker-icon");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element11=dom.childAt(fragment,[1]);var element12=dom.childAt(element11,[1,1,5]);var element13=dom.childAt(element12,[1,0]);var element14=dom.childAt(element12,[3,0]);var element15=dom.childAt(element11,[3]);var morphs=new Array(3);morphs[0] = dom.createElementMorph(element13);morphs[1] = dom.createElementMorph(element14);morphs[2] = dom.createAttrMorph(element15,'src');return morphs;},statements:[["element","action",["ForkMessage",["get","message",["loc",[null,[162,92],[162,99]]]]],["on","click"],["loc",[null,[162,69],[162,112]]]],["element","action",["DeleteMessage",["get","message",["loc",[null,[163,94],[163,101]]]]],["on","click"],["loc",[null,[163,69],[163,114]]]],["attribute","src",["concat",[["get","message.file_name",["loc",[null,[168,40],[168,57]]]]]]]],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":128,"column":16},"end":{"line":171,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createComment("");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(1);morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);dom.insertBoundary(fragment,0);dom.insertBoundary(fragment,null);return morphs;},statements:[["block","if",[["subexpr","neq",[["get","message.sender_id",["loc",[null,[129,31],[129,48]]]],["get","model.curruser.user_id",["loc",[null,[129,49],[129,71]]]]],[],["loc",[null,[129,26],[129,72]]]]],[],0,1,["loc",[null,[129,20],[170,27]]]]],locals:[],templates:[child0,child1]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":70,"column":12},"end":{"line":172,"column":12}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createComment("");dom.appendChild(el0,el1);var el1=dom.createComment("");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(2);morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);morphs[1] = dom.createMorphAt(fragment,1,1,contextualElement);dom.insertBoundary(fragment,0);dom.insertBoundary(fragment,null);return morphs;},statements:[["block","if",[["subexpr","eq",[["get","message.dataFormat",["loc",[null,[71,26],[71,44]]]],"Text"],[],["loc",[null,[71,22],[71,52]]]]],[],0,null,["loc",[null,[71,16],[127,23]]]],["block","if",[["subexpr","eq",[["get","message.dataFormat",["loc",[null,[128,26],[128,44]]]],"Sticker"],[],["loc",[null,[128,22],[128,55]]]]],[],1,null,["loc",[null,[128,16],[171,23]]]]],locals:["message"],templates:[child0,child1]};})();var child4=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":183,"column":16},"end":{"line":185,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("img");dom.setAttribute(el1,"class","sticker-icon");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element10=dom.childAt(fragment,[1]);var morphs=new Array(2);morphs[0] = dom.createAttrMorph(element10,'src');morphs[1] = dom.createElementMorph(element10);return morphs;},statements:[["attribute","src",["concat",[["get","sticker.url",["loc",[null,[184,32],[184,43]]]]]]],["element","action",["extractSticker",["get","sticker.url",["loc",[null,[184,94],[184,105]]]]],["on","click"],["loc",[null,[184,68],[184,118]]]]],locals:["sticker"],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":181,"column":8},"end":{"line":187,"column":8}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("            ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","sticker-picker");var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);var el2=dom.createComment("");dom.appendChild(el1,el2);var el2=dom.createTextNode("            ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(1);morphs[0] = dom.createMorphAt(dom.childAt(fragment,[1]),1,1);return morphs;},statements:[["block","each",[["get","stickers",["loc",[null,[183,24],[183,32]]]]],[],0,null,["loc",[null,[183,16],[185,25]]]]],locals:[],templates:[child0]};})();var child5=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":202,"column":16},"end":{"line":210,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class"," d-flex justify-content-around align-items-center");var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("p");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("span");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("input");dom.setAttribute(el2,"type","checkbox");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n                    ");dom.appendChild(el0,el1);var el1=dom.createElement("hr");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element8=dom.childAt(fragment,[1]);var element9=dom.childAt(element8,[7]);var morphs=new Array(3);morphs[0] = dom.createMorphAt(dom.childAt(element8,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element8,[5]),0,0);morphs[2] = dom.createElementMorph(element9);return morphs;},statements:[["content","message.name",["loc",[null,[205,27],[205,43]]]],["content","message.mobile_number",["loc",[null,[206,31],[206,56]]]],["element","action",["addUsertoGroup",["get","message.user_id",["loc",[null,[207,74],[207,89]]]]],["on","change"],["loc",[null,[207,48],[207,103]]]]],locals:["message"],templates:[]};})();var child6=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":230,"column":20},"end":{"line":232,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("span");var el2=dom.createTextNode("Admin");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(){return [];},statements:[],locals:[],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":232,"column":20},"end":{"line":234,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("span");var el2=dom.createTextNode("Member");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(){return [];},statements:[],locals:[],templates:[]};})();var child2=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":235,"column":24},"end":{"line":237,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("span");var el2=dom.createTextNode("(YOU)");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(){return [];},statements:[],locals:[],templates:[]};})();var child3=(function(){var child0=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":243,"column":32},"end":{"line":245,"column":32}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-person-fill-down fs-1 text-danger");dom.setAttribute(el1,"title","Dismiss as Admin");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element5=dom.childAt(fragment,[1]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element5);return morphs;},statements:[["element","action",["makeAdmin",["get","member.user_id",["loc",[null,[244,158],[244,172]]]],false],["on","click"],["loc",[null,[244,137],[244,191]]]]],locals:[],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":245,"column":32},"end":{"line":248,"column":32}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-person-fill-up fs-1 text-success");dom.setAttribute(el1,"title","Make as Admin");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element4=dom.childAt(fragment,[1]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element4);return morphs;},statements:[["element","action",["makeAdmin",["get","member.user_id",["loc",[null,[246,154],[246,168]]]],true],["on","click"],["loc",[null,[246,133],[246,186]]]]],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":241,"column":28},"end":{"line":249,"column":28}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-person-x-fill fs-1 text-danger");dom.setAttribute(el1,"title","Remove");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createComment("");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element6=dom.childAt(fragment,[1]);var morphs=new Array(2);morphs[0] = dom.createElementMorph(element6);morphs[1] = dom.createMorphAt(fragment,3,3,contextualElement);dom.insertBoundary(fragment,null);return morphs;},statements:[["element","action",["ExitGroup",["get","member.user_id",["loc",[null,[242,141],[242,155]]]]],["on","click"],["loc",[null,[242,120],[242,168]]]],["block","if",[["get","member.isAdmin",["loc",[null,[243,39],[243,53]]]]],[],0,1,["loc",[null,[243,32],[248,39]]]]],locals:[],templates:[child0,child1]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":240,"column":24},"end":{"line":250,"column":24}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createComment("");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(1);morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);dom.insertBoundary(fragment,0);dom.insertBoundary(fragment,null);return morphs;},statements:[["block","if",[["subexpr","neq",[["get","model.curruser.user_id",["loc",[null,[241,39],[241,61]]]],["get","member.user_id",["loc",[null,[241,62],[241,76]]]]],[],["loc",[null,[241,34],[241,77]]]]],[],0,null,["loc",[null,[241,28],[249,35]]]]],locals:[],templates:[child0]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":225,"column":12},"end":{"line":254,"column":12}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","card d-flex align-items-center gap-4 flex-row p-2");var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","GroupName");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);var el2=dom.createComment("");dom.appendChild(el1,el2);var el2=dom.createComment("");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n");dom.appendChild(el1,el2);var el2=dom.createComment("");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n                ");dom.appendChild(el0,el1);var el1=dom.createElement("hr");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element7=dom.childAt(fragment,[1]);var morphs=new Array(5);morphs[0] = dom.createMorphAt(dom.childAt(element7,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element7,[5]),0,0);morphs[2] = dom.createMorphAt(element7,7,7);morphs[3] = dom.createMorphAt(element7,8,8);morphs[4] = dom.createMorphAt(element7,10,10);return morphs;},statements:[["content","member.name",["loc",[null,[228,41],[228,56]]]],["content","member.mobile_number",["loc",[null,[229,35],[229,59]]]],["block","if",[["get","member.isAdmin",["loc",[null,[230,26],[230,40]]]]],[],0,1,["loc",[null,[230,20],[234,27]]]],["block","if",[["subexpr","eq",[["get","model.curruser.user_id",["loc",[null,[235,34],[235,56]]]],["get","member.user_id",["loc",[null,[235,58],[235,72]]]]],[],["loc",[null,[235,30],[235,73]]]]],[],2,null,["loc",[null,[235,24],[237,27]]]],["block","if",[["get","isAdmin",["loc",[null,[240,30],[240,37]]]]],[],3,null,["loc",[null,[240,24],[250,31]]]]],locals:["member"],templates:[child0,child1,child2,child3]};})();var child7=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":266,"column":16},"end":{"line":275,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","card d-flex justify-content-around align-items-center flex-row p-3");var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("input");dom.setAttribute(el2,"type","checkbox");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n                    ");dom.appendChild(el0,el1);var el1=dom.createElement("hr");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element2=dom.childAt(fragment,[1]);var element3=dom.childAt(element2,[7]);var morphs=new Array(3);morphs[0] = dom.createMorphAt(dom.childAt(element2,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element2,[5]),0,0);morphs[2] = dom.createElementMorph(element3);return morphs;},statements:[["content","member.name",["loc",[null,[269,36],[269,51]]]],["content","member.mobile_number",["loc",[null,[270,39],[270,63]]]],["element","action",["addUsertoGroup",["get","member.user_id",["loc",[null,[271,76],[271,90]]]]],["on","change"],["loc",[null,[271,50],[271,104]]]]],locals:["member"],templates:[]};})();var child8=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":297,"column":16},"end":{"line":305,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","fork-user");var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","GroupName");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","GroupDescrp");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("input");dom.setAttribute(el2,"type","checkbox");dom.setAttribute(el2,"class","GroupDescrp");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element0=dom.childAt(fragment,[1]);var element1=dom.childAt(element0,[7]);var morphs=new Array(3);morphs[0] = dom.createMorphAt(dom.childAt(element0,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element0,[5]),0,0);morphs[2] = dom.createElementMorph(element1);return morphs;},statements:[["content","message.name",["loc",[null,[300,45],[300,61]]]],["content","message.mobile_number",["loc",[null,[301,50],[301,75]]]],["element","action",["addUserToFork",["get","message.user_id",["loc",[null,[302,94],[302,109]]]]],["on","change"],["loc",[null,[302,69],[302,123]]]]],locals:["message"],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":1,"column":0},"end":{"line":319,"column":7}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createElement("link");dom.setAttribute(el1,"rel","stylesheet");dom.setAttribute(el1,"href","https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("script");dom.setAttribute(el1,"src","https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("link");dom.setAttribute(el1,"href","https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css");dom.setAttribute(el1,"rel","stylesheet");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("link");dom.setAttribute(el1,"rel","stylesheet");dom.setAttribute(el1,"href","https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("meta");dom.setAttribute(el1,"http-equiv","Content-Security-Policy");dom.setAttribute(el1,"content","default-src 'self'; report-uri http://localhost:4200/csp-report;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("link");dom.setAttribute(el1,"rel","stylesheet");dom.setAttribute(el1,"href","assets/chat.css");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n\n");dom.appendChild(el0,el1);var el1=dom.createElement("main");var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","sideNav1");var el3=dom.createTextNode("\n\n\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","sideNav2");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","SideNavhead");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("h2");var el5=dom.createTextNode(" Welcome ");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("input");dom.setAttribute(el4,"type","hidden");dom.setAttribute(el4,"id","curruserid");dom.setAttribute(el4,"name","curruserid");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","icon-container");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("i");dom.setAttribute(el5,"class","fas fa-sign-out-alt logout-icon");dom.setAttribute(el5,"title","Logout");var el6=dom.createTextNode(">");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("i");dom.setAttribute(el5,"class","fas fa-users create-group-icon");dom.setAttribute(el5,"title","Create Group");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","friends");var el4=dom.createTextNode("\n");dom.appendChild(el3,el4);var el4=dom.createComment("");dom.appendChild(el3,el4);var el4=dom.createComment("");dom.appendChild(el3,el4);var el4=dom.createTextNode("        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n\n\n\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","empty-page");var el3=dom.createTextNode("\n\n\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("section");dom.setAttribute(el2,"class","Chat");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","ChatHead");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("li");dom.setAttribute(el4,"class","chatDetails");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("img");dom.setAttribute(el5,"src","assets/profile.png");dom.setAttribute(el5,"alt","");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("p");dom.setAttribute(el5,"class","recevName");var el6=dom.createComment("");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("span");var el6=dom.createComment("");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","grpOperations");var el5=dom.createTextNode("\n");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);var el5=dom.createTextNode("            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","MessageContainer");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("span");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n");dom.appendChild(el3,el4);var el4=dom.createComment("");dom.appendChild(el3,el4);var el4=dom.createTextNode("        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","messageCenter");var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);var el4=dom.createElement("form");dom.setAttribute(el4,"id","MessageForm");var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);var el5=dom.createElement("input");dom.setAttribute(el5,"type","text");dom.setAttribute(el5,"id","MessageInput");dom.setAttribute(el5,"name","MessageInput");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");var el6=dom.createTextNode("stickers");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","submit");dom.setAttribute(el5,"class","Send");var el6=dom.createTextNode("send");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n        ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n");dom.appendChild(el3,el4);var el4=dom.createComment("");dom.appendChild(el3,el4);var el4=dom.createTextNode("        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("section");dom.setAttribute(el2,"class","createGroup");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("form");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","d-flex justify-content-between");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h3");dom.setAttribute(el5,"class","bg-green");var el6=dom.createTextNode("Create New Group");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createElement("br");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","d-flex align-items-center gap-4");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("label");dom.setAttribute(el5,"for","grpName");var el6=dom.createTextNode("Group Name: ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createElement("input");dom.setAttribute(el5,"type","text");dom.setAttribute(el5,"name","grpNmae");dom.setAttribute(el5,"id","grpName");dom.setAttribute(el5,"style","width: 70%;padding: 10px;");dom.setAttribute(el5,"required","");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createElement("br");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("br");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","d-flex flex-column gap-2");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h3");var el6=dom.createTextNode("Add Members");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createElement("br");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);var el5=dom.createTextNode("            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","button-container");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","submit");dom.setAttribute(el5,"class","submit-button");var el6=dom.createTextNode("Create Group");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("section");dom.setAttribute(el2,"class","ViewGrpMember");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","d-flex justify-content-between");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("h1");var el5=dom.createTextNode("Group Members");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createElement("br");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("button");dom.setAttribute(el4,"type","button");dom.setAttribute(el4,"class","btn-close");dom.setAttribute(el4,"aria-label","Close");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createElement("br");dom.appendChild(el2,el3);var el3=dom.createTextNode("\n\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("form");var el4=dom.createTextNode("\n");dom.appendChild(el3,el4);var el4=dom.createComment("");dom.appendChild(el3,el4);var el4=dom.createTextNode("        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("section");dom.setAttribute(el2,"class","addMembers");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("form");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","d-flex justify-content-between");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h1");var el6=dom.createTextNode("Add New Members");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createElement("br");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createElement("br");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","d-flex- flex-column");var el5=dom.createTextNode("\n");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);var el5=dom.createTextNode("            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","button-container");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","submit");dom.setAttribute(el5,"class","submit-button");var el6=dom.createTextNode("Add Members");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("section");dom.setAttribute(el2,"class","forkmsg");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","d-flex justify-content-between");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("h1");var el5=dom.createElement("strong");var el6=dom.createTextNode("Add users to forked chat");dom.appendChild(el5,el6);dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createElement("br");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("button");dom.setAttribute(el4,"type","button");dom.setAttribute(el4,"class","btn-close");dom.setAttribute(el4,"aria-label","Close");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("form");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","start-fork");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("strong");dom.setAttribute(el5,"id","fork-sender");var el6=dom.createTextNode("sender");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("span");dom.setAttribute(el5,"id","fork-msg");var el6=dom.createTextNode("Message");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("span");dom.setAttribute(el5,"id","fork-time");var el6=dom.createTextNode("Time");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","grp-field");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h3");var el6=dom.createTextNode("Add Users");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);var el5=dom.createTextNode("            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","data-field");var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);var el5=dom.createElement("div");dom.setAttribute(el5,"class","chat-title");var el6=dom.createTextNode("\n                ");dom.appendChild(el5,el6);var el6=dom.createElement("label");dom.setAttribute(el6,"for","chat-title");var el7=dom.createTextNode("Chat Title: ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createElement("input");dom.setAttribute(el6,"type","text");dom.setAttribute(el6,"name","chat-title");dom.setAttribute(el6,"id","chat-title");dom.setAttribute(el6,"required","");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n            ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);var el5=dom.createElement("label");var el6=dom.createElement("input");dom.setAttribute(el6,"type","checkbox");dom.setAttribute(el6,"id","all");dom.setAttribute(el6,"name","all");dom.appendChild(el5,el6);var el6=dom.createTextNode(" Include all participants of this conversation");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","button-container");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","submit");dom.setAttribute(el5,"class","submit-button");var el6=dom.createTextNode("Create Chat");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n");dom.appendChild(el1,el2);dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element36=dom.childAt(fragment,[12]);var element37=dom.childAt(element36,[3]);var element38=dom.childAt(element37,[1]);var element39=dom.childAt(element38,[3]);var element40=dom.childAt(element38,[5]);var element41=dom.childAt(element40,[1]);var element42=dom.childAt(element40,[3]);var element43=dom.childAt(element37,[3]);var element44=dom.childAt(element36,[7]);var element45=dom.childAt(element44,[1]);var element46=dom.childAt(element45,[1]);var element47=dom.childAt(element44,[5]);var element48=dom.childAt(element47,[1]);var element49=dom.childAt(element48,[3]);var element50=dom.childAt(element48,[5]);var element51=dom.childAt(element36,[9,1]);var element52=dom.childAt(element51,[1,3]);var element53=dom.childAt(element36,[11]);var element54=dom.childAt(element53,[1,4]);var element55=dom.childAt(element53,[4]);var element56=dom.childAt(element36,[13,1]);var element57=dom.childAt(element56,[1,4]);var element58=dom.childAt(element36,[15]);var element59=dom.childAt(element58,[1,4]);var element60=dom.childAt(element58,[3]);var morphs=new Array(25);morphs[0] = dom.createMorphAt(dom.childAt(element38,[1]),1,1);morphs[1] = dom.createAttrMorph(element39,'value');morphs[2] = dom.createElementMorph(element41);morphs[3] = dom.createElementMorph(element42);morphs[4] = dom.createMorphAt(element43,1,1);morphs[5] = dom.createMorphAt(element43,2,2);morphs[6] = dom.createMorphAt(dom.childAt(element46,[3]),0,0);morphs[7] = dom.createMorphAt(dom.childAt(element46,[5]),0,0);morphs[8] = dom.createMorphAt(dom.childAt(element45,[3]),1,1);morphs[9] = dom.createMorphAt(dom.childAt(element44,[3]),3,3);morphs[10] = dom.createElementMorph(element49);morphs[11] = dom.createElementMorph(element50);morphs[12] = dom.createMorphAt(element47,3,3);morphs[13] = dom.createElementMorph(element51);morphs[14] = dom.createElementMorph(element52);morphs[15] = dom.createMorphAt(dom.childAt(element51,[9]),4,4);morphs[16] = dom.createElementMorph(element54);morphs[17] = dom.createElementMorph(element55);morphs[18] = dom.createMorphAt(element55,1,1);morphs[19] = dom.createElementMorph(element56);morphs[20] = dom.createElementMorph(element57);morphs[21] = dom.createMorphAt(dom.childAt(element56,[4]),1,1);morphs[22] = dom.createElementMorph(element59);morphs[23] = dom.createElementMorph(element60);morphs[24] = dom.createMorphAt(dom.childAt(element60,[3]),3,3);return morphs;},statements:[["content","model.curruser.name",["loc",[null,[16,25],[16,48]]]],["attribute","value",["concat",[["get","model.curruser.user_id",["loc",[null,[17,42],[17,64]]]]]]],["element","action",["logout"],[],["loc",[null,[19,74],[19,94]]]],["element","action",["showGrpCreate"],["on","click"],["loc",[null,[20,79],[20,116]]]],["block","each",[["get","model.users",["loc",[null,[24,20],[24,31]]]]],[],0,null,["loc",[null,[24,12],[32,21]]]],["block","each",[["get","model.groups",["loc",[null,[33,20],[33,32]]]]],[],1,null,["loc",[null,[33,12],[40,21]]]],["content","selectedUsername",["loc",[null,[55,37],[55,57]]]],["content","currentStatus",["loc",[null,[56,22],[56,39]]]],["block","if",[["get","isGroup",["loc",[null,[59,22],[59,29]]]]],[],2,null,["loc",[null,[59,16],[65,23]]]],["block","each",[["get","AllMessage",["loc",[null,[70,20],[70,30]]]]],[],3,null,["loc",[null,[70,12],[172,21]]]],["element","action",["openStickerPicker"],[],["loc",[null,[178,34],[178,64]]]],["element","action",[["subexpr","if",[["get","isGroup",["loc",[null,[179,47],[179,54]]]],"SendMessageOnGroup","sendMessage"],[],["loc",[null,[179,43],[179,90]]]]],["on","click"],["loc",[null,[179,34],[179,104]]]],["block","if",[["get","showStickerPicker",["loc",[null,[181,14],[181,31]]]]],[],4,null,["loc",[null,[181,8],[187,15]]]],["element","action",["CreateNewGroup",["get","model.curruser.user_id",["loc",[null,[191,40],[191,62]]]]],["on","submit"],["loc",[null,[191,14],[191,77]]]],["element","action",["closeCreateGrp"],["on","click"],["loc",[null,[194,56],[194,94]]]],["block","each",[["get","model.users",["loc",[null,[202,24],[202,35]]]]],[],5,null,["loc",[null,[202,16],[210,25]]]],["element","action",["closeViewMember"],["on","click"],["loc",[null,[221,52],[221,91]]]],["element","action",["RemoveMember",["get","model.curruser.user_id",["loc",[null,[224,38],[224,60]]]]],["on","submit"],["loc",[null,[224,14],[224,75]]]],["block","each",[["get","ViewGrpMembers",["loc",[null,[225,20],[225,34]]]]],[],6,null,["loc",[null,[225,12],[254,21]]]],["element","action",["addNewMember"],["on","submit"],["loc",[null,[260,14],[260,53]]]],["element","action",["closeViewMember"],["on","click"],["loc",[null,[263,56],[263,95]]]],["block","each",[["get","ViewGrpMembers",["loc",[null,[266,24],[266,38]]]]],[],7,null,["loc",[null,[266,16],[275,25]]]],["element","action",["closeFork"],["on","click"],["loc",[null,[286,52],[286,85]]]],["element","action",["CreatForkMessage"],["on","submit"],["loc",[null,[289,14],[289,57]]]],["block","each",[["get","newMembersForFork",["loc",[null,[297,24],[297,41]]]]],[],8,null,["loc",[null,[297,16],[305,25]]]]],locals:[],templates:[child0,child1,child2,child3,child4,child5,child6,child7,child8]};})());});
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
  require("demoapp/app")["default"].create({"name":"demoapp","version":"0.0.0+7140c607"});
}

/* jshint ignore:end */
//# sourceMappingURL=demoapp.map