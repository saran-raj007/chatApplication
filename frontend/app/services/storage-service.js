import Ember from "ember";

const StorageService = {
    storePrivateKey: function (encryptedKey,name) {
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

    getPrivateKey: function (name) {
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

export default StorageService;
