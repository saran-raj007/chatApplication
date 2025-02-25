import Ember from "ember";

const CryptoUtils = {
    generateRSAKeys: function () {
        return new Promise(function (resolve, reject) {
            window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256"
                },
                true,
                ["encrypt", "decrypt"]
            ).then(function (keyPair) {
                return Promise.all([
                    window.crypto.subtle.exportKey("spki", keyPair.publicKey),
                    window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey)
                ]).then(function (keys) {
                    var publicKey = btoa(String.fromCharCode.apply(null, new Uint8Array(keys[0])));
                    var privateKey = btoa(String.fromCharCode.apply(null, new Uint8Array(keys[1])));

                    resolve({
                        publicKey: publicKey,
                        privateKey: privateKey
                    });
                });
            }).catch(reject);
        });
    },

    generateAESKey: function () {
        return new Promise(function (resolve, reject) {
            window.crypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: 128,
                },
                true,
                ["encrypt", "decrypt"]
            ).then(function (key) {
                window.crypto.subtle.exportKey("raw", key).then(function (exportedKey) {
                    resolve(new Uint8Array(exportedKey));
                }).catch(reject);
            }).catch(reject);
        });
    },

    importAESKey: function (keyBase64) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            try {
                var rawKey = new Uint8Array(keyBase64);

                window.crypto.subtle.importKey(
                    "raw",
                    keyBase64,
                    { name: "AES-GCM" },
                    true,
                    ["encrypt", "decrypt"]
                ).then(resolve).catch(reject);

            } catch (error) {
                reject(error);
            }
        });
    },



    encryptAESKey: function (aesKey, publicKey) {
        return new Promise(function (resolve, reject) {
            var decodedKey = Uint8Array.from(atob(publicKey), function (c) {
                return c.charCodeAt(0);
            });

            window.crypto.subtle.importKey(
                "spki",
                decodedKey,
                { name: "RSA-OAEP", hash: "SHA-256" },
                false,
                ["encrypt"]
            ).then(function (importedKey) {
                return window.crypto.subtle.encrypt(
                    { name: "RSA-OAEP" },
                    importedKey,
                    aesKey
                );
            }).then(function (encryptedKey) {
                var encryptedStr = btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedKey)));
                resolve(encryptedStr);
            }).catch(reject);
        });
    },

    decryptAESKey: function (encryptedAESKey, privateKey) {

        return new Promise(function (resolve, reject) {
            let decodedPrivateKey = new Uint8Array(atob(privateKey).split("").map(c => c.charCodeAt(0)));
            window.crypto.subtle.importKey(
                "pkcs8",
                decodedPrivateKey,
                { name: "RSA-OAEP", hash: "SHA-256" },
                false,
                ["decrypt"]
            ).then(function (importedPrivateKey) {
                console.log(importedPrivateKey);
                let decodedAESKey = new Uint8Array(atob(encryptedAESKey).split("").map(c => c.charCodeAt(0)));
                return window.crypto.subtle.decrypt(
                    { name: "RSA-OAEP" },
                    importedPrivateKey,
                    decodedAESKey
                );
            }).then(function (decryptedAESKeyBuffer) {

                console.log(decryptedAESKeyBuffer);

                return window.crypto.subtle.importKey(
                    "raw",
                    decryptedAESKeyBuffer,
                    { name: "AES-GCM" },
                    true,
                    ["decrypt"]
                );
            }).then(function (aesKey) {
                console.log(aesKey);
                resolve(aesKey);
            }).catch(reject);

        });
    },

    encryptMessage: function (message, aesKey) {

        return new Promise(function (resolve, reject) {
            var iv = window.crypto.getRandomValues(new Uint8Array(12));
            window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                aesKey,
                new TextEncoder().encode(message)
            ).then(function (encrypted) {
                resolve({
                    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
                    iv: btoa(String.fromCharCode(...iv))
                });
            }).catch(reject);
        });
    },

    decryptMessage: function (message, aesKey, rsaKey, iv) {

        return this.decryptAESKey(aesKey, rsaKey).then(function (daesKey) {
            let encryptedMessage = new Uint8Array(atob(message).split("").map(c => c.charCodeAt(0)));
            let iv_new = new Uint8Array(atob(iv).split("").map(c => c.charCodeAt(0)));
            return window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv_new },
                daesKey,
                encryptedMessage
            );
        }).then(function (decryptedMessageBuffer) {
            let msg = new TextDecoder().decode(decryptedMessageBuffer);
            return msg;
        }).catch(function (error) {
            console.error("Decryption failed:", error);
            throw error;
        });
    },
    // -------------------------------------------------------------------------------------------------------------------------------
    generateECDHKeyPair: function () {
        return new Promise(function (resolve, reject) {
            window.crypto.subtle.generateKey(
                {
                    name: "ECDH",
                    namedCurve: "P-256",
                },
                true,
                ["deriveKey"]
            ).then(function (keyPair) {
                let publicKeyPromise = window.crypto.subtle.exportKey("spki", keyPair.publicKey);
                let privateKeyPromise = window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

                Ember.RSVP.all([publicKeyPromise, privateKeyPromise]).then(function (keys) {
                    let publicKey = btoa(String.fromCharCode(...new Uint8Array(keys[0])));
                    let privateKey = btoa(String.fromCharCode(...new Uint8Array(keys[1])));

                    resolve({
                        publicKey: publicKey,
                        privateKey: privateKey
                    });
                }).catch(reject);
            }).catch(reject);
        });
    },
    deriveSharedKey : function (privatekey,grpPublicKey){
        alert(privatekey);
        let privateKeyBytes = Uint8Array.from(atob(privatekey), c => c.charCodeAt(0)).buffer;
        let publicKeyBytes = Uint8Array.from(atob(grpPublicKey), c => c.charCodeAt(0)).buffer;
        return window.crypto.subtle.importKey(
            "pkcs8",
            privateKeyBytes,
            { name: "ECDH", namedCurve: "P-256" },
            false,
            ["deriveKey"]
        ).then(function(privateKey) {
            return window.crypto.subtle.importKey(
                "spki",
                publicKeyBytes,
                { name: "ECDH", namedCurve: "P-256" },
                false,
                []
            ).then(function(publicKey) {
                return window.crypto.subtle.deriveKey(
                    { name: "ECDH", public: publicKey },
                    privateKey,
                    { name: "AES-GCM", length: 256 },
                    true,
                    ["encrypt", "decrypt"]
                );
            });
        }).catch(function(error) {
            console.error("Error deriving shared key:", error);
            return null;
        });



    },
     encryptAESKeyForGroup : function (sharedKey,aesKey){
         // var base64Key = btoa(sharedKey);
         // alert(base64Key);
         console.log("Shared Key:", sharedKey);
         var iv = window.crypto.getRandomValues(new Uint8Array(12));
         return window.crypto.subtle.encrypt(
             { name: "AES-GCM", iv: iv },
             sharedKey,
             aesKey
         ).then(function(encryptedAESKey) {
             console.log(encryptedAESKey);
             return {
                 encryptedAESKey: btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedAESKey))),
                 iv: btoa(String.fromCharCode.apply(null, iv))
             };
         }).catch(function(error) {
             console.error("Error encrypting AES key:", error);
             return null;
         })


    },
    decryptAESKeyForGroup : function (sharedKey,encryptedAESKeyBase64,ivBase64){
        console.log(encryptedAESKeyBase64)
        console.log(ivBase64);
        return new Ember.RSVP.Promise(function (resolve, reject) {
                let encryptedAESKey = new Uint8Array(atob(encryptedAESKeyBase64).split("").map(c => c.charCodeAt(0)));
                let iv = new Uint8Array(atob(ivBase64).split("").map(c => c.charCodeAt(0)))
            console.log(encryptedAESKey)
            console.log(iv);

            window.crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: iv },
                    sharedKey,
                    encryptedAESKey

                ).then(function (decryptedAESKeyBuffer) {
                    alert("fuck");
                    return window.crypto.subtle.importKey(

                        "raw",
                        decryptedAESKeyBuffer,
                        { name: "AES-GCM" },
                        false,
                        ["decrypt"]
                    );
                }).then(resolve).catch(reject);

        });
    },





};

export default CryptoUtils;
