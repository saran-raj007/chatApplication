"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('demoapp/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'demoapp/config/environment', 'demoapp/helpers/checkPermission'], function (exports, _ember, _emberResolver, _emberLoadInitializers, _demoappConfigEnvironment, _demoappHelpersCheckPermission) {

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
    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
        messageForwardMode: null,
        forwardMessagearray: _ember["default"].A(),
        countOfforwardMessage: 0,
        selectedUsersForForward: _ember["default"].A(),
        grpPermissions: _ember["default"].A(),
        canAddMember: false,
        canRemoveMember: false,
        canSendMessage: false,
        canDeleteMessage: false,
        permissions: _ember["default"].A(),
        selectedPermission: _ember["default"].A(),
        assignMember: _ember["default"].A(),
        viewrole: _ember["default"].A(),
        mentions: _ember["default"].A(),
        getRoles: _ember["default"].A(),
        stickers: [{ url: "/Stickers/dumbbell.png" }, { url: "/Stickers/laptop.png" }, { url: "/Stickers/listening.png" }, { url: "/Stickers/tea-time.png" }],

        init: function init() {
            this._super.apply(this, arguments);

            var self = this;
            _ember["default"].run.scheduleOnce('afterRender', this, function () {
                var _this = this;

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
                    if (receivedMessage.dataFormat === "delete_message") {
                        self.set('AllMessage', self.get('AllMessage').filter(function (msg) {
                            return msg.mess_id !== receivedMessage.msg_id;
                        }));
                    } else if (receivedMessage.dataFormat === "status_update") {
                        var user = self.get('model.users').findBy('user_id', receivedMessage.user_id);
                        if (user) {
                            _ember["default"].set(user, 'status', receivedMessage.status);
                        }
                    } else if (receivedMessage.dataFormat === "Text") {
                        if (receivedMessage.unseen) {
                            console.log(receivedMessage.mentions);
                            var groups = _this.get('model.groups');
                            var group = groups.findBy('group_id', receivedMessage.grp_id);
                            if (group) {
                                _ember["default"].set(group, 'unseen', true);
                            }
                        }
                        _demoappServicesStorageService["default"].getPrivateKey(self.get('sender_id')).then(function (privateKey) {
                            var key = undefined;
                            if (receivedMessage.isforward) {
                                key = receivedMessage.old_senderid === self.get('sender_id') ? receivedMessage.aes_key_sender : receivedMessage.aes_key_receiver;
                            } else {
                                if (!self.get('isGroup')) {
                                    if (receivedMessage.sender_id === self.get('sender_id')) {
                                        key = receivedMessage.aes_key_sender;
                                    } else {
                                        key = receivedMessage.aes_key_receiver;
                                    }
                                } else {
                                    key = receivedMessage.aes_key;
                                }
                            }

                            _demoappUtilsCrypto["default"].decryptMessage(receivedMessage.message, key, privateKey, receivedMessage.iv).then(function (message) {
                                alert(message);
                                var messages = message;

                                var users = self.get('model.users');
                                var promises = [];
                                var reconstructedMessage = message.replace(/@@(.*?)@@/g, function (match, memberId) {
                                    var mention = users.findBy('user_id', memberId);

                                    if (memberId === self.get('model.curruser.user_id')) {
                                        mention = self.get('model.curruser');
                                    }

                                    if (mention !== undefined) {
                                        return _ember["default"].String.htmlSafe("<a class=\"\" data-bs-toggle=\"collapse\" href=\"#i" + receivedMessage.mess_id + "\" role=\"button\" \n                                            aria-expanded=\"false\" aria-controls=\"collapseExample\"> @" + mention.name + " </a>\n                                            <div class=\"collapse\" id=\"i" + receivedMessage.mess_id + "\">\n                                                <div class=\"card card-body\">\n                                                    Name: " + mention.name + " <br>\n                                                    Mobile Number: " + mention.mobile_number + " <br>\n                                                </div>\n                                            </div>");
                                    } else {
                                        var promise = new _ember["default"].RSVP.Promise(function (resolve, reject) {
                                            _ember["default"].$.ajax({
                                                url: _demoappConfigEnvironment["default"].apiHost + '/GetRoleDesc',
                                                type: 'POST',
                                                contentType: 'application/json',
                                                dataType: 'json',
                                                xhrFields: { withCredentials: true },
                                                data: JSON.stringify({ role_id: memberId }),
                                                success: function success(response) {
                                                    resolve({
                                                        original: match,
                                                        replacement: _ember["default"].String.htmlSafe("<a class=\"\" data-bs-toggle=\"collapse\" href=\"#i" + receivedMessage.mess_id + "\" \n                                                                role=\"button\" aria-expanded=\"false\" aria-controls=\"collapseExample\"> @" + response.role_name + " </a>\n                                                                <div class=\"collapse\" id=\"i" + receivedMessage.mess_id + "\">\n                                                                    <div class=\"card card-body\">\n                                                                        " + response.role_desc + " <br>\n                                                                    </div>\n                                                                </div>")
                                                    });
                                                },
                                                error: function error(_error) {
                                                    console.log("Error fetching role description:", _error);
                                                    reject(_error);
                                                }
                                            });
                                        });

                                        promises.push(promise);
                                        return match;
                                    }
                                });

                                _ember["default"].RSVP.all(promises).then(function (results) {
                                    results.forEach(function (result) {
                                        reconstructedMessage = reconstructedMessage.replace(result.original, result.replacement);
                                    });

                                    messages = reconstructedMessage;
                                    msg_pack = {
                                        mess_id: receivedMessage.mess_id,
                                        sender_id: receivedMessage.sender_id,
                                        message: messages,
                                        sender_name: receivedMessage.sender_name,
                                        dataFormat: 'Text',
                                        timestamp: receivedMessage.timestamp,
                                        isforward: receivedMessage.isforward
                                    };
                                    var isGroup = self.get('isGroup');
                                    if (!isGroup && (receivedMessage.sender_id === self.get('receiver_id') || receivedMessage.sender_id === self.get('sender_id'))) {
                                        self.get('AllMessage').pushObject(msg_pack);
                                    } else if (isGroup && receivedMessage.grp_id === self.get('receiver_id')) {
                                        self.get('AllMessage').pushObject(msg_pack);
                                    }
                                    // self.get('AllMessage').pushObject(msg_pack);

                                    // if(self.get('isGroup') && self.get('receiver_id')===receivedMessage.grp_id){
                                    //  self.get('AllMessage').pushObject(msg_pack);

                                    // }
                                    //// if(!self.get('isGroup') && self.get('sender_id')===receivedMessage.sender_id){
                                    //self.get('AllMessage').pushObject(msg_pack);

                                    //}
                                    console.log(reconstructedMessage);
                                    console.log("goo");
                                })["catch"](function (error) {
                                    console.error("Error in processing mentions:", error);
                                });
                            })["catch"](function (error) {
                                console.log("error on decryption process", error);
                            });
                        })["catch"](function (error) {
                            console.log("Error on fetch key form indexDB:", error);
                        });
                    } else {
                        //// alert("ok");
                        var imageUrl = "https://localhost:8443/chatApplication_war_exploded/RetriveFile?file_name=" + encodeURIComponent(receivedMessage.file_name);
                        msg_pack = {
                            mess_id: receivedMessage.mess_id,
                            sender_id: receivedMessage.sender_id,
                            file_name: imageUrl,
                            sender_name: receivedMessage.sender_name,
                            dataFormat: 'Sticker',
                            isforward: receivedMessage.isforward

                        };
                        //if(receivedMessage.receiver_id===self.get('receiver_id') || self.get('receiver_id')===receivedMessage.sender_id){
                        self.get('AllMessage').pushObject(msg_pack);

                        //     }
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
        checkPermission: function checkPermission(permissionName) {
            return this.get('grpPremissions').includes(permissionName);
        },

        actions: {
            updateSeen: function updateSeen(grp_id, user_id) {
                var self = this;
                var details = {
                    grp_id: grp_id,
                    user_id: user_id
                };
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + '/UpdateSeen',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    xhrFields: { withCredentials: true },
                    data: JSON.stringify(details),
                    success: function success(response) {
                        console.log(response);
                    },
                    error: function error(_error2) {
                        console.log(_error2);
                    }

                });
            },
            fetchchat: function fetchchat(receiver, chat) {
                var self = this;
                self.get('grpPermissions').clear();
                var datas = undefined;
                if (chat === "Private") {

                    datas = {
                        userid: receiver.user_id,
                        type: chat

                    };
                    self.set('isGroup', false);
                    self.set('receiver_id', receiver.user_id);
                } else {

                    if (receiver.unseen) {
                        self.send('updateSeen', receiver.group_id, self.get('sender_id'));
                        var groups = this.get('model.groups');
                        var group = groups.findBy('group_id', receiver.group_id);
                        if (group) {
                            _ember["default"].set(group, 'unseen', false);
                        }
                    }
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
                self.get('forwardMessagearray').clear();
                self.set('countOfforwardMessage', 0);
                self.set('messageForwardMode', false);
                self.set('canAddMember', false);
                self.set('canRemoveMember', false);
                self.set('canSendMessage', false);
                self.set('canDeleteMessage', false);
                self.get('mentions').clear();

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
                        console.log(response.messages);
                        _demoappServicesStorageService["default"].getPrivateKey(self.get('sender_id')).then(function (privateKey) {
                            if (chat === "Private") {
                                self.set('canSendMessage', true);
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
                                                        var messages = message;
                                                        var users = self.get('model.users');
                                                        var promises = [];

                                                        var reconstructedMessage = message.replace(/@@(.*?)@@/g, function (match, memberId) {
                                                            var mention = users.findBy('user_id', memberId);
                                                            if (memberId === self.get('model.curruser.user_id')) {
                                                                mention = self.get('model.curruser');
                                                            }

                                                            if (mention !== undefined) {
                                                                return _ember["default"].String.htmlSafe("<a class=\"\" data-bs-toggle=\"collapse\" href=\"#i" + msg.mess_id + "\" role=\"button\" \n                                                                aria-expanded=\"false\" aria-controls=\"collapseExample\"> @" + mention.name + " </a>\n                                                                <div class=\"collapse\" id=\"i" + msg.mess_id + "\">\n                                                                    <div class=\"card card-body\">\n                                                                        Name: " + mention.name + " <br>\n                                                                        Mobile Number: " + mention.mobile_number + " <br>\n                                                                    </div>\n                                                                </div>");
                                                            } else {
                                                                var rolePromise = new _ember["default"].RSVP.Promise(function (resolve, reject) {
                                                                    _ember["default"].$.ajax({
                                                                        url: _demoappConfigEnvironment["default"].apiHost + '/GetRoleDesc',
                                                                        type: 'POST',
                                                                        contentType: 'application/json',
                                                                        dataType: 'json',
                                                                        xhrFields: { withCredentials: true },
                                                                        data: JSON.stringify({ role_id: memberId }),
                                                                        success: function success(response) {
                                                                            resolve({
                                                                                original: match,
                                                                                replacement: _ember["default"].String.htmlSafe("<a class=\"\" data-bs-toggle=\"collapse\" href=\"#i" + msg.mess_id + "\" \n                                                                                role=\"button\" aria-expanded=\"false\" aria-controls=\"collapseExample\"> @" + response.role_name + " </a>\n                                                                                <div class=\"collapse\" id=\"i" + msg.mess_id + "\">\n                                                                                    <div class=\"card card-body\">\n                                                                                        " + response.role_desc + " <br>\n                                                                                    </div>\n                                                                                </div>")
                                                                            });
                                                                        },
                                                                        error: function error(_error3) {
                                                                            console.log("Error fetching role description:", _error3);
                                                                            reject(_error3);
                                                                        }
                                                                    });
                                                                });

                                                                promises.push(rolePromise);
                                                                return match;
                                                            }
                                                        });

                                                        _ember["default"].RSVP.all(promises).then(function (results) {
                                                            results.forEach(function (result) {
                                                                reconstructedMessage = reconstructedMessage.replace(result.original, result.replacement);
                                                            });

                                                            var msg_pack = {
                                                                sender_id: msg.sender_id,
                                                                receiver_id: msg.receiver_id,
                                                                aes_key_sender: msg.aes_key_sender,
                                                                aes_key_receiver: msg.aes_key_receiver,
                                                                enc_message: msg.message,
                                                                iv: msg.iv,
                                                                sender_name: msg.sender_name,
                                                                isforward: msg.isforward,
                                                                mess_id: msg.mess_id,
                                                                message: reconstructedMessage,
                                                                dataFormat: "Text",
                                                                timestamp: msg.timestamp
                                                            };

                                                            resolve(msg_pack);
                                                        })["catch"](function (error) {
                                                            console.error("Error in processing mentions:", error);
                                                            reject(error);
                                                        });
                                                    })["catch"](function (error) {
                                                        console.log("Error in decryption:", error);
                                                        reject(error);
                                                    });

                                                    //resolve(msg_pack);
                                                })["catch"](function (error) {
                                                    console.log("Error in decryption:", error);
                                                    reject(error);
                                                });

                                                promises.push(promise);
                                            })();
                                        } else {
                                            var imageUrl = "https://localhost:8443/chatApplication_war_exploded/RetriveFile?file_name=" + encodeURIComponent(msg.file_name);

                                            var stickerPromise = _ember["default"].RSVP.resolve({
                                                mess_id: msg.mess_id,
                                                sender_id: msg.sender_id,
                                                file_name: imageUrl,
                                                name: msg.file_name,
                                                sender_name: msg.sender_name,
                                                receiver_id: msg.receiver_id,
                                                dataFormat: "Sticker",
                                                isforward: msg.isforward,
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
                                self.get('ViewGrpMembers').clear();
                                self.get('getRoles').clear();
                                self.send('getRole');
                                self.send('ViewMembers', self.get('receiver_id'));
                                self.set('isAdmin', response.isAdmin);
                                console.log(response.messages);
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = response.permissions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var permission = _step2.value;

                                        if (permission === 'Add Member') self.set('canAddMember', true);else if (permission === 'Remove Member') self.set('canRemoveMember', true);else if (permission === 'Send Message') self.set('canSendMessage', true);else if (permission === 'Delete Message') self.set('canDeleteMessage', true);
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

                                var _iteratorNormalCompletion3 = true;
                                var _didIteratorError3 = false;
                                var _iteratorError3 = undefined;

                                try {
                                    var _loop2 = function () {
                                        var msg = _step3.value;

                                        var msg_pack = undefined;
                                        if (msg.dataFormat === "Text") {
                                            var promise = new _ember["default"].RSVP.Promise(function (resolve, reject) {
                                                _demoappUtilsCrypto["default"].decryptMessage(msg.message, msg.enc_aes_key, privateKey, msg.iv).then(function (message) {
                                                    var messages = message;
                                                    var users = self.get('model.users');
                                                    var promises = [];

                                                    var reconstructedMessage = message.replace(/@@(.*?)@@/g, function (match, memberId) {
                                                        var mention = users.findBy('user_id', memberId);
                                                        if (memberId === self.get('model.curruser.user_id')) {
                                                            mention = self.get('model.curruser');
                                                        }

                                                        if (mention !== undefined) {
                                                            return _ember["default"].String.htmlSafe("<a class=\"\" data-bs-toggle=\"collapse\" href=\"#i" + msg.mess_id + "\" role=\"button\" \n                                                                aria-expanded=\"false\" aria-controls=\"collapseExample\"> @" + mention.name + " </a>\n                                                                <div class=\"collapse\" id=\"i" + msg.mess_id + "\">\n                                                                    <div class=\"card card-body\">\n                                                                        Name: " + mention.name + " <br>\n                                                                        Mobile Number: " + mention.mobile_number + " <br>\n                                                                    </div>\n                                                                </div>");
                                                        } else {
                                                            var rolePromise = new _ember["default"].RSVP.Promise(function (resolve, reject) {
                                                                _ember["default"].$.ajax({
                                                                    url: _demoappConfigEnvironment["default"].apiHost + '/GetRoleDesc',
                                                                    type: 'POST',
                                                                    contentType: 'application/json',
                                                                    dataType: 'json',
                                                                    xhrFields: { withCredentials: true },
                                                                    data: JSON.stringify({ role_id: memberId }),
                                                                    success: function success(response) {
                                                                        resolve({
                                                                            original: match,
                                                                            replacement: _ember["default"].String.htmlSafe("<a class=\"\" data-bs-toggle=\"collapse\" href=\"#i" + msg.mess_id + "\" \n                                                                                role=\"button\" aria-expanded=\"false\" aria-controls=\"collapseExample\"> @" + response.role_name + " </a>\n                                                                                <div class=\"collapse\" id=\"i" + msg.mess_id + "\">\n                                                                                    <div class=\"card card-body\">\n                                                                                        " + response.role_desc + " <br>\n                                                                                    </div>\n                                                                                </div>")
                                                                        });
                                                                    },
                                                                    error: function error(_error4) {
                                                                        console.log("Error fetching role description:", _error4);
                                                                        reject(_error4);
                                                                    }
                                                                });
                                                            });

                                                            promises.push(rolePromise);
                                                            return match;
                                                        }
                                                    });

                                                    _ember["default"].RSVP.all(promises).then(function (results) {
                                                        results.forEach(function (result) {
                                                            reconstructedMessage = reconstructedMessage.replace(result.original, result.replacement);
                                                        });

                                                        var msg_pack = {
                                                            mess_id: msg.mess_id,
                                                            sender_id: msg.sender_id,
                                                            message: reconstructedMessage,
                                                            enc_message: msg.message,
                                                            iv: msg.iv,
                                                            isforward: msg.isforward,
                                                            receiver_id: msg.grp_id,
                                                            enc_aes_key: msg.enc_aes_key,
                                                            sender_name: msg.sender_name,
                                                            timestamp: msg.timestamp,
                                                            dataFormat: "Text"
                                                        };

                                                        resolve(msg_pack);
                                                    })["catch"](function (error) {
                                                        console.error("Error in processing mentions:", error);
                                                        reject(error);
                                                    });
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
                                                receiver_id: msg.receiver_id,
                                                file_name: imageUrl,
                                                name: msg.file_name,
                                                dataFormat: "Sticker",
                                                isforward: msg.isforward,
                                                sender_name: msg.sender_name,
                                                timestamp: msg.timestamp

                                            });
                                            console.log(stickerPromise);
                                            promises.push(stickerPromise);
                                        }
                                    };

                                    for (var _iterator3 = response.messages[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                        _loop2();
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
                            type: "Private",
                            receiver_id: receiver,
                            ciphertext: encryptedMessage.ciphertext,
                            iv: encryptedMessage.iv,
                            aeskeyReceiver: self.get('Ekey'),
                            aeskeySender: self.get('own'),
                            dataFormat: "Text"

                        };
                        _ember["default"].$.ajax({
                            url: _demoappConfigEnvironment["default"].apiHost + 'MessageHandle',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(mesg),
                            xhrFields: { withCredentials: true },
                            success: function success(response) {
                                console.log(response);
                            },
                            error: function error(_error5) {
                                console.log(_error5);
                            }

                        });
                        // if (message && receiver && self.get('socket')) {
                        //     self.get('AllMessage').pushObject(mesg);
                        //     self.get('socket').send(JSON.stringify({
                        //         type : "Private",
                        //         receiver_id: receiver,
                        //         ciphertext: encryptedMessage.ciphertext,
                        //         iv: encryptedMessage.iv,
                        //         aeskeyReceiver : self.get('Ekey'),
                        //         aeskeySender : self.get('own'),
                        //         dataFormat : "Text",
                        //
                        //     }));
                        //
                        //     self.set('newMessage', '');
                        //     var chatContainer = document.getElementsByClassName("MessageContainer");
                        //     chatContainer.scrollTop = chatContainer.scrollHeight;
                        // }
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
                    error: function error(xhr, status, _error6) {
                        console.error("Logout failed:", _error6);
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
                    error: function error(_error7) {
                        alert("erro on group creation", _error7);
                    }

                });
                console.log("Private key stored successfully!");
            },

            SendMessageOnGroup: function SendMessageOnGroup() {
                var self = this;
                var msgtime = new Date();
                var year = msgtime.getFullYear();
                var month = msgtime.getMonth();
                var date = msgtime.getDate();
                var hour = msgtime.getHours();
                var min = msgtime.getMinutes();
                var sec = msgtime.getSeconds();
                var mentions = self.get('mentions');

                var time = year + "-" + month + "-" + date + " " + hour + ":" + min + ":" + sec;
                console.log(msgtime);
                var message = document.getElementById('MessageInput').value.trim();
                if (!message) return;
                var placeholderMessage = message.replace(/(^|\s)@(\w+)(?=\s|$)/g, function (match, space, username) {
                    var mention = mentions.find(function (m) {
                        return m.name === username;
                    });
                    if (mention) {
                        var placeholder = "@@" + mention.member_id + "@@";
                        return "" + space + placeholder;
                    }
                    return match;
                });

                // console.log(placeholderMap);
                console.log(placeholderMessage);

                document.getElementById("MessageInput").value = "";
                var receiver = self.get('receiver_id');
                var sender_id = self.get('sender_id');
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
                            return _demoappUtilsCrypto["default"].encryptMessage(placeholderMessage, aesKeyObj);
                        }).then(function (encryptedMessage) {
                            var msg_pack = {
                                type: "Group",
                                grp_id: receiver,
                                sender_id: sender_id,
                                ciphertext: encryptedMessage.ciphertext,
                                iv: encryptedMessage.iv,
                                members_aesKey: validKeys,
                                sender_name: self.get('model.curruser.name'),
                                time: time,
                                dataFormat: "Text",
                                mentions: mentions

                            };
                            console.log(msg_pack);
                            _ember["default"].$.ajax({
                                url: _demoappConfigEnvironment["default"].apiHost + 'MessageHandle',
                                type: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify(msg_pack),
                                xhrFields: { withCredentials: true },
                                success: function success(response) {
                                    console.log(response);
                                    self.get('mentions').clear();
                                },
                                error: function error(_error8) {
                                    console.log(_error8);
                                }
                            });
                        })["catch"](function (error) {
                            console.error("Error encrypting message:", error);
                        });
                    });
                }).fail(function (error) {
                    console.error("Error fetching group keys:", error);
                });
                // self.get('AllMessage').pushObject({ sender_id: sender_id, message: message,dataFormat : "Text",timestamp: time});
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
                    error: function error(_error9) {
                        console.log(_error9);
                    }

                });
            },
            OpenViweMember: function OpenViweMember() {
                var self = this;
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
                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = response.grp_members[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
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
                    error: function error(_error10) {
                        console.error(_error10);
                    }

                });
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
                        _ember["default"].$('#viewmodal').modal('hide');
                    },
                    error: function error(_error11) {
                        console.error(_error11);
                    }
                });
            },
            addMembers: function addMembers() {
                var self = this;
                self.get('ViewGrpMembers').clear();
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + 'FetchUsers',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    xhrFields: { withCredentials: true },
                    data: JSON.stringify({ grp_id: self.get('receiver_id') }),
                    success: function success(response) {
                        var _iteratorNormalCompletion5 = true;
                        var _didIteratorError5 = false;
                        var _iteratorError5 = undefined;

                        try {
                            for (var _iterator5 = response.users[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                var mem = _step5.value;

                                self.get('ViewGrpMembers').pushObject(mem);
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
                    error: function error(_error12) {
                        console.error(_error12);
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
                        _ember["default"].$('#addmember').modal('hide');
                    },
                    error: function error(_error13) {
                        alert("error on Adding new members ", _error13);
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
                var formData = new FormData();
                formData.append('sticker', sticker);
                formData.append('receiver_id', self.get('receiver_id'));
                formData.append('isGroup', self.get('isGroup'));
                formData.append('sender_name', self.get('model.curruser.name'));

                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + 'FilesHandling',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        console.log(response);
                    },
                    error: function error(_error14) {
                        console.log(_error14);
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
                document.getElementById("fork-sender").textContent = message.sender_name;
                document.getElementById("fork-msg").textContent = message.message;
                document.getElementById("fork-time").textContent = message.timestamp;
                _ember["default"].$.ajax({
                    url: url,
                    type: 'POST',
                    data: JSON.stringify(datas),
                    contentType: 'json',
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                            for (var _iterator6 = response.users[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                var user = _step6.value;

                                self.get('newMembersForFork').pushObject(user);
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
                    },
                    error: function error(_error15) {
                        console.log(_error15);
                    }

                });

                _ember["default"].$('#forkmessage').modal('show');

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

                        var _iteratorNormalCompletion7 = true;
                        var _didIteratorError7 = false;
                        var _iteratorError7 = undefined;

                        try {
                            var _loop3 = function () {
                                var msg = _step7.value;

                                var promises = [];
                                var forkKeys = [];

                                _iteratorNormalCompletion8 = true;
                                _didIteratorError8 = false;
                                _iteratorError8 = undefined;

                                try {
                                    var _loop4 = function () {
                                        var member = _step8.value;

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

                                    for (_iterator8 = ViewGrpMembers[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                        _loop4();
                                    }
                                } catch (err) {
                                    _didIteratorError8 = true;
                                    _iteratorError8 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                                            _iterator8["return"]();
                                        }
                                    } finally {
                                        if (_didIteratorError8) {
                                            throw _iteratorError8;
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

                            for (var _iterator7 = response_data.messages[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                var _iteratorNormalCompletion8;

                                var _didIteratorError8;

                                var _iteratorError8;

                                var _iterator8, _step8;

                                _loop3();
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
            DeleteMessage: function DeleteMessage(message, option) {
                var self = this;

                var msg_pack = {
                    msg_id: message.mess_id,
                    request_id: self.get('sender_id'),
                    isGroup: self.get('isGroup'),
                    receiver_id: message.receiver_id,
                    option: option,
                    isequal: message.sender_id === self.get('sender_id'),
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
                    error: function error(_error16) {
                        console.error("Error on Deleting Message");
                    }

                });
            },
            ForwardMessage: function ForwardMessage(action) {
                var self = this;
                self.get('forwardMessagearray').clear();
                self.set('countOfforwardMessage', 0);
                self.set('messageForwardMode', action);
            },
            updateForwardMessage: function updateForwardMessage(message) {
                var self = this;
                if (event.target.checked) {
                    self.get('forwardMessagearray').pushObject(message);
                    self.incrementProperty('countOfforwardMessage');
                } else {
                    self.get('forwardMessagearray').removeObject(message);
                    self.decrementProperty('countOfforwardMessage');
                }
                console.log(self.get('forwardMessagearray'));
            },
            updateSelectedUsers: function updateSelectedUsers(user, type) {
                var self = this;
                //selectedUsersForForward
                var forwarduser = self.get('selectedUsersForForward');
                if (forwarduser.length >= 5) {
                    alert("you can  forward this message to 5 members only ");
                    return;
                }
                if (event.target.checked) {
                    forwarduser.pushObject(user);
                } else {
                    forwarduser.removeObject(user);
                }
                console.log(forwarduser);
            },
            doForward: function doForward() {
                var self = this;
                var allMessages = self.get('AllMessage');
                var selectedMessageIds = self.get('forwardMessagearray');
                var selectedusers = self.get('selectedUsersForForward');
                var orderedSelectedMessages = allMessages.filter(function (msg) {
                    return selectedMessageIds.includes(msg);
                });
                var isGroup = self.get('isGroup');
                var sender_id = self.get('sender_id');
                console.log(orderedSelectedMessages);
                var forwardMsgPack = [];
                var groupPromisesCache = {};

                _demoappServicesStorageService["default"].getPrivateKey(sender_id).then(function (privateKey) {
                    var forwardPromises = [];

                    orderedSelectedMessages.forEach(function (msg) {
                        var forward = [];
                        var forwardUserPromises = [];
                        selectedusers.forEach(function (user) {
                            if (msg.dataFormat === 'Sticker') {
                                forwardMsgPack.push({
                                    old_msgid: msg.mess_id,
                                    old_sender_id: msg.sender_id,
                                    file_name: msg.name,
                                    isGroup: user.type === 'group',
                                    dataFormat: msg.dataFormat,
                                    receiver_id: user.type === 'group' ? user.group_id : user.user_id,
                                    sender_name: msg.sender_name
                                });
                            } else {
                                (function () {
                                    var key = isGroup ? msg.enc_aes_key : msg.sender_id === sender_id ? msg.aes_key_sender : msg.aes_key_receiver;

                                    if (user.type === 'private') {
                                        var privatePromise = _demoappUtilsCrypto["default"].decryptAESKey(key, privateKey).then(function (dec_key) {
                                            return window.crypto.subtle.exportKey("raw", dec_key);
                                        }).then(function (arrayBuffer) {
                                            return _demoappUtilsCrypto["default"].encryptAESKey(new Uint8Array(arrayBuffer), user.rsa_public_key);
                                        }).then(function (enc_aes) {
                                            var aes_sender = isGroup ? msg.enc_aes_key : msg.sender_id === sender_id ? msg.aes_key_sender : msg.aes_key_receiver;
                                            forward.push({
                                                receiver_id: user.user_id,
                                                type: 'private',
                                                enc_keys: [aes_sender, enc_aes]
                                            });
                                        })["catch"](function (error) {
                                            return console.error("Error in private message encryption:", error);
                                        });

                                        forwardUserPromises.push(privatePromise);
                                    } else {
                                        if (!groupPromisesCache[user.group_id]) {
                                            groupPromisesCache[user.group_id] = new Promise(function (resolve, reject) {
                                                _ember["default"].$.ajax({
                                                    url: _demoappConfigEnvironment["default"].apiHost + 'FetchGroupMembers',
                                                    type: 'POST',
                                                    contentType: 'application/json',
                                                    dataType: 'json',
                                                    xhrFields: { withCredentials: true },
                                                    data: JSON.stringify({ grp_id: user.group_id }),
                                                    success: function success(response) {
                                                        if (response.grp_members && response.grp_members.length > 0) {
                                                            console.log("Fetched Group Members:", response.grp_members);
                                                            resolve(response.grp_members);
                                                        } else {
                                                            reject(new Error("No members found in group"));
                                                        }
                                                    },
                                                    error: function error(_error17) {
                                                        console.error("Error fetching group members:", _error17);
                                                        reject(_error17);
                                                    }
                                                });
                                            });
                                        }

                                        var groupPromise = groupPromisesCache[user.group_id].then(function (grp_members) {
                                            var memberPromises = grp_members.map(function (member) {
                                                return _demoappUtilsCrypto["default"].decryptAESKey(key, privateKey).then(function (dec_key) {
                                                    return window.crypto.subtle.exportKey("raw", dec_key);
                                                }).then(function (arrayBuffer) {
                                                    return _demoappUtilsCrypto["default"].encryptAESKey(new Uint8Array(arrayBuffer), member.rsa_public_key);
                                                }).then(function (enc_aes) {
                                                    return _defineProperty({}, member.user_id, enc_aes);
                                                });
                                            });

                                            return Promise.all(memberPromises).then(function (keys) {
                                                forward.push({
                                                    receiver_id: user.group_id,
                                                    type: 'group',
                                                    enc_keys: keys
                                                });
                                            });
                                        });

                                        forwardUserPromises.push(groupPromise);
                                    }
                                })();
                            }
                        });

                        var messagePromise = Promise.all(forwardUserPromises).then(function () {
                            if (msg.dataFormat === "Text") {
                                forwardMsgPack.push({
                                    old_msgid: msg.mess_id,
                                    old_sender_id: msg.sender_id,
                                    message: msg.enc_message,
                                    iv: msg.iv,
                                    sender_name: msg.sender_name,
                                    dataFormat: msg.dataFormat,
                                    forwardto: forward
                                });
                            }
                        });

                        //sender_name : msg.sender_name
                        forwardPromises.push(messagePromise);
                    });

                    Promise.all(forwardPromises).then(function () {
                        console.log("Final Forward Message Pack:", forwardMsgPack);
                        _ember["default"].$.ajax({
                            url: _demoappConfigEnvironment["default"].apiHost + '/ForwardMessage',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(forwardMsgPack),
                            xhrFields: { withCredentials: true },
                            success: function success(response) {
                                console.log("Messages forwarded successfully:", response);
                                _ember["default"].$("#exampleModal").modal("hide");
                            },
                            error: function error(_error18) {
                                console.error("Error forwarding messages:", _error18);
                            }
                        });
                    })["catch"](function (error) {
                        console.error("Error processing forward messages:", error);
                    });
                });
            },
            openRoleCreat: function openRoleCreat() {
                var self = this;
                var grp_id = self.get('receiver_id');
                self.get('ViewGrpMembers').clear();
                self.get('selectedPermission').clear();
                self.get('assignMember').clear();
                self.send('ViewMembers', grp_id);
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + '/getPermissions',
                    type: 'POST',
                    contentType: 'application/json',
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        //console.log(response);
                        var permissionsArray = [];
                        var _iteratorNormalCompletion9 = true;
                        var _didIteratorError9 = false;
                        var _iteratorError9 = undefined;

                        try {
                            for (var _iterator9 = Object.keys(response)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                var key = _step9.value;

                                permissionsArray.pushObject({ key: key, value: response[key] });
                            }
                        } catch (err) {
                            _didIteratorError9 = true;
                            _iteratorError9 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                                    _iterator9["return"]();
                                }
                            } finally {
                                if (_didIteratorError9) {
                                    throw _iteratorError9;
                                }
                            }
                        }

                        self.set('permissions', _ember["default"].A(permissionsArray));

                        _ember["default"].$("#createrole").modal("show");
                    },
                    error: function error(_error19) {}

                });
            },

            handlePermission: function handlePermission(id) {
                var self = this;
                if (event.target.checked) {
                    self.get('selectedPermission').pushObject(id);
                } else {
                    self.get('selectedPermission').removeObject(id);
                }
                console.log(self.get('selectedPermission'));
            },
            handleAssignMember: function handleAssignMember(member_id) {
                var self = this;
                if (event.target.checked) {
                    self.get('assignMember').pushObject(member_id);
                } else {
                    self.get('assignMember').removeObject(member_id);
                }
                console.log(self.get('assignMember'));
            },
            createRole: function createRole() {
                var self = this;
                var permissions = self.get('selectedPermission');
                var members = self.get('assignMember');
                var role_name = document.getElementById('role_name').value;
                var role_des = document.getElementById('role_des').value;
                if (!role_name) {
                    alert("Fill all the details");
                }
                var role_details = {
                    role_name: role_name,
                    role_des: role_des,
                    permissions: permissions,
                    members: members,
                    grp_id: self.get('receiver_id')
                };
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + '/CreateRole',
                    type: 'POST',
                    data: JSON.stringify(role_details),
                    contentType: 'application/json',
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        _ember["default"].$("#createrole").modal("hide");
                    },
                    error: function error(_error20) {
                        console.error(_error20);
                    }

                });
            },
            viewRoles: function viewRoles() {
                var self = this;
                var grp_id = self.get('receiver_id');
                self.get('viewrole').clear();
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + '/FetchRoles',
                    type: 'POST',
                    data: JSON.stringify({ grp_id: grp_id }),
                    contentType: 'application/json',
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        console.log(response);
                        var _iteratorNormalCompletion10 = true;
                        var _didIteratorError10 = false;
                        var _iteratorError10 = undefined;

                        try {
                            for (var _iterator10 = response.roles[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                var role = _step10.value;

                                self.get('viewrole').pushObject(role);
                            }
                        } catch (err) {
                            _didIteratorError10 = true;
                            _iteratorError10 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion10 && _iterator10["return"]) {
                                    _iterator10["return"]();
                                }
                            } finally {
                                if (_didIteratorError10) {
                                    throw _iteratorError10;
                                }
                            }
                        }

                        _ember["default"].$("#rolemodel").modal('show');
                    },
                    error: function error(_error21) {
                        console.error(_error21);
                    }
                });
            },
            showAddmemberToRole: function showAddmemberToRole(role_id, role_name) {
                var self = this;
                var grp_id = self.get('receiver_id');
                self.get('ViewGrpMembers').clear();
                self.get('assignMember').clear();
                var role_details = {
                    role_id: role_id,
                    grp_id: grp_id
                };
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + '/FetchMembers',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(role_details),
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        var _iteratorNormalCompletion11 = true;
                        var _didIteratorError11 = false;
                        var _iteratorError11 = undefined;

                        try {
                            for (var _iterator11 = response.grp_members[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                var mem = _step11.value;

                                self.get('ViewGrpMembers').pushObject(mem);
                            }
                        } catch (err) {
                            _didIteratorError11 = true;
                            _iteratorError11 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion11 && _iterator11["return"]) {
                                    _iterator11["return"]();
                                }
                            } finally {
                                if (_didIteratorError11) {
                                    throw _iteratorError11;
                                }
                            }
                        }
                    },
                    error: function error(_error22) {
                        console.error(_error22);
                    }

                });
                document.getElementById('rolename').innerText = "Add Member's to " + role_name;
                document.getElementById('roleID').value = role_id;
                _ember["default"].$("#addMemberToRole").modal('show');
            },
            addMemberToRole: function addMemberToRole() {
                var self = this;
                var grp_id = self.get('receiver_id');
                var role_id = document.getElementById('roleID').value;
                var members = self.get('assignMember');

                var member_details = {
                    role_id: role_id,
                    grp_id: grp_id,
                    members: members
                };
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + '/AddMemberToRole',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(member_details),
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        _ember["default"].$("#addMemberToRole").modal('hide');
                    },
                    error: function error(_error23) {}

                });
            },
            removeMemberFromRole: function removeMemberFromRole(member_id, role_id) {
                var self = this;
                var grp_id = self.get('receiver_id');
                var details = {
                    grp_id: grp_id,
                    member_id: member_id,
                    role_id: role_id
                };
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + '/RemoveMemberFromRole',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(details),
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        _ember["default"].$("#rolemodel").modal('hide');
                    },
                    error: function error(_error24) {
                        console.error(_error24);
                    }

                });
            },
            deleteRoleFromGrp: function deleteRoleFromGrp(role_id) {
                var self = this;
                var grp_id = self.get('receiver_id');
                var role_details = {
                    grp_id: grp_id,
                    role_id: role_id
                };
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + '/DeleteRoleFromGrp',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(role_details),
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        _ember["default"].$("#rolemodel").modal('hide');
                    },
                    error: function error(_error25) {
                        console.error(_error25);
                    }

                });
            },
            detectMention: function detectMention() {
                var self = this;
                var grp_id = self.get('receiver_id');
                var msg = document.getElementById('MessageInput').value;
                if (msg[msg.length - 1] === '@' && msg.length >= 2 && msg[msg.length - 2] == ' ' || msg.length == 1 && msg[msg.length - 1] == '@') {
                    _ember["default"].$("#mentionmodal").modal("show");
                }
            },
            addMentionMember: function addMentionMember(member_id, name, type) {
                var self = this;

                self.get('mentions').pushObject({ member_id: member_id, type: type, name: name });

                var msg = document.getElementById('MessageInput').value;
                document.getElementById('MessageInput').value = msg + name;
                _ember["default"].$("#mentionmodal").modal("hide");
            },
            getRole: function getRole() {
                var self = this;
                var grp_id = self.get('receiver_id');
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + '/GetRole',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ grp_id: grp_id }),
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        var _iteratorNormalCompletion12 = true;
                        var _didIteratorError12 = false;
                        var _iteratorError12 = undefined;

                        try {
                            for (var _iterator12 = response.roles[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                                var role = _step12.value;

                                self.get('getRoles').pushObject(role);
                            }
                        } catch (err) {
                            _didIteratorError12 = true;
                            _iteratorError12 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion12 && _iterator12["return"]) {
                                    _iterator12["return"]();
                                }
                            } finally {
                                if (_didIteratorError12) {
                                    throw _iteratorError12;
                                }
                            }
                        }
                    },
                    error: function error(_error26) {
                        console.log(_error26);
                    }

                });
            },
            editPermission: function editPermission(role_id, permission_id) {
                var self = this;
                var permission_details = {
                    role_id: role_id,
                    permission_id: permission_id,
                    grp_id: self.get('receiver_id'),
                    ischeck: event.target.checked
                };
                console.log(permission_details);
                _ember["default"].$.ajax({
                    url: _demoappConfigEnvironment["default"].apiHost + '/EditPermission',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(permission_details),
                    xhrFields: { withCredentials: true },
                    success: function success(response) {
                        console.log(response);
                    },
                    error: function error(_error27) {
                        console.error(_error27);
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
define('demoapp/helpers/checkPermission', ['exports', 'ember'], function (exports, _ember) {

  _ember['default'].Handlebars.registerHelper('checkPermission', function (permissionName, permissionsArray) {});
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
define("demoapp/templates/chat",["exports"],function(exports){exports["default"] = Ember.HTMLBars.template((function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":29,"column":12},"end":{"line":37,"column":12}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                ");dom.appendChild(el0,el1);var el1=dom.createElement("li");dom.setAttribute(el1,"class","card flex-row align-items-center justify-content-around   group ");var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatar");dom.setAttribute(el2,"style","width: 50px; height: 50px;");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","align-items-center");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","text-success");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element84=dom.childAt(fragment,[1]);var morphs=new Array(4);morphs[0] = dom.createElementMorph(element84);morphs[1] = dom.createMorphAt(dom.childAt(element84,[3]),0,0);morphs[2] = dom.createMorphAt(dom.childAt(element84,[5]),0,0);morphs[3] = dom.createMorphAt(dom.childAt(element84,[7]),0,0);return morphs;},statements:[["element","action",["fetchchat",["get","message",["loc",[null,[30,115],[30,122]]]],"Private"],[],["loc",[null,[30,94],[30,135]]]],["content","message.name",["loc",[null,[32,54],[32,70]]]],["content","message.mobile_number",["loc",[null,[33,39],[33,64]]]],["content","message.status",["loc",[null,[34,51],[34,69]]]]],locals:["message"],templates:[]};})();var child1=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":45,"column":24},"end":{"line":47,"column":24}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                            ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-at text-success fs-3");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(){return [];},statements:[],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":38,"column":12},"end":{"line":54,"column":12}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                ");dom.appendChild(el0,el1);var el1=dom.createElement("li");dom.setAttribute(el1,"class","card flex-row justify-content-between text-align-center group");var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex flex-row");var el3=dom.createTextNode("\n                        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","avatar");dom.setAttribute(el3,"style","width: 50px; height: 50px;");var el4=dom.createElement("img");dom.setAttribute(el4,"src","assets/profile.png");dom.setAttribute(el4,"alt","");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                        ");dom.appendChild(el2,el3);var el3=dom.createElement("p");dom.setAttribute(el3,"class","GroupName");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");var el3=dom.createTextNode("\n");dom.appendChild(el2,el3);var el3=dom.createComment("");dom.appendChild(el2,el3);var el3=dom.createTextNode("                    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n\n\n                ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element83=dom.childAt(fragment,[1]);var morphs=new Array(3);morphs[0] = dom.createElementMorph(element83);morphs[1] = dom.createMorphAt(dom.childAt(element83,[1,3]),0,0);morphs[2] = dom.createMorphAt(dom.childAt(element83,[3]),1,1);return morphs;},statements:[["element","action",["fetchchat",["get","group",["loc",[null,[39,111],[39,116]]]],"Group"],[],["loc",[null,[39,90],[39,127]]]],["content","group.name",["loc",[null,[42,45],[42,59]]]],["block","if",[["get","group.unseen",["loc",[null,[45,30],[45,42]]]]],[],0,null,["loc",[null,[45,24],[47,31]]]]],locals:["group"],templates:[child0]};})();var child2=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":75,"column":20},"end":{"line":77,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-person-add add text-success fs-1");dom.setAttribute(el1,"title","Add members");dom.setAttribute(el1,"data-bs-toggle","modal");dom.setAttribute(el1,"data-bs-target","#addmember");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element80=dom.childAt(fragment,[1]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element80);return morphs;},statements:[["element","action",["addMembers"],["on","click"],["loc",[null,[76,94],[76,128]]]]],locals:[],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":79,"column":20},"end":{"line":82,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-eye text-primary  fs-1");dom.setAttribute(el1,"title","View Role");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n                    ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-folder-plus text-danger  fs-1");dom.setAttribute(el1,"title","Create Role");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element78=dom.childAt(fragment,[1]);var element79=dom.childAt(fragment,[3]);var morphs=new Array(2);morphs[0] = dom.createElementMorph(element78);morphs[1] = dom.createElementMorph(element79);return morphs;},statements:[["element","action",["viewRoles"],["on","click"],["loc",[null,[80,104],[80,138]]]],["element","action",["openRoleCreat"],["on","click"],["loc",[null,[81,114],[81,152]]]]],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":73,"column":16},"end":{"line":85,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-box-arrow-right text-danger  fs-1");dom.setAttribute(el1,"title","Exit");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createComment("");dom.appendChild(el0,el1);var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-eye-fill text-warning fs-1");dom.setAttribute(el1,"title","View members");dom.setAttribute(el1,"data-bs-toggle","modal");dom.setAttribute(el1,"data-bs-target","#viewmodal");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createComment("");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element81=dom.childAt(fragment,[1]);var element82=dom.childAt(fragment,[5]);var morphs=new Array(4);morphs[0] = dom.createElementMorph(element81);morphs[1] = dom.createMorphAt(fragment,3,3,contextualElement);morphs[2] = dom.createElementMorph(element82);morphs[3] = dom.createMorphAt(fragment,7,7,contextualElement);return morphs;},statements:[["element","action",["ExitGroup",["get","model.curruser.user_id",["loc",[null,[74,131],[74,153]]]]],["on","click"],["loc",[null,[74,110],[74,166]]]],["block","if",[["get","canAddMember",["loc",[null,[75,26],[75,38]]]]],[],0,null,["loc",[null,[75,20],[77,27]]]],["element","action",["OpenViweMember"],["on","click"],["loc",[null,[78,85],[78,123]]]],["block","if",[["get","isAdmin",["loc",[null,[79,26],[79,33]]]]],[],1,null,["loc",[null,[79,20],[82,27]]]]],locals:[],templates:[child0,child1]};})();var child3=(function(){var child0=(function(){var child0=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":95,"column":32},"end":{"line":97,"column":32}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("input");dom.setAttribute(el1,"type","checkbox");dom.setAttribute(el1,"id","mf");dom.setAttribute(el1,"name","mf");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element71=dom.childAt(fragment,[1]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element71);return morphs;},statements:[["element","action",["updateForwardMessage",["get","message",["loc",[null,[96,91],[96,98]]]]],["on","change"],["loc",[null,[96,59],[96,113]]]]],locals:[],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":99,"column":32},"end":{"line":101,"column":32}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("span");var el2=dom.createTextNode("Forward");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(){return [];},statements:[],locals:[],templates:[]};})();var child2=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":111,"column":40},"end":{"line":113,"column":40}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                            ");dom.appendChild(el0,el1);var el1=dom.createElement("li");var el2=dom.createElement("a");dom.setAttribute(el2,"class","dropdown-item");var el3=dom.createTextNode("Delete for everyone message");dom.appendChild(el2,el3);dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element70=dom.childAt(fragment,[1,0]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element70);return morphs;},statements:[["element","action",["DeleteMessage",["get","message",["loc",[null,[112,98],[112,105]]]],"DFE"],["on","click"],["loc",[null,[112,73],[112,124]]]]],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":92,"column":20},"end":{"line":128,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","message  card d-flex flex-column w-25 you");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex flex-row justify-content-between");var el3=dom.createTextNode("\n");dom.appendChild(el2,el3);var el3=dom.createComment("");dom.appendChild(el2,el3);var el3=dom.createTextNode("                                ");dom.appendChild(el2,el3);var el3=dom.createElement("span");dom.setAttribute(el3,"class","senderName");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n");dom.appendChild(el2,el3);var el3=dom.createComment("");dom.appendChild(el2,el3);var el3=dom.createTextNode("                                ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","dropdown");var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("button");dom.setAttribute(el4,"class","btn");dom.setAttribute(el4,"type","button");dom.setAttribute(el4,"data-bs-toggle","dropdown");dom.setAttribute(el4,"aria-expanded","false");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);dom.setNamespace("http://www.w3.org/2000/svg");var el5=dom.createElement("svg");dom.setAttribute(el5,"width","12");dom.setAttribute(el5,"height","14");dom.setAttribute(el5,"fill","currentColor");dom.setAttribute(el5,"class","bi bi-three-dots-vertical");dom.setAttribute(el5,"viewBox","0 0 16 16");var el6=dom.createTextNode("\n                                            ");dom.appendChild(el5,el6);var el6=dom.createElement("path");dom.setAttribute(el6,"d","M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);dom.setNamespace(null);var el4=dom.createElement("ul");dom.setAttribute(el4,"class","dropdown-menu dropdown-menu-dark bg-dark");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("fork from here");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Delete for me message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);var el5=dom.createTextNode("                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Forward message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("hr");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","messageContent");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","messageDetails");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("span");dom.setAttribute(el3,"class","messageTime");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                        ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element72=dom.childAt(fragment,[1]);var element73=dom.childAt(element72,[1]);var element74=dom.childAt(element73,[7,3]);var element75=dom.childAt(element74,[1,0]);var element76=dom.childAt(element74,[3,0]);var element77=dom.childAt(element74,[7,0]);var morphs=new Array(9);morphs[0] = dom.createMorphAt(element73,1,1);morphs[1] = dom.createMorphAt(dom.childAt(element73,[3]),0,0);morphs[2] = dom.createMorphAt(element73,5,5);morphs[3] = dom.createElementMorph(element75);morphs[4] = dom.createElementMorph(element76);morphs[5] = dom.createMorphAt(element74,5,5);morphs[6] = dom.createElementMorph(element77);morphs[7] = dom.createUnsafeMorphAt(dom.childAt(element72,[5]),0,0);morphs[8] = dom.createMorphAt(dom.childAt(element72,[7,1]),0,0);return morphs;},statements:[["block","if",[["get","messageForwardMode",["loc",[null,[95,38],[95,56]]]]],[],0,null,["loc",[null,[95,32],[97,39]]]],["content","message.sender_name",["loc",[null,[98,57],[98,80]]]],["block","if",[["get","message.isforward",["loc",[null,[99,38],[99,55]]]]],[],1,null,["loc",[null,[99,32],[101,39]]]],["element","action",["ForkMessage",["get","message",["loc",[null,[109,92],[109,99]]]]],["on","click"],["loc",[null,[109,69],[109,112]]]],["element","action",["DeleteMessage",["get","message",["loc",[null,[110,94],[110,101]]]],"DFM"],["on","click"],["loc",[null,[110,69],[110,120]]]],["block","if",[["get","canDeleteMessage",["loc",[null,[111,46],[111,62]]]]],[],2,null,["loc",[null,[111,40],[113,47]]]],["element","action",["ForwardMessage",true],["on","click"],["loc",[null,[114,69],[114,114]]]],["content","message.message",["loc",[null,[121,54],[121,75]]]],["content","message.timestamp",["loc",[null,[123,58],[123,79]]]]],locals:[],templates:[child0,child1,child2]};})();var child1=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":131,"column":32},"end":{"line":133,"column":32}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                ");dom.appendChild(el0,el1);var el1=dom.createElement("input");dom.setAttribute(el1,"type","checkbox");dom.setAttribute(el1,"id","mf");dom.setAttribute(el1,"name","mf");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element61=dom.childAt(fragment,[1]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element61);return morphs;},statements:[["element","action",["updateForwardMessage",["get","message",["loc",[null,[132,87],[132,94]]]]],["on","change"],["loc",[null,[132,55],[132,109]]]]],locals:[],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":135,"column":32},"end":{"line":137,"column":32}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("span");var el2=dom.createTextNode("Forward");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(){return [];},statements:[],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":128,"column":20},"end":{"line":167,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","message me  card d-flex flex-column w-25");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex flex-row justify-content-between");var el3=dom.createTextNode("\n");dom.appendChild(el2,el3);var el3=dom.createComment("");dom.appendChild(el2,el3);var el3=dom.createTextNode("                                ");dom.appendChild(el2,el3);var el3=dom.createElement("span");dom.setAttribute(el3,"class","senderName");var el4=dom.createTextNode("you");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n");dom.appendChild(el2,el3);var el3=dom.createComment("");dom.appendChild(el2,el3);var el3=dom.createTextNode("                                ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","dropdown");var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("button");dom.setAttribute(el4,"class","btn");dom.setAttribute(el4,"type","button");dom.setAttribute(el4,"data-bs-toggle","dropdown");dom.setAttribute(el4,"aria-expanded","false");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);dom.setNamespace("http://www.w3.org/2000/svg");var el5=dom.createElement("svg");dom.setAttribute(el5,"width","12");dom.setAttribute(el5,"height","14");dom.setAttribute(el5,"fill","currentColor");dom.setAttribute(el5,"class","bi bi-three-dots-vertical");dom.setAttribute(el5,"viewBox","0 0 16 16");var el6=dom.createTextNode("\n                                            ");dom.appendChild(el5,el6);var el6=dom.createElement("path");dom.setAttribute(el6,"d","M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);dom.setNamespace(null);var el4=dom.createElement("ul");dom.setAttribute(el4,"class","dropdown-menu dropdown-menu-dark bg-dark");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("fork from here");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Delete for me message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Delete for everyone message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Forward message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Edit message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("hr");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex justify-content-start");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("p");dom.setAttribute(el3,"class","messageContent");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","messageDetails");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("span");dom.setAttribute(el3,"class","messageTime");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                        ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element62=dom.childAt(fragment,[1]);var element63=dom.childAt(element62,[1]);var element64=dom.childAt(element63,[7,3]);var element65=dom.childAt(element64,[1,0]);var element66=dom.childAt(element64,[3,0]);var element67=dom.childAt(element64,[5,0]);var element68=dom.childAt(element64,[7,0]);var element69=dom.childAt(element64,[9,0]);var morphs=new Array(9);morphs[0] = dom.createMorphAt(element63,1,1);morphs[1] = dom.createMorphAt(element63,5,5);morphs[2] = dom.createElementMorph(element65);morphs[3] = dom.createElementMorph(element66);morphs[4] = dom.createElementMorph(element67);morphs[5] = dom.createElementMorph(element68);morphs[6] = dom.createElementMorph(element69);morphs[7] = dom.createUnsafeMorphAt(dom.childAt(element62,[5,1]),0,0);morphs[8] = dom.createMorphAt(dom.childAt(element62,[7,1]),0,0);return morphs;},statements:[["block","if",[["get","messageForwardMode",["loc",[null,[131,38],[131,56]]]]],[],0,null,["loc",[null,[131,32],[133,39]]]],["block","if",[["get","message.isforward",["loc",[null,[135,38],[135,55]]]]],[],1,null,["loc",[null,[135,32],[137,39]]]],["element","action",["ForkMessage",["get","message",["loc",[null,[145,92],[145,99]]]]],["on","click"],["loc",[null,[145,69],[145,112]]]],["element","action",["DeleteMessage",["get","message",["loc",[null,[146,94],[146,101]]]],"DFM"],["on","click"],["loc",[null,[146,69],[146,120]]]],["element","action",["DeleteMessage",["get","message",["loc",[null,[147,94],[147,101]]]],"DFE"],["on","click"],["loc",[null,[147,69],[147,120]]]],["element","action",["ForwardMessage",true],["on","click"],["loc",[null,[148,69],[148,114]]]],["element","action",["EditMessage",true],["on","click"],["loc",[null,[149,69],[149,111]]]],["content","message.message",["loc",[null,[158,58],[158,79]]]],["content","message.timestamp",["loc",[null,[162,58],[162,79]]]]],locals:[],templates:[child0,child1]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":91,"column":16},"end":{"line":168,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createComment("");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(1);morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);dom.insertBoundary(fragment,0);dom.insertBoundary(fragment,null);return morphs;},statements:[["block","if",[["subexpr","neq",[["get","message.sender_id",["loc",[null,[92,31],[92,48]]]],["get","model.curruser.user_id",["loc",[null,[92,49],[92,71]]]]],[],["loc",[null,[92,26],[92,72]]]]],[],0,1,["loc",[null,[92,20],[167,27]]]]],locals:[],templates:[child0,child1]};})();var child1=(function(){var child0=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":173,"column":32},"end":{"line":175,"column":32}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("input");dom.setAttribute(el1,"type","checkbox");dom.setAttribute(el1,"id","mf");dom.setAttribute(el1,"name","mf");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element52=dom.childAt(fragment,[1]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element52);return morphs;},statements:[["element","action",["updateForwardMessage",["get","message",["loc",[null,[174,91],[174,98]]]]],["on","change"],["loc",[null,[174,59],[174,113]]]]],locals:[],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":187,"column":40},"end":{"line":189,"column":40}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                            ");dom.appendChild(el0,el1);var el1=dom.createElement("li");var el2=dom.createElement("a");dom.setAttribute(el2,"class","dropdown-item");var el3=dom.createTextNode("Delete for everyone message");dom.appendChild(el2,el3);dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element51=dom.childAt(fragment,[1,0]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element51);return morphs;},statements:[["element","action",["DeleteMessage",["get","message",["loc",[null,[188,98],[188,105]]]],"DFE"],["on","click"],["loc",[null,[188,73],[188,124]]]]],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":170,"column":20},"end":{"line":200,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","message syou");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex justify-content-between");var el3=dom.createTextNode("\n");dom.appendChild(el2,el3);var el3=dom.createComment("");dom.appendChild(el2,el3);var el3=dom.createTextNode("                                ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","dropdown");var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("span");dom.setAttribute(el4,"class","text-danger");var el5=dom.createComment("");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("button");dom.setAttribute(el4,"class","btn");dom.setAttribute(el4,"type","button");dom.setAttribute(el4,"data-bs-toggle","dropdown");dom.setAttribute(el4,"aria-expanded","false");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);dom.setNamespace("http://www.w3.org/2000/svg");var el5=dom.createElement("svg");dom.setAttribute(el5,"width","12");dom.setAttribute(el5,"height","14");dom.setAttribute(el5,"fill","currentColor");dom.setAttribute(el5,"class","bi bi-three-dots-vertical");dom.setAttribute(el5,"viewBox","0 0 16 16");var el6=dom.createTextNode("\n                                            ");dom.appendChild(el5,el6);var el6=dom.createElement("path");dom.setAttribute(el6,"d","M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);dom.setNamespace(null);var el4=dom.createElement("ul");dom.setAttribute(el4,"class","dropdown-menu dropdown-menu-dark bg-dark");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("fork from here");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Delete for me message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                       ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Forward message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n\n\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("img");dom.setAttribute(el2,"class","sticker-icon");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element53=dom.childAt(fragment,[1]);var element54=dom.childAt(element53,[1]);var element55=dom.childAt(element54,[3]);var element56=dom.childAt(element55,[5]);var element57=dom.childAt(element56,[1,0]);var element58=dom.childAt(element56,[3,0]);var element59=dom.childAt(element56,[7,0]);var element60=dom.childAt(element53,[3]);var morphs=new Array(7);morphs[0] = dom.createMorphAt(element54,1,1);morphs[1] = dom.createMorphAt(dom.childAt(element55,[1]),0,0);morphs[2] = dom.createElementMorph(element57);morphs[3] = dom.createElementMorph(element58);morphs[4] = dom.createMorphAt(element56,5,5);morphs[5] = dom.createElementMorph(element59);morphs[6] = dom.createAttrMorph(element60,'src');return morphs;},statements:[["block","if",[["get","messageForwardMode",["loc",[null,[173,38],[173,56]]]]],[],0,null,["loc",[null,[173,32],[175,39]]]],["content","message.sender_name",["loc",[null,[177,62],[177,85]]]],["element","action",["ForkMessage",["get","message",["loc",[null,[185,92],[185,99]]]]],["on","click"],["loc",[null,[185,69],[185,112]]]],["element","action",["DeleteMessage",["get","message",["loc",[null,[186,94],[186,101]]]],"DFM"],["on","click"],["loc",[null,[186,69],[186,120]]]],["block","if",[["get","canDeleteMessage",["loc",[null,[187,46],[187,62]]]]],[],1,null,["loc",[null,[187,40],[189,47]]]],["element","action",["ForwardMessage",true],["on","click"],["loc",[null,[191,68],[191,113]]]],["attribute","src",["concat",[["get","message.file_name",["loc",[null,[198,36],[198,53]]]]]]]],locals:[],templates:[child0,child1]};})();var child1=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":203,"column":32},"end":{"line":205,"column":32}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("input");dom.setAttribute(el1,"type","checkbox");dom.setAttribute(el1,"id","mf");dom.setAttribute(el1,"name","mf");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element42=dom.childAt(fragment,[1]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element42);return morphs;},statements:[["element","action",["updateForwardMessage",["get","message",["loc",[null,[204,91],[204,98]]]]],["on","change"],["loc",[null,[204,59],[204,113]]]]],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":200,"column":20},"end":{"line":229,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class"," message sme");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex justify-content-between");var el3=dom.createTextNode("\n");dom.appendChild(el2,el3);var el3=dom.createComment("");dom.appendChild(el2,el3);var el3=dom.createTextNode("                                ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","dropdown");var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("span");dom.setAttribute(el4,"class","text-danger");var el5=dom.createTextNode("you");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n\n                                    ");dom.appendChild(el3,el4);var el4=dom.createElement("button");dom.setAttribute(el4,"class","btn");dom.setAttribute(el4,"type","button");dom.setAttribute(el4,"data-bs-toggle","dropdown");dom.setAttribute(el4,"aria-expanded","false");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);dom.setNamespace("http://www.w3.org/2000/svg");var el5=dom.createElement("svg");dom.setAttribute(el5,"width","12");dom.setAttribute(el5,"height","14");dom.setAttribute(el5,"fill","currentColor");dom.setAttribute(el5,"class","bi bi-three-dots-vertical");dom.setAttribute(el5,"viewBox","0 0 16 16");var el6=dom.createTextNode("\n                                            ");dom.appendChild(el5,el6);var el6=dom.createElement("path");dom.setAttribute(el6,"d","M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                    ");dom.appendChild(el3,el4);dom.setNamespace(null);var el4=dom.createElement("ul");dom.setAttribute(el4,"class","dropdown-menu dropdown-menu-dark bg-dark");var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("fork from here");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Delete for me message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Delete for everyone message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                        ");dom.appendChild(el4,el5);var el5=dom.createElement("li");var el6=dom.createElement("a");dom.setAttribute(el6,"class","dropdown-item");var el7=dom.createTextNode("Forward message");dom.appendChild(el6,el7);dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n\n                                    ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("img");dom.setAttribute(el2,"class","sticker-icon");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","messageDetails");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("span");dom.setAttribute(el3,"class","messageTime");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element43=dom.childAt(fragment,[1]);var element44=dom.childAt(element43,[1]);var element45=dom.childAt(element44,[3,5]);var element46=dom.childAt(element45,[1,0]);var element47=dom.childAt(element45,[3,0]);var element48=dom.childAt(element45,[5,0]);var element49=dom.childAt(element45,[7,0]);var element50=dom.childAt(element43,[3]);var morphs=new Array(7);morphs[0] = dom.createMorphAt(element44,1,1);morphs[1] = dom.createElementMorph(element46);morphs[2] = dom.createElementMorph(element47);morphs[3] = dom.createElementMorph(element48);morphs[4] = dom.createElementMorph(element49);morphs[5] = dom.createAttrMorph(element50,'src');morphs[6] = dom.createMorphAt(dom.childAt(element43,[5,1]),0,0);return morphs;},statements:[["block","if",[["get","messageForwardMode",["loc",[null,[203,38],[203,56]]]]],[],0,null,["loc",[null,[203,32],[205,39]]]],["element","action",["ForkMessage",["get","message",["loc",[null,[215,92],[215,99]]]]],["on","click"],["loc",[null,[215,69],[215,112]]]],["element","action",["DeleteMessage",["get","message",["loc",[null,[216,94],[216,101]]]],"DFM"],["on","click"],["loc",[null,[216,69],[216,120]]]],["element","action",["DeleteMessage",["get","message",["loc",[null,[217,94],[217,101]]]],"DFE"],["on","click"],["loc",[null,[217,69],[217,120]]]],["element","action",["ForwardMessage",true],["on","click"],["loc",[null,[218,69],[218,114]]]],["attribute","src",["concat",[["get","message.file_name",["loc",[null,[224,40],[224,57]]]]]]],["content","message.timestamp",["loc",[null,[226,58],[226,79]]]]],locals:[],templates:[child0]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":169,"column":16},"end":{"line":230,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createComment("");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(1);morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);dom.insertBoundary(fragment,0);dom.insertBoundary(fragment,null);return morphs;},statements:[["block","if",[["subexpr","neq",[["get","message.sender_id",["loc",[null,[170,31],[170,48]]]],["get","model.curruser.user_id",["loc",[null,[170,49],[170,71]]]]],[],["loc",[null,[170,26],[170,72]]]]],[],0,1,["loc",[null,[170,20],[229,27]]]]],locals:[],templates:[child0,child1]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":90,"column":12},"end":{"line":231,"column":12}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createComment("");dom.appendChild(el0,el1);var el1=dom.createComment("");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(2);morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);morphs[1] = dom.createMorphAt(fragment,1,1,contextualElement);dom.insertBoundary(fragment,0);dom.insertBoundary(fragment,null);return morphs;},statements:[["block","if",[["subexpr","eq",[["get","message.dataFormat",["loc",[null,[91,26],[91,44]]]],"Text"],[],["loc",[null,[91,22],[91,52]]]]],[],0,null,["loc",[null,[91,16],[168,23]]]],["block","if",[["subexpr","eq",[["get","message.dataFormat",["loc",[null,[169,26],[169,44]]]],"Sticker"],[],["loc",[null,[169,22],[169,55]]]]],[],1,null,["loc",[null,[169,16],[230,23]]]]],locals:["message"],templates:[child0,child1]};})();var child4=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":237,"column":12},"end":{"line":249,"column":12}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","card d-flex gap-3 w-100 p-2");var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","card-title d-flex justify-content-between ");var el3=dom.createTextNode("\n                        ");dom.appendChild(el2,el3);var el3=dom.createElement("h3");var el4=dom.createTextNode("Forward Messages");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                        ");dom.appendChild(el2,el3);var el3=dom.createElement("button");dom.setAttribute(el3,"type","button");dom.setAttribute(el3,"class","btn-close btn btn-danger");dom.setAttribute(el3,"aria-label","Close");dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex justify-content-around");var el3=dom.createTextNode("\n                        ");dom.appendChild(el2,el3);var el3=dom.createElement("span");var el4=dom.createComment("");dom.appendChild(el3,el4);var el4=dom.createTextNode(" messages selected");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                        ");dom.appendChild(el2,el3);var el3=dom.createElement("button");dom.setAttribute(el3,"type","button");dom.setAttribute(el3,"class","btn btn-success");dom.setAttribute(el3,"data-bs-toggle","modal");dom.setAttribute(el3,"data-bs-target","#exampleModal");var el4=dom.createTextNode("forward");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element39=dom.childAt(fragment,[1]);var element40=dom.childAt(element39,[1,3]);var morphs=new Array(2);morphs[0] = dom.createElementMorph(element40);morphs[1] = dom.createMorphAt(dom.childAt(element39,[3,1]),0,0);return morphs;},statements:[["element","action",["ForwardMessage",false],["on","click"],["loc",[null,[241,79],[241,123]]]],["content","countOfforwardMessage",["loc",[null,[244,30],[244,55]]]]],locals:[],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":249,"column":12},"end":{"line":253,"column":12}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                ");dom.appendChild(el0,el1);var el1=dom.createComment("");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n            ");dom.appendChild(el0,el1);var el1=dom.createElement("button");dom.setAttribute(el1,"type","button");var el2=dom.createTextNode("stickers");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n            ");dom.appendChild(el0,el1);var el1=dom.createElement("button");dom.setAttribute(el1,"type","submit");dom.setAttribute(el1,"class","Send");var el2=dom.createTextNode("send");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element37=dom.childAt(fragment,[3]);var element38=dom.childAt(fragment,[5]);var morphs=new Array(3);morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);morphs[1] = dom.createElementMorph(element37);morphs[2] = dom.createElementMorph(element38);return morphs;},statements:[["inline","input",[],["type","text","id","MessageInput","name","MessageInput","value",["subexpr","@mut",[["get","messageText",["loc",[null,[250,80],[250,91]]]]],[],[]],"input",["subexpr","if",[["get","isGroup",["loc",[null,[250,102],[250,109]]]],["subexpr","action",["detectMention"],[],["loc",[null,[250,110],[250,134]]]]],[],["loc",[null,[250,98],[250,135]]]]],["loc",[null,[250,16],[250,137]]]],["element","action",["openStickerPicker"],[],["loc",[null,[251,34],[251,64]]]],["element","action",[["subexpr","if",[["get","isGroup",["loc",[null,[252,47],[252,54]]]],"SendMessageOnGroup","sendMessage"],[],["loc",[null,[252,43],[252,90]]]]],["on","click"],["loc",[null,[252,34],[252,104]]]]],locals:[],templates:[]};})();var child2=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":259,"column":16},"end":{"line":261,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("img");dom.setAttribute(el1,"class","sticker-icon");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element36=dom.childAt(fragment,[1]);var morphs=new Array(2);morphs[0] = dom.createAttrMorph(element36,'src');morphs[1] = dom.createElementMorph(element36);return morphs;},statements:[["attribute","src",["concat",[["get","sticker.url",["loc",[null,[260,32],[260,43]]]]]]],["element","action",["extractSticker",["get","sticker.url",["loc",[null,[260,94],[260,105]]]]],["on","click"],["loc",[null,[260,68],[260,118]]]]],locals:["sticker"],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":257,"column":8},"end":{"line":263,"column":8}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("            ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","sticker-picker");var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);var el2=dom.createComment("");dom.appendChild(el1,el2);var el2=dom.createTextNode("            ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(1);morphs[0] = dom.createMorphAt(dom.childAt(fragment,[1]),1,1);return morphs;},statements:[["block","each",[["get","stickers",["loc",[null,[259,24],[259,32]]]]],[],0,null,["loc",[null,[259,16],[261,25]]]]],locals:[],templates:[child0]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":233,"column":8},"end":{"line":265,"column":12}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","messageCenter");var el2=dom.createTextNode("\n\n        ");dom.appendChild(el1,el2);var el2=dom.createElement("form");dom.setAttribute(el2,"id","MessageForm");var el3=dom.createTextNode("\n");dom.appendChild(el2,el3);var el3=dom.createComment("");dom.appendChild(el2,el3);var el3=dom.createTextNode("\n\n        ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);var el2=dom.createComment("");dom.appendChild(el1,el2);var el2=dom.createTextNode("        ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element41=dom.childAt(fragment,[1]);var morphs=new Array(2);morphs[0] = dom.createMorphAt(dom.childAt(element41,[1]),1,1);morphs[1] = dom.createMorphAt(element41,3,3);return morphs;},statements:[["block","if",[["get","messageForwardMode",["loc",[null,[237,18],[237,36]]]]],[],0,1,["loc",[null,[237,12],[253,19]]]],["block","if",[["get","showStickerPicker",["loc",[null,[257,14],[257,31]]]]],[],2,null,["loc",[null,[257,8],[263,15]]]]],locals:[],templates:[child0,child1,child2]};})();var child5=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":279,"column":16},"end":{"line":287,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class"," d-flex justify-content-around align-items-center");var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("p");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("span");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("input");dom.setAttribute(el2,"type","checkbox");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n                    ");dom.appendChild(el0,el1);var el1=dom.createElement("hr");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element34=dom.childAt(fragment,[1]);var element35=dom.childAt(element34,[7]);var morphs=new Array(3);morphs[0] = dom.createMorphAt(dom.childAt(element34,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element34,[5]),0,0);morphs[2] = dom.createElementMorph(element35);return morphs;},statements:[["content","message.name",["loc",[null,[282,27],[282,43]]]],["content","message.mobile_number",["loc",[null,[283,31],[283,56]]]],["element","action",["addUsertoGroup",["get","message.user_id",["loc",[null,[284,74],[284,89]]]]],["on","change"],["loc",[null,[284,48],[284,103]]]]],locals:["message"],templates:[]};})();var child6=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":317,"column":16},"end":{"line":325,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("li");dom.setAttribute(el1,"class","card flex-row align-items-center justify-content-around   group ");var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatar");dom.setAttribute(el2,"style","width: 50px; height: 50px;");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","align-items-center");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("input");dom.setAttribute(el2,"type","checkbox");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element32=dom.childAt(fragment,[1]);var element33=dom.childAt(element32,[7]);var morphs=new Array(3);morphs[0] = dom.createMorphAt(dom.childAt(element32,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element32,[5]),0,0);morphs[2] = dom.createElementMorph(element33);return morphs;},statements:[["content","message.name",["loc",[null,[320,54],[320,70]]]],["content","message.mobile_number",["loc",[null,[321,39],[321,64]]]],["element","action",["updateSelectedUsers",["get","message",["loc",[null,[322,78],[322,85]]]]],["on","change"],["loc",[null,[322,47],[322,101]]]]],locals:["message"],templates:[]};})();var child7=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":326,"column":16},"end":{"line":335,"column":16}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("li");dom.setAttribute(el1,"class","card flex-row text-align-center group");var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatar");dom.setAttribute(el2,"style","width: 50px; height: 50px;");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","GroupName");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("input");dom.setAttribute(el2,"type","checkbox");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n\n                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element30=dom.childAt(fragment,[1]);var element31=dom.childAt(element30,[5]);var morphs=new Array(2);morphs[0] = dom.createMorphAt(dom.childAt(element30,[3]),0,0);morphs[1] = dom.createElementMorph(element31);return morphs;},statements:[["content","group.name",["loc",[null,[329,45],[329,59]]]],["element","action",["updateSelectedUsers",["get","group",["loc",[null,[330,78],[330,83]]]]],["on","change"],["loc",[null,[330,47],[330,99]]]]],locals:["group"],templates:[]};})();var child8=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":368,"column":36},"end":{"line":370,"column":36}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("li");var el2=dom.createElement("a");dom.setAttribute(el2,"class","dropdown-item");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(1);morphs[0] = dom.createMorphAt(dom.childAt(fragment,[1,0]),0,0);return morphs;},statements:[["content","role",["loc",[null,[369,66],[369,74]]]]],locals:["role"],templates:[]};})();var child1=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":386,"column":32},"end":{"line":394,"column":32}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("i");dom.setAttribute(el1,"class","bi bi-person-x-fill fs-1 text-danger");dom.setAttribute(el1,"title","Remove");dom.setAttribute(el1,"style","cursor: pointer;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createComment("                                    {{#if  member.isAdmin}}-->\n<!--                                        <i class=\"bi bi-person-fill-down fs-1 text-danger\" title=\"Dismiss as Admin\" style=\"cursor: pointer;\" {{action \"makeAdmin\" member.user_id false on=\"click\"}}></i>-->\n<!--                                    {{else}}-->\n<!--                                        <i class=\"bi bi-person-fill-up fs-1 text-success\" title=\"Make as Admin\" style=\"cursor: pointer;\" {{action \"makeAdmin\" member.user_id true on=\"click\"}}></i>-->\n\n<!--                                    {{/if}}");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element28=dom.childAt(fragment,[1]);var morphs=new Array(1);morphs[0] = dom.createElementMorph(element28);return morphs;},statements:[["element","action",["ExitGroup",["get","member.user_id",["loc",[null,[387,145],[387,159]]]]],["on","click"],["loc",[null,[387,124],[387,172]]]]],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":384,"column":28},"end":{"line":395,"column":28}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createComment("");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(1);morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);dom.insertBoundary(fragment,null);return morphs;},statements:[["block","if",[["subexpr","neq",[["get","model.curruser.user_id",["loc",[null,[386,43],[386,65]]]],["get","member.user_id",["loc",[null,[386,66],[386,80]]]]],[],["loc",[null,[386,38],[386,81]]]]],[],0,null,["loc",[null,[386,32],[394,39]]]]],locals:[],templates:[child0]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":358,"column":20},"end":{"line":399,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","card d-flex align-items-center gap-4 flex-row p-2");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","GroupName");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","btn-group dropend");var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("button");dom.setAttribute(el3,"type","button");dom.setAttribute(el3,"class","btn btn-secondary dropdown-toggle");dom.setAttribute(el3,"data-bs-toggle","dropdown");dom.setAttribute(el3,"aria-expanded","false");var el4=dom.createTextNode("\n                                    Roles\n                                ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);var el3=dom.createElement("ul");dom.setAttribute(el3,"class","dropdown-menu");var el4=dom.createTextNode("\n");dom.appendChild(el3,el4);var el4=dom.createComment("");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);var el2=dom.createComment("                            {{#if member.isAdmin}}-->\n<!--                                <span>Admin</span>-->\n<!--                            {{else}}-->\n<!--                                <span>Member</span>-->\n<!--                            {{/if}}");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);var el2=dom.createComment("                            {{#if (eq model.curruser.user_id  member.user_id)}}-->\n<!--                                <span>(YOU)</span>-->\n<!--                            {{/if}}");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n\n");dom.appendChild(el1,el2);var el2=dom.createComment("");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n                        ");dom.appendChild(el0,el1);var el1=dom.createElement("hr");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element29=dom.childAt(fragment,[1]);var morphs=new Array(4);morphs[0] = dom.createMorphAt(dom.childAt(element29,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element29,[5]),0,0);morphs[2] = dom.createMorphAt(dom.childAt(element29,[7,3]),1,1);morphs[3] = dom.createMorphAt(element29,13,13);return morphs;},statements:[["content","member.name",["loc",[null,[361,49],[361,64]]]],["content","member.mobile_number",["loc",[null,[362,43],[362,67]]]],["block","each",[["get","member.role_names",["loc",[null,[368,44],[368,61]]]]],[],0,null,["loc",[null,[368,36],[370,45]]]],["block","if",[["get","canRemoveMember",["loc",[null,[384,34],[384,49]]]]],[],1,null,["loc",[null,[384,28],[395,35]]]]],locals:["member"],templates:[child0,child1]};})();var child9=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":421,"column":20},"end":{"line":430,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","card d-flex justify-content-around align-items-center flex-row p-3");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("input");dom.setAttribute(el2,"type","checkbox");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                        ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n                        ");dom.appendChild(el0,el1);var el1=dom.createElement("hr");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element26=dom.childAt(fragment,[1]);var element27=dom.childAt(element26,[7]);var morphs=new Array(3);morphs[0] = dom.createMorphAt(dom.childAt(element26,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element26,[5]),0,0);morphs[2] = dom.createElementMorph(element27);return morphs;},statements:[["content","member.name",["loc",[null,[424,40],[424,55]]]],["content","member.mobile_number",["loc",[null,[425,43],[425,67]]]],["element","action",["addUsertoGroup",["get","member.user_id",["loc",[null,[426,80],[426,94]]]]],["on","change"],["loc",[null,[426,54],[426,108]]]]],locals:["member"],templates:[]};})();var child10=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":457,"column":28},"end":{"line":465,"column":28}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                            ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","card d-flex justify-content-around align-items-center flex-row p-3");dom.setAttribute(el1,"style","cursor: pointer;");var el2=dom.createTextNode("\n                                ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                                ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                                ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                            ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n                            ");dom.appendChild(el0,el1);var el1=dom.createElement("hr");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element25=dom.childAt(fragment,[1]);var morphs=new Array(3);morphs[0] = dom.createElementMorph(element25);morphs[1] = dom.createMorphAt(dom.childAt(element25,[3]),0,0);morphs[2] = dom.createMorphAt(dom.childAt(element25,[5]),0,0);return morphs;},statements:[["element","action",["addMentionMember",["get","member.user_id",["loc",[null,[458,136],[458,150]]]],["get","member.name",["loc",[null,[458,151],[458,162]]]],"member"],["on","click"],["loc",[null,[458,108],[458,185]]]],["content","member.name",["loc",[null,[460,44],[460,59]]]],["content","member.mobile_number",["loc",[null,[461,47],[461,71]]]]],locals:[],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":456,"column":24},"end":{"line":466,"column":24}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createComment("");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var morphs=new Array(1);morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);dom.insertBoundary(fragment,0);dom.insertBoundary(fragment,null);return morphs;},statements:[["block","if",[["subexpr","neq",[["get","member.user_id",["loc",[null,[457,39],[457,53]]]],["get","sender_id",["loc",[null,[457,54],[457,63]]]]],[],["loc",[null,[457,34],[457,64]]]]],[],0,null,["loc",[null,[457,28],[465,35]]]]],locals:["member"],templates:[child0]};})();var child11=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":467,"column":24},"end":{"line":474,"column":24}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                            ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","card d-flex flex-row p-3 gap-3");dom.setAttribute(el1,"style","cursor: pointer;");var el2=dom.createTextNode("\n                                ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                                ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                            ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n                            ");dom.appendChild(el0,el1);var el1=dom.createElement("hr");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element24=dom.childAt(fragment,[1]);var morphs=new Array(2);morphs[0] = dom.createElementMorph(element24);morphs[1] = dom.createMorphAt(dom.childAt(element24,[3]),0,0);return morphs;},statements:[["element","action",["addMentionMember",["get","role.role_id",["loc",[null,[468,100],[468,112]]]],["get","role.role_name",["loc",[null,[468,113],[468,127]]]],"role"],["on","click"],["loc",[null,[468,72],[468,148]]]],["content","role.role_name",["loc",[null,[470,44],[470,62]]]]],locals:["role"],templates:[]};})();var child12=(function(){var child0=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":518,"column":52},"end":{"line":522,"column":52}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","d-flex flex-column");var el2=dom.createTextNode("\n                                                        ");dom.appendChild(el1,el2);var el2=dom.createElement("label");var el3=dom.createComment("");dom.appendChild(el2,el3);var el3=dom.createTextNode(" ");dom.appendChild(el2,el3);var el3=dom.createElement("input");dom.setAttribute(el3,"type","checkbox");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                                                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element10=dom.childAt(fragment,[1,1]);var element11=dom.childAt(element10,[2]);if(this.cachedFragment){dom.repairClonedNode(element11,[],true);}var morphs=new Array(3);morphs[0] = dom.createMorphAt(element10,0,0);morphs[1] = dom.createAttrMorph(element11,'checked');morphs[2] = dom.createElementMorph(element11);return morphs;},statements:[["content","permission.permission_name",["loc",[null,[520,63],[520,93]]]],["attribute","checked",["get","permission.access",["loc",[null,[520,208],[520,225]]]]],["element","action",["editPermission",["get","role.role_id",["loc",[null,[520,143],[520,155]]]],["get","permission.permission_id",["loc",[null,[520,156],[520,180]]]]],["on","change"],["loc",[null,[520,117],[520,196]]]]],locals:["permission"],templates:[]};})();var child1=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":537,"column":52},"end":{"line":549,"column":52}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                                    ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","col");var el2=dom.createTextNode("\n                                                        ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","card d-flex justify-content-between align-items-center flex-row p-3");dom.setAttribute(el2,"style","cursor: pointer;");var el3=dom.createTextNode("\n                                                            ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","avatargrp");var el4=dom.createElement("img");dom.setAttribute(el4,"src","assets/profile.png");dom.setAttribute(el4,"alt","");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                                                            ");dom.appendChild(el2,el3);var el3=dom.createElement("span");dom.setAttribute(el3,"class","align-items-center");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                                                            ");dom.appendChild(el2,el3);var el3=dom.createElement("span");dom.setAttribute(el3,"class","");var el4=dom.createComment("");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                                                            ");dom.appendChild(el2,el3);var el3=dom.createElement("i");dom.setAttribute(el3,"class","bi bi-person-dash-fill text-danger  fs-2");dom.setAttribute(el3,"title","Remove member");dom.appendChild(el2,el3);var el3=dom.createTextNode("\n\n                                                        ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                                                        ");dom.appendChild(el1,el2);var el2=dom.createElement("hr");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                                                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element8=dom.childAt(fragment,[1,1]);var element9=dom.childAt(element8,[7]);var morphs=new Array(4);morphs[0] = dom.createElementMorph(element8);morphs[1] = dom.createMorphAt(dom.childAt(element8,[3]),0,0);morphs[2] = dom.createMorphAt(dom.childAt(element8,[5]),0,0);morphs[3] = dom.createElementMorph(element9);return morphs;},statements:[["element","action",["saran"],["on","click"],["loc",[null,[539,137],[539,167]]]],["content","member.name",["loc",[null,[541,93],[541,108]]]],["content","member.mobile_number",["loc",[null,[542,75],[542,99]]]],["element","action",["removeMemberFromRole",["get","member.user_id",["loc",[null,[543,144],[543,158]]]],["get","role.role_id",["loc",[null,[543,159],[543,171]]]]],[],["loc",[null,[543,112],[543,174]]]]],locals:["member"],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":494,"column":20},"end":{"line":560,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:2,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                    ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","col-6");var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","card");var el3=dom.createTextNode("\n                            ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","card-body");var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","d-flex flex-row justify-content-between");var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);var el5=dom.createElement("h5");dom.setAttribute(el5,"class","card-title");var el6=dom.createComment("");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);var el5=dom.createElement("div");dom.setAttribute(el5,"class","d-flex flex-row gap-3");var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);var el6=dom.createElement("i");dom.setAttribute(el6,"class","bi bi-person-fill-add text-success fs-2");dom.setAttribute(el6,"title","Add member");dom.setAttribute(el6,"style","cursor: pointer;");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);var el6=dom.createElement("i");dom.setAttribute(el6,"class","bi bi-trash3-fill text-danger fs-2");dom.setAttribute(el6,"style","cursor: pointer;");dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                    ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n                                ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n\n");dom.appendChild(el3,el4);var el4=dom.createComment("                                <h6 class=\"card-subtitle mb-2 text-muted\">Card subtitle</h6>");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","accordion accordion-flush");dom.setAttribute(el4,"id","accordionFlushExample");var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);var el5=dom.createElement("div");dom.setAttribute(el5,"class","accordion-item");var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);var el6=dom.createElement("h2");dom.setAttribute(el6,"class","accordion-header");dom.setAttribute(el6,"id","flush-headingOne");var el7=dom.createTextNode("\n                                            ");dom.appendChild(el6,el7);var el7=dom.createElement("button");dom.setAttribute(el7,"class","accordion-button collapsed");dom.setAttribute(el7,"type","button");dom.setAttribute(el7,"data-bs-toggle","collapse");dom.setAttribute(el7,"aria-expanded","false");dom.setAttribute(el7,"aria-controls","flush-collapseOne");var el8=dom.createTextNode("\n                                                Permissions\n                                            ");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                                        ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","accordion-collapse collapse");dom.setAttribute(el6,"aria-labelledby","flush-headingOne");dom.setAttribute(el6,"data-bs-parent","#accordionFlushExample");var el7=dom.createTextNode("\n                                            ");dom.appendChild(el6,el7);var el7=dom.createElement("div");dom.setAttribute(el7,"class","accordion-body");var el8=dom.createTextNode("\n                                                ");dom.appendChild(el7,el8);var el8=dom.createElement("div");var el9=dom.createTextNode("\n");dom.appendChild(el8,el9);var el9=dom.createComment("");dom.appendChild(el8,el9);var el9=dom.createTextNode("\n                                                ");dom.appendChild(el8,el9);dom.appendChild(el7,el8);var el8=dom.createTextNode("\n                                            ");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                                        ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                    ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                                    ");dom.appendChild(el4,el5);var el5=dom.createElement("div");dom.setAttribute(el5,"class","accordion-item");var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);var el6=dom.createElement("h2");dom.setAttribute(el6,"class","accordion-header");dom.setAttribute(el6,"id","flush-headingTwo");var el7=dom.createTextNode("\n                                            ");dom.appendChild(el6,el7);var el7=dom.createElement("button");dom.setAttribute(el7,"class","accordion-button collapsed");dom.setAttribute(el7,"type","button");dom.setAttribute(el7,"data-bs-toggle","collapse");dom.setAttribute(el7,"aria-expanded","false");dom.setAttribute(el7,"aria-controls","flush-collapseTwo");var el8=dom.createTextNode("\n                                                Members\n                                            ");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                                        ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                        ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","accordion-collapse collapse");dom.setAttribute(el6,"aria-labelledby","flush-headingTwo");dom.setAttribute(el6,"data-bs-parent","#accordionFlushExample");var el7=dom.createTextNode("\n                                            ");dom.appendChild(el6,el7);var el7=dom.createElement("div");dom.setAttribute(el7,"class","accordion-body");var el8=dom.createTextNode("\n                                                ");dom.appendChild(el7,el8);var el8=dom.createElement("div");dom.setAttribute(el8,"class","row row-cols-1");var el9=dom.createTextNode("\n");dom.appendChild(el8,el9);var el9=dom.createComment("");dom.appendChild(el8,el9);var el9=dom.createTextNode("                                                ");dom.appendChild(el8,el9);dom.appendChild(el7,el8);var el8=dom.createTextNode("\n                                            ");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                                        ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                                    ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n                                ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                            ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                        ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                    ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element12=dom.childAt(fragment,[1,1,1]);var element13=dom.childAt(element12,[1]);var element14=dom.childAt(element13,[3]);var element15=dom.childAt(element14,[1]);var element16=dom.childAt(element14,[3]);var element17=dom.childAt(element12,[5]);var element18=dom.childAt(element17,[1]);var element19=dom.childAt(element18,[1,1]);var element20=dom.childAt(element18,[3]);var element21=dom.childAt(element17,[3]);var element22=dom.childAt(element21,[1,1]);var element23=dom.childAt(element21,[3]);var morphs=new Array(9);morphs[0] = dom.createMorphAt(dom.childAt(element13,[1]),0,0);morphs[1] = dom.createElementMorph(element15);morphs[2] = dom.createElementMorph(element16);morphs[3] = dom.createAttrMorph(element19,'data-bs-target');morphs[4] = dom.createAttrMorph(element20,'id');morphs[5] = dom.createMorphAt(dom.childAt(element20,[1,1]),1,1);morphs[6] = dom.createAttrMorph(element22,'data-bs-target');morphs[7] = dom.createAttrMorph(element23,'id');morphs[8] = dom.createMorphAt(dom.childAt(element23,[1,1]),1,1);return morphs;},statements:[["content","role.role_name",["loc",[null,[499,59],[499,77]]]],["element","action",["showAddmemberToRole",["get","role.role_id",["loc",[null,[501,141],[501,153]]]],["get","role.role_name",["loc",[null,[501,154],[501,168]]]]],[],["loc",[null,[501,110],[501,170]]]],["element","action",["deleteRoleFromGrp",["get","role.role_id",["loc",[null,[502,115],[502,127]]]]],[],["loc",[null,[502,86],[502,129]]]],["attribute","data-bs-target",["concat",["#flush-collapse",["get","index",["loc",[null,[511,160],[511,165]]]]]]],["attribute","id",["concat",["flush-collapse",["get","index",["loc",[null,[515,65],[515,70]]]]]]],["block","each",[["get","role.permissions",["loc",[null,[518,60],[518,76]]]]],[],0,null,["loc",[null,[518,52],[522,61]]]],["attribute","data-bs-target",["concat",["#flush-collapseTwo",["get","index",["loc",[null,[530,163],[530,168]]]]]]],["attribute","id",["concat",["flush-collapseTwo",["get","index",["loc",[null,[534,68],[534,73]]]]]]],["block","each",[["get","role.members",["loc",[null,[537,60],[537,72]]]]],[],1,null,["loc",[null,[537,52],[549,61]]]]],locals:["role","index"],templates:[child0,child1]};})();var child13=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":593,"column":28},"end":{"line":598,"column":28}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                            ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","col p-2");var el2=dom.createTextNode("\n                                ");dom.appendChild(el1,el2);var el2=dom.createElement("label");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                                ");dom.appendChild(el1,el2);var el2=dom.createElement("input");dom.setAttribute(el2,"type","checkbox");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element6=dom.childAt(fragment,[1]);var element7=dom.childAt(element6,[3]);var morphs=new Array(2);morphs[0] = dom.createMorphAt(dom.childAt(element6,[1]),0,0);morphs[1] = dom.createElementMorph(element7);return morphs;},statements:[["content","per.value",["loc",[null,[595,48],[595,61]]]],["element","action",["handlePermission",["get","per.key",["loc",[null,[596,85],[596,92]]]]],["on","change"],["loc",[null,[596,56],[596,106]]]]],locals:["per"],templates:[]};})();var child14=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":605,"column":28},"end":{"line":619,"column":28}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                            ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","col");var el2=dom.createTextNode("\n                                ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","d-flex- flex-column");var el3=dom.createTextNode("\n                                        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","card d-flex justify-content-around align-items-center flex-row p-3");var el4=dom.createTextNode("\n                                            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","avatargrp");var el5=dom.createElement("img");dom.setAttribute(el5,"src","assets/profile.png");dom.setAttribute(el5,"alt","");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                            ");dom.appendChild(el3,el4);var el4=dom.createElement("p");dom.setAttribute(el4,"class","");var el5=dom.createComment("");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                            ");dom.appendChild(el3,el4);var el4=dom.createElement("span");dom.setAttribute(el4,"class","");var el5=dom.createComment("");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n                                            ");dom.appendChild(el3,el4);var el4=dom.createElement("input");dom.setAttribute(el4,"type","checkbox");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n\n                                        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                                        ");dom.appendChild(el2,el3);var el3=dom.createElement("hr");dom.appendChild(el2,el3);var el3=dom.createTextNode("\n                                ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                            ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element4=dom.childAt(fragment,[1,1,1]);var element5=dom.childAt(element4,[7]);var morphs=new Array(3);morphs[0] = dom.createMorphAt(dom.childAt(element4,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element4,[5]),0,0);morphs[2] = dom.createElementMorph(element5);return morphs;},statements:[["content","member.name",["loc",[null,[610,56],[610,71]]]],["content","member.mobile_number",["loc",[null,[611,59],[611,83]]]],["element","action",["handleAssignMember",["get","member.user_id",["loc",[null,[612,100],[612,114]]]]],["on","change"],["loc",[null,[612,70],[612,128]]]]],locals:["member"],templates:[]};})();var child15=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":649,"column":20},"end":{"line":657,"column":20}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                        ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","card d-flex align-items-center gap-4 flex-row p-2");var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("p");dom.setAttribute(el2,"class","GroupName");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("span");dom.setAttribute(el2,"class","");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                            ");dom.appendChild(el1,el2);var el2=dom.createElement("input");dom.setAttribute(el2,"type","checkbox");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                        ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n                        ");dom.appendChild(el0,el1);var el1=dom.createElement("hr");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element2=dom.childAt(fragment,[1]);var element3=dom.childAt(element2,[7]);var morphs=new Array(3);morphs[0] = dom.createMorphAt(dom.childAt(element2,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element2,[5]),0,0);morphs[2] = dom.createElementMorph(element3);return morphs;},statements:[["content","member.name",["loc",[null,[652,49],[652,64]]]],["content","member.mobile_number",["loc",[null,[653,43],[653,67]]]],["element","action",["handleAssignMember",["get","member.user_id",["loc",[null,[654,81],[654,95]]]]],["on","change"],["loc",[null,[654,51],[654,109]]]]],locals:["member"],templates:[]};})();var child16=(function(){return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":693,"column":28},"end":{"line":701,"column":28}},"moduleName":"demoapp/templates/chat.hbs"},arity:1,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createTextNode("                                ");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","card d-flex flex-row p-3 align-items-center justify-content-between w-65");var el2=dom.createTextNode("\n                                    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","avatargrp");var el3=dom.createElement("img");dom.setAttribute(el3,"src","assets/profile.png");dom.setAttribute(el3,"alt","");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                                    ");dom.appendChild(el1,el2);var el2=dom.createElement("sapn");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                                    ");dom.appendChild(el1,el2);var el2=dom.createElement("span");var el3=dom.createComment("");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n                                    ");dom.appendChild(el1,el2);var el2=dom.createElement("input");dom.setAttribute(el2,"type","checkbox");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n                                ");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element0=dom.childAt(fragment,[1]);var element1=dom.childAt(element0,[7]);var morphs=new Array(3);morphs[0] = dom.createMorphAt(dom.childAt(element0,[3]),0,0);morphs[1] = dom.createMorphAt(dom.childAt(element0,[5]),0,0);morphs[2] = dom.createElementMorph(element1);return morphs;},statements:[["content","message.name",["loc",[null,[696,42],[696,58]]]],["content","message.mobile_number",["loc",[null,[697,43],[697,68]]]],["element","action",["addUserToFork",["get","message.user_id",["loc",[null,[698,87],[698,102]]]]],["on","change"],["loc",[null,[698,62],[698,116]]]]],locals:["message"],templates:[]};})();return {meta:{"revision":"Ember@1.13.12","loc":{"source":null,"start":{"line":1,"column":0},"end":{"line":721,"column":6}},"moduleName":"demoapp/templates/chat.hbs"},arity:0,cachedFragment:null,hasRendered:false,buildFragment:function buildFragment(dom){var el0=dom.createDocumentFragment();var el1=dom.createElement("link");dom.setAttribute(el1,"rel","stylesheet");dom.setAttribute(el1,"href","https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("script");dom.setAttribute(el1,"src","https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("link");dom.setAttribute(el1,"href","https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css");dom.setAttribute(el1,"rel","stylesheet");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("link");dom.setAttribute(el1,"rel","stylesheet");dom.setAttribute(el1,"href","https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("meta");dom.setAttribute(el1,"http-equiv","Content-Security-Policy");dom.setAttribute(el1,"content","default-src 'self'; report-uri http://localhost:4200/csp-report;");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("script");dom.setAttribute(el1,"src","https://code.jquery.com/jquery-3.6.0.min.js");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("script");dom.setAttribute(el1,"src","https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/js/bootstrap.min.js");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("link");dom.setAttribute(el1,"rel","stylesheet");dom.setAttribute(el1,"href","assets/chat.css");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n\n\n\n\n");dom.appendChild(el0,el1);var el1=dom.createElement("main");var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","sideNav1");var el3=dom.createTextNode("\n\n\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","sideNav2");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","SideNavhead");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("h2");var el5=dom.createTextNode(" Welcome ");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("input");dom.setAttribute(el4,"type","hidden");dom.setAttribute(el4,"id","curruserid");dom.setAttribute(el4,"name","curruserid");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","icon-container");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("i");dom.setAttribute(el5,"class","fas fa-sign-out-alt logout-icon");dom.setAttribute(el5,"title","Logout");var el6=dom.createTextNode(">");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("i");dom.setAttribute(el5,"class","fas fa-users create-group-icon");dom.setAttribute(el5,"title","Create Group");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","friends");var el4=dom.createTextNode("\n");dom.appendChild(el3,el4);var el4=dom.createComment("");dom.appendChild(el3,el4);var el4=dom.createComment("");dom.appendChild(el3,el4);var el4=dom.createTextNode("        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n\n\n\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","empty-page");var el3=dom.createTextNode("\n\n\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("section");dom.setAttribute(el2,"class","Chat");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","ChatHead");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("li");dom.setAttribute(el4,"class","d-flex justify-content-around align-items-center gap-3 p-2");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("img");dom.setAttribute(el5,"src","assets/profile.png");dom.setAttribute(el5,"style","height: 15%; width: 15%; border-radius: 50%");dom.setAttribute(el5,"alt","");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("p");dom.setAttribute(el5,"class","");var el6=dom.createComment("");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("span");var el6=dom.createComment("");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","grpOperations");var el5=dom.createTextNode("\n");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);var el5=dom.createTextNode("            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","MessageContainer");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("span");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n");dom.appendChild(el3,el4);var el4=dom.createComment("");dom.appendChild(el3,el4);var el4=dom.createTextNode("        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n");dom.appendChild(el2,el3);var el3=dom.createComment("");dom.appendChild(el2,el3);var el3=dom.createTextNode("    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("section");dom.setAttribute(el2,"class","createGroup");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("form");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","d-flex justify-content-between");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h3");dom.setAttribute(el5,"class","bg-green");var el6=dom.createTextNode("Create New Group");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createElement("br");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","d-flex align-items-center gap-4");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("label");dom.setAttribute(el5,"for","grpName");var el6=dom.createTextNode("Group Name: ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createElement("input");dom.setAttribute(el5,"type","text");dom.setAttribute(el5,"name","grpNmae");dom.setAttribute(el5,"id","grpName");dom.setAttribute(el5,"style","width: 70%;padding: 10px;");dom.setAttribute(el5,"required","");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createElement("br");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("br");dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","d-flex flex-column gap-2");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h3");var el6=dom.createTextNode("Add Members");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createElement("br");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);var el5=dom.createTextNode("            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","button-container");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","submit");dom.setAttribute(el5,"class","submit-button");var el6=dom.createTextNode("Create Group");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n\n\n\n\n\n\n\n    ");dom.appendChild(el1,el2);var el2=dom.createComment(" Modal ");dom.appendChild(el1,el2);var el2=dom.createTextNode("\n\n\n\n");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createComment("Forward modal");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","modal fade");dom.setAttribute(el1,"id","exampleModal");dom.setAttribute(el1,"tabindex","-1");dom.setAttribute(el1,"aria-labelledby","exampleModalLabel");dom.setAttribute(el1,"aria-hidden","true");var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","modal-dialog modal-dialog-scrollable");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","modal-content");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-header");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h1");dom.setAttribute(el5,"class","modal-title fs-5");dom.setAttribute(el5,"id","exampleModalLabel");var el6=dom.createTextNode("Send to..");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"data-bs-dismiss","modal");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-body");var el5=dom.createTextNode("\n\n");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);var el5=dom.createComment("");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-footer");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn btn-secondary");dom.setAttribute(el5,"data-bs-dismiss","modal");var el6=dom.createTextNode("Close");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn btn-primary");var el6=dom.createTextNode("Send");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n\n");dom.appendChild(el0,el1);var el1=dom.createComment(" model for view members");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","modal fade");dom.setAttribute(el1,"id","viewmodal");dom.setAttribute(el1,"tabindex","-1");dom.setAttribute(el1,"aria-labelledby","exampleModalLabel");dom.setAttribute(el1,"aria-hidden","true");var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","modal-dialog  modal-dialog-scrollable");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","modal-content");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-header");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h1");dom.setAttribute(el5,"class","modal-title fs-5");dom.setAttribute(el5,"id","exampleModalLabel");var el6=dom.createTextNode("View Group members");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"data-bs-dismiss","modal");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-body");var el5=dom.createTextNode("\n\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("form");var el6=dom.createTextNode("\n");dom.appendChild(el5,el6);var el6=dom.createComment("");dom.appendChild(el5,el6);var el6=dom.createTextNode("                ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-footer");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn btn-secondary");dom.setAttribute(el5,"data-bs-dismiss","modal");var el6=dom.createTextNode("Close");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);var el1=dom.createComment(" Add New Member to Group");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","modal fade");dom.setAttribute(el1,"id","addmember");dom.setAttribute(el1,"tabindex","-1");dom.setAttribute(el1,"aria-labelledby","exampleModalLabel");dom.setAttribute(el1,"aria-hidden","true");var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","modal-dialog modal-dialog-scrollable");var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","modal-content");var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-header");var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);var el5=dom.createElement("h1");dom.setAttribute(el5,"class","modal-title fs-5");dom.setAttribute(el5,"id","exampleModalLabel");var el6=dom.createTextNode("Add new members");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"data-bs-dismiss","modal");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n        ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-body");var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);var el5=dom.createElement("form");var el6=dom.createTextNode("\n                ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","d-flex- flex-column");var el7=dom.createTextNode("\n");dom.appendChild(el6,el7);var el7=dom.createComment("");dom.appendChild(el6,el7);var el7=dom.createTextNode("                ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n\n            ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n        ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-footer");var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn btn-secondary");dom.setAttribute(el5,"data-bs-dismiss","modal");var el6=dom.createTextNode("Close");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","submit-button");var el6=dom.createTextNode("Add Members");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n        ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n    ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);var el1=dom.createComment("model for mention users");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","modal fade");dom.setAttribute(el1,"id","mentionmodal");dom.setAttribute(el1,"aria-hidden","true");dom.setAttribute(el1,"aria-labelledby","exampleModalToggleLabel");dom.setAttribute(el1,"tabindex","-1");var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","modal-dialog modal-dialog-centered modal-dialog-scrollable");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","modal-content");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-header");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h1");dom.setAttribute(el5,"class","modal-title fs-5");dom.setAttribute(el5,"id","exampleModalToggleLabel");var el6=dom.createTextNode("Members ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"data-bs-dismiss","modal");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-body");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("div");dom.setAttribute(el5,"class","d-flex flex-column gap-2");var el6=dom.createTextNode("\n                    ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","");var el7=dom.createTextNode("\n");dom.appendChild(el6,el7);var el7=dom.createComment("");dom.appendChild(el6,el7);var el7=dom.createComment("");dom.appendChild(el6,el7);var el7=dom.createTextNode("                    ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n\n\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);var el1=dom.createComment("Role creation model");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","modal fade");dom.setAttribute(el1,"id","rolemodel");dom.setAttribute(el1,"tabindex","-1");dom.setAttribute(el1,"aria-labelledby","exampleModalLabel");dom.setAttribute(el1,"aria-hidden","true");var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","modal-dialog modal-xl");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","modal-content");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-header");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h1");dom.setAttribute(el5,"class","modal-title fs-5");dom.setAttribute(el5,"id","exampleModalLabel");var el6=dom.createTextNode("Roles");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"data-bs-dismiss","modal");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-body");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("div");dom.setAttribute(el5,"class","row  row-cols-2  g-4");var el6=dom.createTextNode("\n");dom.appendChild(el5,el6);var el6=dom.createComment("");dom.appendChild(el5,el6);var el6=dom.createTextNode("                ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-footer");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn btn-secondary");dom.setAttribute(el5,"data-bs-dismiss","modal");var el6=dom.createTextNode("Close");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);var el1=dom.createComment("Create role modal");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","modal fade");dom.setAttribute(el1,"id","createrole");dom.setAttribute(el1,"tabindex","-1");dom.setAttribute(el1,"aria-labelledby","exampleModalLabel");dom.setAttribute(el1,"aria-hidden","true");var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","modal-dialog modal-lg modal-dialog-scrollable");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","modal-content");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-header");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h1");dom.setAttribute(el5,"class","modal-title fs-5");dom.setAttribute(el5,"id","exampleModalLabel");var el6=dom.createTextNode("Create New Role");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"data-bs-dismiss","modal");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-body");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("form");var el6=dom.createTextNode("\n                    ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","mb-3");var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("label");dom.setAttribute(el7,"for","role_name");dom.setAttribute(el7,"class","form-label");var el8=dom.createTextNode("Role Name");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("input");dom.setAttribute(el7,"type","text");dom.setAttribute(el7,"class","form-control");dom.setAttribute(el7,"id","role_name");dom.setAttribute(el7,"name","role_name");dom.setAttribute(el7,"placeholder","Role Name");dom.setAttribute(el7,"required","");dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                    ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                    ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","mb-3");var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("label");dom.setAttribute(el7,"for","role_name");dom.setAttribute(el7,"class","form-label");var el8=dom.createTextNode("Role Description");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("input");dom.setAttribute(el7,"type","text");dom.setAttribute(el7,"class","form-control");dom.setAttribute(el7,"id","role_des");dom.setAttribute(el7,"name","role_des");dom.setAttribute(el7,"placeholder","Role Name");dom.setAttribute(el7,"required","");dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                    ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                    ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","mb-3");var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("label");dom.setAttribute(el7,"for","exampleFormControlInput1");dom.setAttribute(el7,"class","form-label");var el8=dom.createTextNode("Permissions");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("div");dom.setAttribute(el7,"class","row row-cols-3");var el8=dom.createTextNode("\n");dom.appendChild(el7,el8);var el8=dom.createComment("");dom.appendChild(el7,el8);var el8=dom.createTextNode("\n                        ");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                    ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                    ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","mb-3");var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("label");dom.setAttribute(el7,"for","exampleFormControlInput1");dom.setAttribute(el7,"class","form-label");var el8=dom.createTextNode("Assign Role To");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("div");dom.setAttribute(el7,"class","row row-cols-2");var el8=dom.createTextNode("\n");dom.appendChild(el7,el8);var el8=dom.createComment("");dom.appendChild(el7,el8);var el8=dom.createTextNode("\n                        ");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                    ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n\n                ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-footer");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn btn-secondary");dom.setAttribute(el5,"data-bs-dismiss","modal");var el6=dom.createTextNode("Close");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","submit-button");var el6=dom.createTextNode("Create");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);var el1=dom.createComment("Add member to role");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","modal fade");dom.setAttribute(el1,"id","addMemberToRole");dom.setAttribute(el1,"tabindex","-1");dom.setAttribute(el1,"aria-labelledby","exampleModalLabel");dom.setAttribute(el1,"aria-hidden","true");var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","modal-dialog  modal-dialog-scrollable");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","modal-content");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-header");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h1");dom.setAttribute(el5,"class","modal-title fs-5");dom.setAttribute(el5,"id","rolename");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("input");dom.setAttribute(el5,"type","hidden");dom.setAttribute(el5,"id","roleID");dom.setAttribute(el5,"name","roleID");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"data-bs-dismiss","modal");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-body");var el5=dom.createTextNode("\n\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("form");var el6=dom.createTextNode("\n");dom.appendChild(el5,el6);var el6=dom.createComment("");dom.appendChild(el5,el6);var el6=dom.createTextNode("                ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-footer");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn btn-secondary");dom.setAttribute(el5,"data-bs-dismiss","modal");var el6=dom.createTextNode("Close");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn btn-secondary");var el6=dom.createTextNode("Add");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);dom.appendChild(el0,el1);var el1=dom.createTextNode("\n\n");dom.appendChild(el0,el1);var el1=dom.createComment("Fork option model");dom.appendChild(el0,el1);var el1=dom.createTextNode("\n");dom.appendChild(el0,el1);var el1=dom.createElement("div");dom.setAttribute(el1,"class","modal fade");dom.setAttribute(el1,"id","forkmessage");dom.setAttribute(el1,"tabindex","-1");dom.setAttribute(el1,"aria-labelledby","exampleModalLabel");dom.setAttribute(el1,"aria-hidden","true");var el2=dom.createTextNode("\n    ");dom.appendChild(el1,el2);var el2=dom.createElement("div");dom.setAttribute(el2,"class","modal-dialog   modal-dialog-scrollable");var el3=dom.createTextNode("\n        ");dom.appendChild(el2,el3);var el3=dom.createElement("div");dom.setAttribute(el3,"class","modal-content");var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-header");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("h1");dom.setAttribute(el5,"class","modal-title fs-5");var el6=dom.createTextNode("Fork Messages");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("input");dom.setAttribute(el5,"type","hidden");dom.setAttribute(el5,"id","roleID");dom.setAttribute(el5,"name","roleID");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn-close");dom.setAttribute(el5,"data-bs-dismiss","modal");dom.setAttribute(el5,"aria-label","Close");dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-body");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("div");dom.setAttribute(el5,"class","d-flex flex-column");var el6=dom.createTextNode("\n                    ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","d-flex align-items-center");var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("div");dom.setAttribute(el7,"class","card start-fork");var el8=dom.createTextNode("\n                            ");dom.appendChild(el7,el8);var el8=dom.createElement("strong");dom.setAttribute(el8,"id","fork-sender");var el9=dom.createTextNode("sender");dom.appendChild(el8,el9);dom.appendChild(el7,el8);var el8=dom.createTextNode("\n                            ");dom.appendChild(el7,el8);var el8=dom.createElement("span");dom.setAttribute(el8,"id","fork-msg");var el9=dom.createTextNode("Message");dom.appendChild(el8,el9);dom.appendChild(el7,el8);var el8=dom.createTextNode("\n                            ");dom.appendChild(el7,el8);var el8=dom.createElement("span");dom.setAttribute(el8,"id","fork-time");var el9=dom.createTextNode("Time");dom.appendChild(el8,el9);dom.appendChild(el7,el8);var el8=dom.createTextNode("\n                        ");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                    ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n\n                    ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","grp-field");var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("div");dom.setAttribute(el7,"class","ml-2");dom.setAttribute(el7,"style","margin-left: 20px;");var el8=dom.createTextNode("\n                            ");dom.appendChild(el7,el8);var el8=dom.createElement("h3");var el9=dom.createTextNode("Add Users");dom.appendChild(el8,el9);dom.appendChild(el7,el8);var el8=dom.createTextNode("\n                        ");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("div");dom.setAttribute(el7,"class","d-flex flex-column gap-2 ");var el8=dom.createTextNode("\n");dom.appendChild(el7,el8);var el8=dom.createComment("");dom.appendChild(el7,el8);var el8=dom.createTextNode("                        ");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n\n                    ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                    ");dom.appendChild(el5,el6);var el6=dom.createElement("div");dom.setAttribute(el6,"class","data-field");var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("div");dom.setAttribute(el7,"class","chat-title");var el8=dom.createTextNode("\n                            ");dom.appendChild(el7,el8);var el8=dom.createElement("label");dom.setAttribute(el8,"for","chat-title");var el9=dom.createTextNode("Chat Title: ");dom.appendChild(el8,el9);dom.appendChild(el7,el8);var el8=dom.createElement("input");dom.setAttribute(el8,"type","text");dom.setAttribute(el8,"class","p-3");dom.setAttribute(el8,"name","chat-title");dom.setAttribute(el8,"id","chat-title");dom.setAttribute(el8,"required","");dom.appendChild(el7,el8);var el8=dom.createTextNode("\n                        ");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                        ");dom.appendChild(el6,el7);var el7=dom.createElement("label");var el8=dom.createElement("input");dom.setAttribute(el8,"type","checkbox");dom.setAttribute(el8,"id","all");dom.setAttribute(el8,"name","all");dom.appendChild(el7,el8);var el8=dom.createTextNode(" Include all participants of this conversation");dom.appendChild(el7,el8);dom.appendChild(el6,el7);var el7=dom.createTextNode("\n                    ");dom.appendChild(el6,el7);dom.appendChild(el5,el6);var el6=dom.createTextNode("\n                ");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n\n\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n            ");dom.appendChild(el3,el4);var el4=dom.createElement("div");dom.setAttribute(el4,"class","modal-footer");var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","btn btn-secondary");dom.setAttribute(el5,"data-bs-dismiss","modal");var el6=dom.createTextNode("Close");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n                ");dom.appendChild(el4,el5);var el5=dom.createElement("button");dom.setAttribute(el5,"type","button");dom.setAttribute(el5,"class","submit-button");var el6=dom.createTextNode("Create Chat");dom.appendChild(el5,el6);dom.appendChild(el4,el5);var el5=dom.createTextNode("\n            ");dom.appendChild(el4,el5);dom.appendChild(el3,el4);var el4=dom.createTextNode("\n        ");dom.appendChild(el3,el4);dom.appendChild(el2,el3);var el3=dom.createTextNode("\n    ");dom.appendChild(el2,el3);dom.appendChild(el1,el2);var el2=dom.createTextNode("\n");dom.appendChild(el1,el2);dom.appendChild(el0,el1);return el0;},buildRenderNodes:function buildRenderNodes(dom,fragment,contextualElement){var element85=dom.childAt(fragment,[16]);var element86=dom.childAt(element85,[3]);var element87=dom.childAt(element86,[1]);var element88=dom.childAt(element87,[3]);var element89=dom.childAt(element87,[5]);var element90=dom.childAt(element89,[1]);var element91=dom.childAt(element89,[3]);var element92=dom.childAt(element86,[3]);var element93=dom.childAt(element85,[7]);var element94=dom.childAt(element93,[1]);var element95=dom.childAt(element94,[1]);var element96=dom.childAt(element85,[9,1]);var element97=dom.childAt(element96,[1,3]);var element98=dom.childAt(fragment,[20,1,1]);var element99=dom.childAt(element98,[3]);var element100=dom.childAt(element98,[5,3]);var element101=dom.childAt(fragment,[24,1,1,3,1]);var element102=dom.childAt(fragment,[28,1,1]);var element103=dom.childAt(element102,[3,1]);var element104=dom.childAt(element102,[5,3]);var element105=dom.childAt(fragment,[32,1,1,3,1,1]);var element106=dom.childAt(fragment,[40,1,1]);var element107=dom.childAt(element106,[3,1]);var element108=dom.childAt(element106,[5,3]);var element109=dom.childAt(fragment,[44,1,1]);var element110=dom.childAt(element109,[3,1]);var element111=dom.childAt(element109,[5,3]);var element112=dom.childAt(fragment,[48,1,1]);var element113=dom.childAt(element112,[5,3]);var morphs=new Array(33);morphs[0] = dom.createMorphAt(dom.childAt(element87,[1]),1,1);morphs[1] = dom.createAttrMorph(element88,'value');morphs[2] = dom.createElementMorph(element90);morphs[3] = dom.createElementMorph(element91);morphs[4] = dom.createMorphAt(element92,1,1);morphs[5] = dom.createMorphAt(element92,2,2);morphs[6] = dom.createMorphAt(dom.childAt(element95,[3]),0,0);morphs[7] = dom.createMorphAt(dom.childAt(element95,[5]),0,0);morphs[8] = dom.createMorphAt(dom.childAt(element94,[3]),1,1);morphs[9] = dom.createMorphAt(dom.childAt(element93,[3]),3,3);morphs[10] = dom.createMorphAt(element93,5,5);morphs[11] = dom.createElementMorph(element96);morphs[12] = dom.createElementMorph(element97);morphs[13] = dom.createMorphAt(dom.childAt(element96,[9]),4,4);morphs[14] = dom.createMorphAt(element99,1,1);morphs[15] = dom.createMorphAt(element99,2,2);morphs[16] = dom.createElementMorph(element100);morphs[17] = dom.createElementMorph(element101);morphs[18] = dom.createMorphAt(element101,1,1);morphs[19] = dom.createElementMorph(element103);morphs[20] = dom.createMorphAt(dom.childAt(element103,[1]),1,1);morphs[21] = dom.createElementMorph(element104);morphs[22] = dom.createMorphAt(element105,1,1);morphs[23] = dom.createMorphAt(element105,2,2);morphs[24] = dom.createMorphAt(dom.childAt(fragment,[36,1,1,3,1]),1,1);morphs[25] = dom.createMorphAt(dom.childAt(element107,[5,3]),1,1);morphs[26] = dom.createMorphAt(dom.childAt(element107,[7,3]),1,1);morphs[27] = dom.createElementMorph(element108);morphs[28] = dom.createElementMorph(element110);morphs[29] = dom.createMorphAt(element110,1,1);morphs[30] = dom.createElementMorph(element111);morphs[31] = dom.createMorphAt(dom.childAt(element112,[3,1,3,3]),1,1);morphs[32] = dom.createElementMorph(element113);return morphs;},statements:[["content","model.curruser.name",["loc",[null,[21,25],[21,48]]]],["attribute","value",["concat",[["get","model.curruser.user_id",["loc",[null,[22,42],[22,64]]]]]]],["element","action",["logout"],[],["loc",[null,[24,74],[24,94]]]],["element","action",["showGrpCreate"],["on","click"],["loc",[null,[25,79],[25,116]]]],["block","each",[["get","model.users",["loc",[null,[29,20],[29,31]]]]],[],0,null,["loc",[null,[29,12],[37,21]]]],["block","each",[["get","model.groups",["loc",[null,[38,20],[38,32]]]]],[],1,null,["loc",[null,[38,12],[54,21]]]],["content","selectedUsername",["loc",[null,[69,28],[69,48]]]],["content","currentStatus",["loc",[null,[70,22],[70,39]]]],["block","if",[["get","isGroup",["loc",[null,[73,22],[73,29]]]]],[],2,null,["loc",[null,[73,16],[85,23]]]],["block","each",[["get","AllMessage",["loc",[null,[90,20],[90,30]]]]],[],3,null,["loc",[null,[90,12],[231,21]]]],["block","if",[["get","canSendMessage",["loc",[null,[233,15],[233,29]]]]],[],4,null,["loc",[null,[233,8],[265,19]]]],["element","action",["CreateNewGroup",["get","model.curruser.user_id",["loc",[null,[268,40],[268,62]]]]],["on","submit"],["loc",[null,[268,14],[268,77]]]],["element","action",["closeCreateGrp"],["on","click"],["loc",[null,[271,56],[271,94]]]],["block","each",[["get","model.users",["loc",[null,[279,24],[279,35]]]]],[],5,null,["loc",[null,[279,16],[287,25]]]],["block","each",[["get","model.users",["loc",[null,[317,24],[317,35]]]]],[],6,null,["loc",[null,[317,16],[325,25]]]],["block","each",[["get","model.groups",["loc",[null,[326,24],[326,36]]]]],[],7,null,["loc",[null,[326,16],[335,25]]]],["element","action",["doForward"],["on","click"],["loc",[null,[340,38],[340,71]]]],["element","action",["RemoveMember",["get","model.curruser.user_id",["loc",[null,[357,46],[357,68]]]]],["on","submit"],["loc",[null,[357,22],[357,83]]]],["block","each",[["get","ViewGrpMembers",["loc",[null,[358,28],[358,42]]]]],[],8,null,["loc",[null,[358,20],[399,29]]]],["element","action",["addNewMember"],["on","submit"],["loc",[null,[419,18],[419,57]]]],["block","each",[["get","ViewGrpMembers",["loc",[null,[421,28],[421,42]]]]],[],9,null,["loc",[null,[421,20],[430,29]]]],["element","action",["addNewMember"],["on","click"],["loc",[null,[438,35],[438,73]]]],["block","each",[["get","ViewGrpMembers",["loc",[null,[456,32],[456,46]]]]],[],10,null,["loc",[null,[456,24],[466,33]]]],["block","each",[["get","getRoles",["loc",[null,[467,32],[467,40]]]]],[],11,null,["loc",[null,[467,24],[474,33]]]],["block","each",[["get","viewrole",["loc",[null,[494,29],[494,37]]]]],[],12,null,["loc",[null,[494,20],[560,29]]]],["block","each",[["get","permissions",["loc",[null,[593,36],[593,47]]]]],[],13,null,["loc",[null,[593,28],[598,37]]]],["block","each",[["get","ViewGrpMembers",["loc",[null,[605,36],[605,50]]]]],[],14,null,["loc",[null,[605,28],[619,37]]]],["element","action",["createRole"],["on","click"],["loc",[null,[630,62],[630,96]]]],["element","action",["RemoveMember",["get","model.curruser.user_id",["loc",[null,[648,46],[648,68]]]]],["on","submit"],["loc",[null,[648,22],[648,83]]]],["block","each",[["get","ViewGrpMembers",["loc",[null,[649,28],[649,42]]]]],[],15,null,["loc",[null,[649,20],[657,29]]]],["element","action",["addMemberToRole"],["on","click"],["loc",[null,[663,65],[663,104]]]],["block","each",[["get","newMembersForFork",["loc",[null,[693,36],[693,53]]]]],[],16,null,["loc",[null,[693,28],[701,37]]]],["element","action",["CreatForkMessage"],["on","click"],["loc",[null,[717,60],[717,102]]]]],locals:[],templates:[child0,child1,child2,child3,child4,child5,child6,child7,child8,child9,child10,child11,child12,child13,child14,child15,child16]};})());});
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
  require("demoapp/app")["default"].create({"name":"demoapp","version":"0.0.0+89b4f8a7"});
}

/* jshint ignore:end */
//# sourceMappingURL=demoapp.map