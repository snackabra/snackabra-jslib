/*
  NOTE: THIS IS IN PROGRESS PURE BROWSER TYPESCRIPT

  As things are migrated out they will be moved to "main.NN.ts"

  */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Identity_instances, _Identity_mintKeys, _Identity_mountKeys, _SBFile_instances, _SBFile_asImage, _SBFile_getFileData, _SBFile_padImage, _SBFile_restrictPhoto, _SBFile_scaleCanvas, _SBFile_generateImageHash, _SBFile_readPhoto, _Channel_keys, _Channel_api, _Channel_socket, _ChannelSocket_channel, _ChannelSocket_identity, _ChannelSocket_payload, _ChannelSocket_queue, _StorageApi_instances, _StorageApi_channel, _StorageApi_identity, _StorageApi_getFileKey, _StorageApi_unpadData, _ChannelApi_identity, _ChannelApi_channel, _ChannelApi_channelApi, _ChannelApi_channelServer, _ChannelApi_payload, _FileSystemDB_instances, _FileSystemDB_useDatabase, _FileSystemDB_serialize, _FileSystemDB_serializeConstructor, _FileSystemDB_unserialize, _FileSystemDB_unserializeConstructor, _FileSystemDB_serializeKey, _IndexedKV_instances, _IndexedKV_useDatabase, _Snackabra_instances, _Snackabra_channel, _Snackabra_storage, _Snackabra_identity, _Snackabra_queue, _Snackabra_generateRoomId;
import { ab2str, str2ab, base64ToArrayBuffer, arrayBufferToBase64, _appendBuffer, _sb_exception, getRandomValues, SB_libraryVersion
// @ts-ignore
 } from './main.01.ts';
import { MessageBus, _sb_resolve, _sb_assert, importPublicKey } from './main.02.ts';
/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */
/* Distributed under GPL-v03, see 'LICENSE' file for details */
/* eslint-disable no-trailing-spaces */
/**
 * @fileoverview Main file for snackabra javascript utilities.
 *               See https://snackabra.io for details.
 * @package
 */
/* TODO - list of modules that main.js can now fully support:
          (note: some MI-internal references)
   m042/src/scripts/components/FormSubmission.js
*/
/* ****************************************************************
 *  OLD APPROACH: we might want this again
 *  These are wrappers to handle both browser and node targets
 *  with the same code. The 'process.browser' value is replaced
 *  by rollup and this whole library is then tree-shaken so
 *  that only either the node-specific or browser-specific code
 *  is retained, into 'index.mjs' and 'browser.mjs' respectively.
 * ****************************************************************/
/**
 * Returns 'true' if (and only if) object is of type 'Uint8Array'.
 * Works same on browsers and nodejs.
 */
// REMOVED: moving to typescript, not needed
// function _assertUint8Array(obj) {
//   if (typeof obj === 'object') if (Object.prototype.toString.call(obj) === '[object Uint8Array]') return true;
//   return false;
// }
/**
 * Takes an arbitrary dict object, a public key in PEM
 * format, and a callback function: generates a random AES key,
 * wraps that in (RSA) key, and when all done will call the
 * callback function with the results
 *
 * @param {dict} dictionary (payload)
 * @param {publicKeyPEM} public key (PEM format)
 * @param {callback} callback function, called with results
 *
 */
export function packageEncryptDict(dict, publicKeyPEM, callback) {
    const clearDataArrayBufferView = str2ab(JSON.stringify(dict));
    const aesAlgorithmKeyGen = { name: 'AES-GCM', length: 256 };
    const aesAlgorithmEncrypt = { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(16)) };
    // if (!publicKeyPEM) publicKeyPEM = defaultPublicKeyPEM;
    if (!publicKeyPEM) {
        _sb_exception('packageEncryptDict()', 'invalid PEM');
    }
    // Create a key generator to produce a one-time-use AES key to encrypt some data
    crypto.subtle.generateKey(aesAlgorithmKeyGen, true, ['encrypt']).then((aesKey) => {
        // we are exporting the symmetric AES key so we can encrypt it using pub key
        crypto.subtle.exportKey('raw', aesKey).then((theKey) => {
            const rsaAlgorithmEncrypt = { name: 'RSA-OAEP' };
            importPublicKey(publicKeyPEM).then((publicKey) => {
                return crypto.subtle.encrypt(rsaAlgorithmEncrypt, publicKey, theKey);
            }).then((buf) => {
                const encryptedAesKey = arrayBufferToBase64(new Uint8Array(buf));
                return encryptedAesKey;
            }).then((encAesKey) => {
                return Promise.all([crypto.subtle.encrypt(aesAlgorithmEncrypt, aesKey, clearDataArrayBufferView), encAesKey]);
            }).then((arr) => {
                // arr[0] is the encrypted dict in raw format, arr[1] is the aes key encrypted with rsa public key
                const encryptedData = arrayBufferToBase64(new Uint8Array(arr[0]));
                const postableEncryptedAesKey = arr[1];
                const theContent = encodeURIComponent(encryptedData);
                const data = {
                    enc_aes_key: encodeURIComponent(postableEncryptedAesKey),
                    iv: encodeURIComponent(arrayBufferToBase64(aesAlgorithmEncrypt.iv)),
                    content: theContent
                };
                if (callback) {
                    callback(data);
                }
                else {
                    console.error('(No Callback) Resulting data:');
                    console.error(data);
                }
            });
        });
    });
} // packageEncrypt()
/**
 * Partition
 */
export function partition(str, n) {
    const returnArr = [];
    let i, l;
    for (i = 0, l = str.length; i < l; i += n) {
        returnArr.push(str.substr(i, n));
    }
    return returnArr;
}
/**
 * There are o many problems with JSON parsing, adding a wrapper to capture more info.
 * The 'loc' parameter should be a (unique) string that allows you to find the usage
 * in the code; one approach is the line number in the file (at some point).
 */
export function jsonParseWrapper(str, loc) {
    var _a;
    try {
        return JSON.parse(str);
    }
    catch (error) {
        // sometimes it's an embedded string
        try {
            // This would be simple: 'return JSON.parse(eval(str));'
            // But eval() not safe. Instead we iteratively strip possible wrapping
            // single or double quotation marks. There are various cases where this
            // will not be enough, but we'll add "unwrapping" logic as we find
            // the examples.
            let s2 = '';
            let s3 = '';
            while (str != (s3 = s2, s2 = str, str = (_a = str === null || str === void 0 ? void 0 : str.match(/^(['"])(.*)\1$/m)) === null || _a === void 0 ? void 0 : _a[2]))
                ;
            return JSON.parse(`'${s3}'`);
        }
        catch (_b) {
            // let's try one more thing
            try {
                return JSON.parse(str.slice(1, -1));
            }
            catch (_d) {
                // we'll throw the original error
                throw new Error('JSON.parse() error at ' + loc + ' (tried eval and slice): ' + error.message + '\nString was: ' + str);
            }
        }
    }
}
/**
 * Extract payload
 */
function extractPayloadV1(payload) {
    try {
        const metadataSize = new Uint32Array(payload.slice(0, 4))[0];
        const decoder = new TextDecoder();
        const metadata = jsonParseWrapper(decoder.decode(payload.slice(4, 4 + metadataSize)), 'L476');
        let startIndex = 4 + metadataSize;
        const data = {};
        for (const key in metadata) {
            if (data.hasOwnProperty(key)) {
                data[key] = payload.slice(startIndex, startIndex + metadata[key]);
                startIndex += metadata[key];
            }
        }
        return data;
    }
    catch (e) {
        console.error(e);
        return {};
    }
}
/**
 * Assemble payload
 */
function assemblePayload(data) {
    try {
        const metadata = [];
        metadata['version'] = '002';
        let keyCount = 0;
        let startIndex = 0;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                keyCount++;
                metadata[keyCount.toString()] = { name: key, start: startIndex, size: data[key].byteLength };
                startIndex += data[key].byteLength;
            }
        }
        const encoder = new TextEncoder();
        const metadataBuffer = encoder.encode(JSON.stringify(metadata));
        const metadataSize = new Uint32Array([metadataBuffer.byteLength]);
        let payload = _appendBuffer(new Uint32Array(metadataSize.buffer), new Uint8Array(metadataBuffer));
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                payload = _appendBuffer(new Uint8Array(payload), data[key]);
            }
        }
        return payload;
    }
    catch (e) {
        console.error(e);
        return {};
    }
}
/**
 * Extract payload (latest version)
 */
function extractPayload(payload) {
    try {
        const metadataSize = new Uint32Array(payload.slice(0, 4))[0];
        const decoder = new TextDecoder();
        console.info('METADATASIZE: ', metadataSize);
        console.info('METADATASTRING: ', decoder.decode(payload.slice(4, 4 + metadataSize)));
        const _metadata = jsonParseWrapper(decoder.decode(payload.slice(4, 4 + metadataSize)), 'L533');
        console.info('METADATA EXTRACTED', JSON.stringify(_metadata));
        const startIndex = 4 + metadataSize;
        if (!_metadata.hasOwnProperty('version')) {
            _metadata['version'] = '001';
        }
        console.info(_metadata['version']);
        switch (_metadata['version']) {
            case '001':
                return extractPayloadV1(payload);
            case '002':
                const data = {};
                for (let i = 1; i < Object.keys(_metadata).length; i++) {
                    const _index = i.toString();
                    if (_metadata.hasOwnProperty(_index)) {
                        const propertyStartIndex = _metadata[_index]['start'];
                        console.info(propertyStartIndex);
                        const size = _metadata[_index]['size'];
                        data[_metadata[_index]['name']] = payload.slice(startIndex + propertyStartIndex, startIndex + propertyStartIndex + size);
                    }
                }
                return data;
            default:
                throw new Error('Unsupported payload version (' + _metadata['version'] + ') - fatal');
        }
    }
    catch (e) {
        throw new Error('extractPayload() exception (' + e.message + ')');
    }
}
/**
 * Encode into b64 URL
 */
function encodeB64Url(input) {
    return input.replaceAll('+', '-').replaceAll('/', '_');
}
/**
 * Decode b64 URL
 */
function decodeB64Url(input) {
    input = input.replaceAll('-', '+').replaceAll('_', '/');
    // Pad out with standard base64 required padding characters
    const pad = input.length % 4;
    if (pad) {
        if (pad === 1) {
            throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
        }
        input += new Array(5 - pad).join('=');
    }
    return input;
}
class EventEmitter extends EventTarget {
    on(type, callback) {
        this.addEventListener(type, callback);
    }
    emit(type, data) {
        new Event(type, data);
    }
}
/**
 * Crypto is a class that contains all the SB specific crypto functions
 *
 * @class
 * @constructor
 * @public
 */
class Crypto {
    /**
     * Extracts (generates) public key from a private key.
     */
    extractPubKey(privateKey) {
        try {
            const pubKey = Object.assign({}, privateKey);
            delete pubKey.d;
            delete pubKey.dp;
            delete pubKey.dq;
            delete pubKey.q;
            delete pubKey.qi;
            pubKey.key_ops = [];
            return pubKey;
        }
        catch (e) {
            console.error(e);
            return {};
        }
    }
    /**
     * Generates standard ``ECDH`` keys using ``P-384``.
     */
    generateKeys() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                resolve(yield crypto.subtle.generateKey({
                    name: 'ECDH', namedCurve: 'P-384'
                }, true, ['deriveKey']));
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    /**
     * Import keys
     */
    importKey(format, key, type, extractable, keyUsages) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const keyAlgorithms = {
                ECDH: {
                    name: 'ECDH', namedCurve: 'P-384'
                }, AES: {
                    name: 'AES-GCM'
                }, PBKDF2: 'PBKDF2'
            };
            try {
                const response = yield crypto.subtle.importKey(format, key, keyAlgorithms[type], extractable, keyUsages);
                resolve(response);
            }
            catch (e) {
                console.error(format, key, type, extractable, keyUsages);
                reject(e);
            }
        }));
    }
    /**
     * Derive key.
     */
    deriveKey(privateKey, publicKey, type, extractable, keyUsages) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const keyAlgorithms = {
                AES: {
                    name: 'AES-GCM', length: 256
                }, HMAC: {
                    name: 'HMAC', hash: 'SHA-256', length: 256
                }
            };
            try {
                resolve(yield crypto.subtle.deriveKey({
                    name: 'ECDH', public: publicKey
                }, privateKey, keyAlgorithms[type], extractable, keyUsages));
            }
            catch (e) {
                console.error(e, privateKey, publicKey, type, extractable, keyUsages);
                reject(e);
            }
        }));
    }
    /**
     * Get file key
     */
    getFileKey(fileHash, _salt) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const keyMaterial = yield this.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
                // TODO - Support deriving from PBKDF2 in deriveKey function
                const key = yield crypto.subtle.deriveKey({
                    'name': 'PBKDF2',
                    'salt': _salt, 'iterations': 100000,
                    'hash': 'SHA-256'
                }, keyMaterial, { 'name': 'AES-GCM', 'length': 256 }, true, ['encrypt', 'decrypt']);
                // return key;
                resolve(key);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    /**
     * Encrypt
     */
    encrypt(contents, secret_key = null, outputType = 'string', _iv = null) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (contents === null) {
                    reject(new Error('no contents'));
                }
                const iv = _iv === null ? crypto.getRandomValues(new Uint8Array(12)) : _iv;
                const algorithm = {
                    name: 'AES-GCM', iv: iv
                };
                const key = secret_key;
                let data = contents;
                const encoder = new TextEncoder();
                if (typeof contents === 'string') {
                    data = encoder.encode(contents);
                }
                let encrypted;
                try {
                    encrypted = yield crypto.subtle.encrypt(algorithm, key, data);
                }
                catch (e) {
                    reject(e);
                }
                resolve((outputType === 'string') ? {
                    content: encodeURIComponent(arrayBufferToBase64(encrypted)), iv: encodeURIComponent(arrayBufferToBase64(iv))
                } : { content: encrypted, iv: iv });
            }
            catch (e) {
                console.error(e);
                reject(e);
            }
        }));
    }
    /**
     * Decrypt
     */
    decrypt(secretKey, contents, outputType = 'string') {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ciphertext = typeof contents.content === 'string' ? base64ToArrayBuffer(decodeURIComponent(contents.content)) : contents.content;
                const iv = typeof contents.iv === 'string' ? base64ToArrayBuffer(decodeURIComponent(contents.iv)) : contents.iv;
                const decrypted = yield crypto.subtle.decrypt({
                    name: 'AES-GCM', iv: iv
                }, secretKey, ciphertext);
                if (outputType === 'string') {
                    resolve(new TextDecoder().decode(decrypted));
                }
                resolve(decrypted);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    /**
     * Sign
     */
    sign(secretKey, contents) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const encoder = new TextEncoder();
                const encoded = encoder.encode(contents);
                let sign;
                try {
                    sign = yield crypto.subtle.sign('HMAC', secretKey, encoded);
                    resolve(encodeURIComponent(arrayBufferToBase64(sign)));
                }
                catch (error) {
                    reject(error);
                }
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    /**
     * Verify
     */
    verify(secretKey, sign, contents) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const _sign = base64ToArrayBuffer(decodeURIComponent(sign));
                const encoder = new TextEncoder();
                const encoded = encoder.encode(contents);
                try {
                    const verified = yield crypto.subtle.verify('HMAC', secretKey, _sign, encoded);
                    resolve(verified);
                }
                catch (e) {
                    reject(e);
                }
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    /**
     * Compare keys
     */
    areKeysSame(key1, key2) {
        if (key1 != null && key2 != null && typeof key1 === 'object' && typeof key2 === 'object') {
            return key1['x'] === key2['x'] && key1['y'] === key2['y'];
        }
        return false;
    }
}
const SB_Crypto = new Crypto();
/**
 * Identity (key for use in SB)
 * @class
 * @constructor
 * @public
 */
class Identity {
    constructor(key) {
        _Identity_instances.add(this);
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (key) {
                    yield __classPrivateFieldGet(this, _Identity_instances, "m", _Identity_mountKeys).call(this, key);
                }
                else {
                    yield __classPrivateFieldGet(this, _Identity_instances, "m", _Identity_mintKeys).call(this);
                }
                resolve(this);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    get _id() {
        return JSON.stringify(this.exportable_pubKey);
    }
}
_Identity_instances = new WeakSet(), _Identity_mintKeys = function _Identity_mintKeys() {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const keyPair = yield SB_Crypto.generateKeys();
            this.exportable_pubKey = yield crypto.subtle.exportKey('jwk', keyPair.publicKey);
            this.exportable_privateKey = yield crypto.subtle.exportKey('jwk', keyPair.privateKey);
            this.privateKey = keyPair.privateKey;
            resolve(true);
        }
        catch (e) {
            reject(e);
        }
    }));
}, _Identity_mountKeys = function _Identity_mountKeys(key) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            this.exportable_privateKey = key;
            this.exportable_pubKey = SB_Crypto.extractPubKey(key);
            this.privateKey = yield SB_Crypto.importKey('jwk', key, 'ECDH', true, ['deriveKey']);
            resolve(true);
        }
        catch (e) {
            reject(e);
        }
    }));
};
/**
 * SBMessage
 * @class
 * @constructor
 * @public
 */
class SBMessage {
    constructor(contents, signKey, key) {
        this.encrypted = false;
        this.image = '';
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line prefer-const
            let imgId = '', previewId = '', imgKey = '', previewKey = '';
            this.contents = contents;
            this.sender_pubKey = key;
            this.sign = yield SB_Crypto.sign(signKey, contents);
            this.image_sign = yield SB_Crypto.sign(signKey, this.image);
            this.imageMetaData = JSON.stringify({
                imageId: imgId,
                previewId: previewId,
                imageKey: imgKey,
                previewKey: previewKey
            });
            this.imageMetadata_sign = yield SB_Crypto.sign(signKey, this.imageMetaData);
            resolve(this);
        }));
    }
}
/**
 * SBFile
 * @class
 * @constructor
 * @public
 */
class SBFile {
    // file is an instance of File
    constructor(file, signKey, key) {
        _SBFile_instances.add(this);
        this.encrypted = false;
        this.data = {
            previewImage: '',
            fullImage: ''
        };
        this.image = '';
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.contents = '';
            this.sender_pubKey = key;
            this.sign = yield SB_Crypto.sign(signKey, this.contents);
            if (file.type.match(/^image/i)) {
                __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_asImage).call(this, file, signKey).then(() => {
                    resolve(this);
                });
            }
            else {
                reject(new Error('Unsupported file type: ' + file.type));
            }
        }));
    }
}
_SBFile_instances = new WeakSet(), _SBFile_asImage = function _SBFile_asImage(image, signKey) {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        this.data.previewImage = __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_padImage).call(this, yield (yield __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_restrictPhoto).call(this, image, 4096, 'image/jpeg', 0.92)).arrayBuffer());
        const previewHash = yield __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_generateImageHash).call(this, this.data.previewImage);
        this.data.fullImage = image.size > 15728640 ? __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_padImage).call(this, yield (yield __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_restrictPhoto).call(this, image, 15360, 'image/jpeg', 0.92)).arrayBuffer()) : __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_padImage).call(this, yield image.arrayBuffer());
        const fullHash = yield __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_generateImageHash).call(this, this.data.fullImage);
        this.image = yield __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_getFileData).call(this, yield __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_restrictPhoto).call(this, image, 15, 'image/jpeg', 0.92), 'url');
        this.image_sign = yield SB_Crypto.sign(signKey, this.image);
        this.imageMetaData = JSON.stringify({
            imageId: fullHash.id,
            previewId: previewHash.id,
            imageKey: fullHash.key,
            previewKey: previewHash.key
        });
        this.imageMetadata_sign = yield SB_Crypto.sign(signKey, this.imageMetaData);
        resolve(this);
    }));
}, _SBFile_getFileData = function _SBFile_getFileData(file, outputType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const reader = new FileReader();
            if (file.size === 0) {
                return null;
            }
            outputType === 'url' ? reader.readAsDataURL(file) : reader.readAsArrayBuffer(file);
            return new Promise((resolve, reject) => {
                reader.onloadend = (event) => {
                    const the_blob = reader.result;
                    resolve(the_blob);
                };
            });
        }
        catch (e) {
            console.log(e);
            return null;
        }
    });
}, _SBFile_padImage = function _SBFile_padImage(image_buffer) {
    let _sizes = [128, 256, 512, 1024, 2048, 4096]; // in KB
    _sizes = _sizes.map((size) => size * 1024);
    const image_size = image_buffer.byteLength;
    // console.log('BEFORE PADDING: ', image_size)
    let _target;
    if (image_size < _sizes[_sizes.length - 1]) {
        for (let i = 0; i < _sizes.length; i++) {
            if (image_size + 21 < _sizes[i]) {
                _target = _sizes[i];
                break;
            }
        }
    }
    else {
        _target = (Math.ceil(image_size / (1024 * 1024))) * 1024 * 1024;
        if (image_size + 21 >= _target) {
            _target += 1024;
        }
    }
    const _padding_array = [128];
    _target = _target - image_size - 21;
    // We will finally convert to Uint32Array where each element is 4 bytes
    // So we need (_target/4) - 6 array elements with value 0 (128 bits or 16 bytes or 4 elements to be left empty,
    // last 4 bytes or 1 element to represent the size and 1st element is 128 or 0x80)
    for (let i = 0; i < _target; i++) {
        _padding_array.push(0);
    }
    // _padding_array.push(image_size);
    const _padding = new Uint8Array(_padding_array).buffer;
    // console.log('Padding size: ', _padding.byteLength)
    let final_data = _appendBuffer(image_buffer, _padding);
    final_data = _appendBuffer(final_data, new Uint32Array([image_size]).buffer);
    // console.log('AFTER PADDING: ', final_data.byteLength)
    return final_data;
}, _SBFile_restrictPhoto = function _SBFile_restrictPhoto(photo, maxSize, imageType, qualityArgument) {
    return __awaiter(this, void 0, void 0, function* () {
        // imageType default should be 'image/jpeg'
        // qualityArgument should be 0.92 for jpeg and 0.8 for png (MDN default)
        maxSize = maxSize * 1024; // KB
        // console.log(`Target size is ${maxSize} bytes`);
        let _c = yield __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_readPhoto).call(this, photo);
        let _b1 = yield new Promise((resolve) => {
            _c.toBlob(resolve, imageType, qualityArgument);
        });
        // workingDots();
        // console.log(`start canvas W ${_c.width} x H ${_c.height}`)
        let _size = _b1.size;
        if (_size <= maxSize) {
            // console.log(`Starting size ${_size} is fine`);
            return _b1;
        }
        // console.log(`Starting size ${_size} too large, start by reducing image size`);
        // compression wasn't enough, so let's resize until we're getting close
        let _old_size;
        let _old_c;
        while (_size > maxSize) {
            _old_c = _c;
            _c = __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_scaleCanvas).call(this, _c, .5);
            _b1 = yield new Promise((resolve) => {
                _c.toBlob(resolve, imageType, qualityArgument);
            });
            _old_size = _size;
            _size = _b1.size;
            // workingDots();
            // console.log(`... reduced to W ${_c.width} x H ${_c.height} (to size ${_size})`);
        }
        // we assume that within this width interval, storage is roughly prop to area,
        // with a little tuning downwards
        let _ratio = maxSize / _old_size;
        let _maxIteration = 12; // to be safe
        // console.log(`... stepping back up to W ${_old_c.width} x H ${_old_c.height} and will then try scale ${_ratio.toFixed(4)}`);
        let _final_c;
        do {
            _final_c = __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_scaleCanvas).call(this, _old_c, Math.sqrt(_ratio) * 0.99); // we're targeting within 1%
            _b1 = yield new Promise((resolve) => {
                _final_c.toBlob(resolve, imageType, qualityArgument);
                // console.log(`(generating blob of requested type ${imageType})`);
            });
            // workingDots();
            // console.log(`... fine-tuning to W ${_final_c.width} x H ${_final_c.height} (size ${_b1.size})`);
            _ratio *= (maxSize / _b1.size);
        } while (((_b1.size > maxSize) || ((Math.abs(_b1.size - maxSize) / maxSize) > 0.02)) && (--_maxIteration > 0)); // it's ok within 2%
        // workingDots();
        // console.log(`... ok looks like we're good now ... final size is ${_b1.size} (which is ${((_b1.size * 100) / maxSize).toFixed(2)}% of cap)`);
        // document.getElementById('the-original-image').width = _final_c.width;  // a bit of a hack
        return _b1;
    });
}, _SBFile_scaleCanvas = function _SBFile_scaleCanvas(canvas, scale) {
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;
    // console.log(`#### scaledCanvas target W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
    scaledCanvas
        .getContext('2d')
        .drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    // console.log(`#### scaledCanvas actual W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
    return scaledCanvas;
}, _SBFile_generateImageHash = function _SBFile_generateImageHash(image) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const digest = yield crypto.subtle.digest('SHA-512', image);
            const _id = digest.slice(0, 32);
            const _key = digest.slice(32);
            return {
                id: encodeURIComponent(arrayBufferToBase64(_id)),
                key: encodeURIComponent(arrayBufferToBase64(_key))
            };
        }
        catch (e) {
            console.log(e);
            return {};
        }
    });
}, _SBFile_readPhoto = function _SBFile_readPhoto(photo) {
    return __awaiter(this, void 0, void 0, function* () {
        const canvas = document.createElement('canvas');
        const img = document.createElement('img');
        // create img element from File object
        img.src = yield new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(photo);
        });
        yield new Promise((resolve) => {
            img.onload = resolve;
        });
        // console.log("img object");
        // console.log(img);
        // console.log("canvas object");
        // console.log(canvas);
        // draw image in canvas element
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas;
    });
};
/**
 * Takes a message object and turns it into a payload to be
 * used by SB protocol
 */
class Payload {
    /**
     * wrap
     */
    wrap(contents, key) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const msg = { encrypted_contents: yield SB_Crypto.encrypt(JSON.stringify(contents), key, 'string') };
                resolve(JSON.stringify(msg));
            }
            catch (e) {
                console.error(e);
                reject(new Error('Unable to encrypt payload.'));
            }
        }));
    }
    /**
     * unwrap
     */
    unwrap(payload, key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const msg = yield SB_Crypto.decrypt(key, payload.encrypted_contents);
                if (msg.error) {
                    return { error: msg.error };
                }
                return msg;
            }
            catch (e) {
                return { error: e.message };
            }
        });
    }
}
/**
 * mtg: Protocol code that we wrap our WebSocket in
 * I will be updating this to send messages and remove
 * the wait to send messages only when ack received
 * The benefit is reduced latency in communication protocol
 */
class WS_Protocol {
    constructor(options) {
        this.events = new MessageBus();
        this.options = {
            url: '', onOpen: null, onMessage: null, onClose: null, onError: null, timeout: 30000
        };
        this.send = (message) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (this.currentWebSocket.readyState === 1) {
                        const hash = yield crypto.subtle
                            .digest('SHA-256', new TextEncoder().encode(message));
                        const ackPayload = {
                            timestamp: Date.now(), type: 'ack', _id: arrayBufferToBase64(hash)
                        };
                        this.currentWebSocket.send(message);
                        this.currentWebSocket.send(JSON.stringify(ackPayload));
                        const timeout = setTimeout(() => {
                            const error = `Websocket request timed out after ${this.options.timeout}ms`;
                            console.error(error, 'ws_ack_' + ackPayload._id);
                            reject(new Error(error));
                        }, this.options.timeout);
                        const ackResponse = () => {
                            clearTimeout(timeout);
                            this.events.unsubscribe('ws_ack_' + ackPayload._id, ackResponse);
                            resolve();
                        };
                        this.events.subscribe('ws_ack_' + ackPayload._id, ackResponse);
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }));
        };
        if (!options.url) {
            throw new Error('URL must be set');
        }
        this.options = Object.assign(this.options, options);
        this.join();
    }
    /**
     * Get options
     */
    get options() {
        return this.options;
    }
    /**
     * join
     */
    join() {
        return new Promise((resolve, reject) => {
            try {
                this.currentWebSocket = new _ws(this.options.url);
                this.onError();
                this.onClose();
                this.onOpen();
                this.onMessage();
                resolve();
            }
            catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }
    /**
     * close
     */
    close() {
        this.currentWebSocket.close();
    }
    /**
     * onError
     */
    onError() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentWebSocket.addEventListener('error', (event) => {
                console.error('WebSocket error, reconnecting:', event);
                if (typeof this.options.onError === 'function') {
                    this.options.onError(event);
                }
            });
        });
    }
    /**
     * onClose
     */
    onClose() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentWebSocket.addEventListener('close', (event) => {
                console.info('Websocket closed', event);
                if (typeof this.options.onClose === 'function') {
                    this.options.onClose(event);
                }
            });
        });
    }
    /**
     * onMessage
     */
    onMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentWebSocket.addEventListener('message', (event) => __awaiter(this, void 0, void 0, function* () {
                const data = jsonParseWrapper(event.data, 'L1342');
                if (data.ack) {
                    this.events.publish('ws_ack_' + data._id);
                    return;
                }
                if (data.nack) {
                    console.error('Nack received');
                    this.close();
                    return;
                }
                if (typeof this.options.onMessage === 'function') {
                    this.options.onMessage(data);
                }
            }));
        });
    }
    /**
     * readyState
     */
    get readyState() {
        return this.currentWebSocket.readyState;
    }
    /**
     * onOpen
     */
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentWebSocket.addEventListener('open', (event) => __awaiter(this, void 0, void 0, function* () {
                if (typeof this.options.onOpen === 'function') {
                    this.options.onOpen(event);
                }
            }));
        });
    }
}
/**
 * Channel
 * @class
 * @constructor
 * @public
 */
class Channel {
    constructor(https, wss, identity, channel_id = null) {
        this.metaData = {};
        _Channel_keys.set(this, void 0);
        _Channel_api.set(this, ChannelApi);
        _Channel_socket.set(this, ChannelSocket);
        this.loadKeys = (keys) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (keys.ownerKey === null) {
                    reject(new Error('Channel does not exist'));
                }
                let _exportable_owner_pubKey = jsonParseWrapper(keys.ownerKey || JSON.stringify({}), 'L1460');
                if (_exportable_owner_pubKey.hasOwnProperty('key')) {
                    _exportable_owner_pubKey = typeof _exportable_owner_pubKey.key === 'object' ? _exportable_owner_pubKey.key : jsonParseWrapper(_exportable_owner_pubKey.key, 'L1463');
                }
                try {
                    _exportable_owner_pubKey.key_ops = [];
                }
                catch (error) {
                    reject(error);
                }
                const _exportable_room_signKey = jsonParseWrapper(keys.signKey, 'L1470');
                const _exportable_encryption_key = jsonParseWrapper(keys.encryptionKey, 'L1471');
                let _exportable_verifiedGuest_pubKey = jsonParseWrapper(keys.guestKey || null, 'L1472');
                const _exportable_pubKey = this.identity.exportable_pubKey;
                const _privateKey = this.identity.privateKey;
                let isVerifiedGuest = false;
                const _owner_pubKey = yield SB_Crypto.importKey('jwk', _exportable_owner_pubKey, 'ECDH', false, []);
                if (_owner_pubKey.error) {
                    console.error(_owner_pubKey.error);
                }
                const isOwner = SB_Crypto.areKeysSame(_exportable_pubKey, _exportable_owner_pubKey);
                let isAdmin;
                // TODO .. hardcoded i don't know what this does ...
                // if (process.browser) {
                isAdmin = (document.cookie.split('; ').find((row) => row.startsWith('token_' + this._id)) !== undefined) || (this.url !== 'https://s_socket.privacy.app' && isOwner);
                // } else {
                //   isAdmin = (process.env.REACT_APP_ROOM_SERVER !== 's_socket.privacy.app' && isOwner);
                // }
                if (!isOwner && !isAdmin) {
                    if (_exportable_verifiedGuest_pubKey === null) {
                        this.api.postPubKey(_exportable_pubKey);
                        _exportable_verifiedGuest_pubKey = Object.assign({}, _exportable_pubKey);
                    }
                    if (SB_Crypto.areKeysSame(_exportable_verifiedGuest_pubKey, _exportable_pubKey)) {
                        isVerifiedGuest = true;
                    }
                }
                const _encryption_key = yield SB_Crypto.importKey('jwk', _exportable_encryption_key, 'AES', false, ['encrypt', 'decrypt']);
                const _room_privateSignKey = yield SB_Crypto.importKey('jwk', _exportable_room_signKey, 'ECDH', true, ['deriveKey']);
                const _exportable_room_signPubKey = SB_Crypto.extractPubKey(_exportable_room_signKey);
                const _room_signPubKey = yield SB_Crypto.importKey('jwk', _exportable_room_signPubKey, 'ECDH', true, []);
                const _personal_signKey = yield SB_Crypto.deriveKey(_privateKey, _room_signPubKey, 'HMAC', false, ['sign', 'verify']);
                let _shared_key = null;
                if (!isOwner) {
                    _shared_key = yield SB_Crypto.deriveKey(_privateKey, _owner_pubKey, 'AES', false, ['encrypt', 'decrypt']);
                }
                let _locked_key = null, _exportable_locked_key;
                // if (process.browser) {
                _exportable_locked_key = localStorage.getItem(this._id + '_lockedKey');
                // } else {
                //   _exportable_locked_key = await localStorage.getItem(this._id + '_lockedKey');
                // }
                if (_exportable_locked_key !== null) {
                    _locked_key = yield SB_Crypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key, 'L1517'), 'AES', false, ['encrypt', 'decrypt']);
                }
                else if (keys.locked_key) {
                    const _string_locked_key = (yield SB_Crypto.decrypt(isOwner ? yield SB_Crypto.deriveKey(keys.privateKey, yield SB_Crypto.importKey('jwk', keys.exportable_pubKey, 'ECDH', true, []), 'AES', false, ['decrypt']) : _shared_key, jsonParseWrapper(keys.locked_key, 'L1519'), 'string')).plaintext;
                    _exportable_locked_key = jsonParseWrapper(_string_locked_key, 'L1520');
                    _locked_key = yield SB_Crypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key, 'L1521'), 'AES', false, ['encrypt', 'decrypt']);
                }
                __classPrivateFieldSet(this, _Channel_keys, {
                    shared_key: _shared_key,
                    exportable_owner_pubKey: _exportable_owner_pubKey,
                    exportable_verifiedGuest_pubKey: _exportable_verifiedGuest_pubKey,
                    personal_signKey: _personal_signKey,
                    room_privateSignKey: _room_privateSignKey,
                    encryptionKey: _encryption_key,
                    locked_key: _locked_key,
                    exportable_locked_key: _exportable_locked_key
                }, "f");
                this.owner = isOwner;
                this.admin = isAdmin;
                this.verifiedGuest = isVerifiedGuest;
                resolve(true);
            }));
        };
        return new Promise((resolve) => {
            this.url = https;
            this.wss = wss;
            this.identity = identity;
            if (channel_id) {
                this._id = channel_id;
                this.join(channel_id).then(() => {
                    resolve(this);
                });
            }
        });
    }
    /**
     * Join channel, channel_id is the :term:`Channel Name`.
     */
    join(channel_id) {
        return new Promise((resolve) => {
            if (channel_id === null) {
                return;
            }
            this._id = channel_id;
            __classPrivateFieldSet(this, _Channel_api, new ChannelApi(this.url, this, this.identity), "f");
            __classPrivateFieldSet(this, _Channel_socket, new ChannelSocket(this.wss, this, this.identity), "f");
            __classPrivateFieldGet(this, _Channel_socket, "f").onJoin = (message) => __awaiter(this, void 0, void 0, function* () {
                if (message === null || message === void 0 ? void 0 : message.ready) {
                    console.log(message);
                    this.metaData = message;
                    this.loadKeys(message.keys).then(() => {
                        this.socket.isReady();
                        resolve(this);
                    });
                }
            });
        });
    }
    /**
     * Return keys
     */
    get keys() {
        return __classPrivateFieldGet(this, _Channel_keys, "f");
    }
    /**
     * Return API
     */
    get api() {
        return __classPrivateFieldGet(this, _Channel_api, "f");
    }
    /**
     * Return socket
     */
    get socket() {
        return __classPrivateFieldGet(this, _Channel_socket, "f");
    }
}
_Channel_keys = new WeakMap(), _Channel_api = new WeakMap(), _Channel_socket = new WeakMap();
/**
 * Channel Socket
 * @class
 * @constructor
 * @public
 */
class ChannelSocket {
    constructor(wsUrl, channel, identity) {
        _ChannelSocket_channel.set(this, void 0);
        _ChannelSocket_identity.set(this, void 0);
        _ChannelSocket_payload.set(this, void 0);
        _ChannelSocket_queue.set(this, []);
        this.ready = false;
        this.channelId = channel._id;
        this.url = wsUrl;
        __classPrivateFieldSet(this, _ChannelSocket_channel, channel, "f");
        __classPrivateFieldSet(this, _ChannelSocket_identity, identity, "f");
        __classPrivateFieldSet(this, _ChannelSocket_payload, new Payload(), "f");
        this.open();
    }
    /**
     * setKeys
     */
    setKeys(_keys) {
        __classPrivateFieldGet(this, _ChannelSocket_channel, "f").loadKeys(_keys);
    }
    /**
     * open
     */
    open() {
        const options = {
            url: this.url + '/api/room/' + this.channelId + '/websocket',
            onOpen: (event) => __awaiter(this, void 0, void 0, function* () {
                console.info('websocket opened');
                this.init = { name: JSON.stringify(__classPrivateFieldGet(this, _ChannelSocket_identity, "f").exportable_pubKey) };
                yield this.socket.send(JSON.stringify(this.init));
                if (typeof this.onOpen === 'function') {
                    this.onOpen(event);
                }
            }),
            onMessage: (event) => __awaiter(this, void 0, void 0, function* () {
                if (event === null || event === void 0 ? void 0 : event.ready) {
                    if (typeof this.onJoin === 'function') {
                        this.onJoin(event);
                        if (typeof this.onSystemInfo === 'function') {
                            this.onSystemInfo(event);
                        }
                    }
                }
                else if (event === null || event === void 0 ? void 0 : event.system) {
                    if (typeof this.onSystemInfo === 'function') {
                        this.onSystemInfo(event);
                    }
                }
                else {
                    if (typeof this.onMessage === 'function') {
                        this.onMessage(yield this.receive(event));
                    }
                }
            }),
            onClose: (event) => {
                if (typeof this.onClose === 'function') {
                    this.onClose(event);
                }
            },
            onError: (event) => {
                if (typeof this.onError === 'function') {
                    this.onError(event);
                }
            }
        };
        this.socket = new WS_Protocol(options);
    }
    /**
     * close
     */
    close() {
        this.socket.close();
    }
    /**
     * isReady
     */
    isReady() {
        console.info('SB Socket ready');
        this.ready = true;
        if (__classPrivateFieldGet(this, _ChannelSocket_queue, "f").length > 0) {
            __classPrivateFieldGet(this, _ChannelSocket_queue, "f").forEach((message) => {
                this.send(message);
            });
        }
    }
    /**
     * Send message on channel socket
     */
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ready) {
                let payload;
                if (message instanceof SBMessage) {
                    payload = yield __classPrivateFieldGet(this, _ChannelSocket_payload, "f").wrap(message, __classPrivateFieldGet(this, _ChannelSocket_channel, "f").keys.encryptionKey);
                }
                else {
                    payload = yield __classPrivateFieldGet(this, _ChannelSocket_payload, "f").wrap(yield new SBMessage(message, __classPrivateFieldGet(this, _ChannelSocket_channel, "f").keys.personal_signKey, __classPrivateFieldGet(this, _ChannelSocket_identity, "f").exportable_pubKey), __classPrivateFieldGet(this, _ChannelSocket_channel, "f").keys.encryptionKey);
                }
                this.socket.send(payload);
            }
            else {
                __classPrivateFieldGet(this, _ChannelSocket_queue, "f").push(message);
            }
        });
    }
    /**
     * Send SB object (file) on channel socket
     */
    sendSbObject(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ready) {
                const payload = yield __classPrivateFieldGet(this, _ChannelSocket_payload, "f").wrap(file, __classPrivateFieldGet(this, _ChannelSocket_channel, "f").keys.encryptionKey);
                this.socket.send(payload);
            }
            else {
                __classPrivateFieldGet(this, _ChannelSocket_queue, "f").push(message);
            }
        });
    }
    /**
     * Receive message on channel socket
     */
    receive(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Object.keys(message)[0];
                let unwrapped;
                if (message[id].hasOwnProperty('encrypted_contents')) {
                    try {
                        unwrapped = yield SB_Crypto.decrypt(__classPrivateFieldGet(this, _ChannelSocket_channel, "f").keys.encryptionKey, message[id].encrypted_contents, 'string');
                    }
                    catch (e) {
                        console.warn(e);
                        unwrapped = yield SB_Crypto.decrypt(__classPrivateFieldGet(this, _ChannelSocket_channel, "f").keys.locked_key, message[id].encrypted_contents, 'string');
                    }
                }
                else {
                    unwrapped = message;
                }
                unwrapped = jsonParseWrapper(unwrapped, 'L1702');
                unwrapped._id = id;
                localStorage.setItem(__classPrivateFieldGet(this, _ChannelSocket_channel, "f")._id + '_lastSeenMessage', id.slice(__classPrivateFieldGet(this, _ChannelSocket_channel, "f")._id.length));
                return JSON.stringify(unwrapped);
            }
            catch (e) {
                console.error('ERROR: receive() failed to process message: ', e);
                return null;
            }
        });
    }
}
_ChannelSocket_channel = new WeakMap(), _ChannelSocket_identity = new WeakMap(), _ChannelSocket_payload = new WeakMap(), _ChannelSocket_queue = new WeakMap();
/**
 * Storage API
 * @class
 * @constructor
 * @public
 */
class StorageApi {
    constructor(server, channel, identity) {
        _StorageApi_instances.add(this);
        _StorageApi_channel.set(this, void 0);
        _StorageApi_identity.set(this, void 0);
        this.server = server + '/api/v1';
        __classPrivateFieldSet(this, _StorageApi_channel, channel, "f");
        __classPrivateFieldSet(this, _StorageApi_identity, identity, "f");
    }
    /**
     * saveFile
     */
    saveFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (file instanceof File) {
                const sbFile = yield new SBFile(file, __classPrivateFieldGet(this, _StorageApi_channel, "f").keys.personal_signKey, __classPrivateFieldGet(this, _StorageApi_identity, "f").exportable_pubKey);
                const metaData = jsonParseWrapper(sbFile.imageMetaData, 'L1732');
                const fullStorePromise = this.storeImage(sbFile.data.fullImage, metaData.imageId, metaData.imageKey, 'f');
                const previewStorePromise = this.storeImage(sbFile.data.previewImage, metaData.previewId, metaData.previewKey, 'p');
                Promise.all([fullStorePromise, previewStorePromise]).then((results) => __awaiter(this, void 0, void 0, function* () {
                    results.forEach((controlData) => __awaiter(this, void 0, void 0, function* () {
                        __classPrivateFieldGet(this, _StorageApi_channel, "f").socket.sendSbObject(Object.assign(Object.assign({}, controlData), { control: true }));
                    }));
                    __classPrivateFieldGet(this, _StorageApi_channel, "f").socket.sendSbObject(sbFile);
                }));
            }
            else {
                throw new Error('Must be an instance of File accepted');
            }
        });
    }
    /**
     * storeRequest
     */
    storeRequest(fileId) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(this.server + '/storeRequest?name=' + fileId)
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.arrayBuffer();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    /**
     * storeData
     */
    storeData(type, fileId, encrypt_data, storageToken, data) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(this.server + '/storeData?type=' + type + '&key=' + encodeURIComponent(fileId), {
                method: 'POST', body: assemblePayload({
                    iv: encrypt_data.iv,
                    salt: encrypt_data.salt,
                    image: data.content,
                    storageToken: (new TextEncoder()).encode(storageToken),
                    vid: crypto.getRandomValues(new Uint8Array(48))
                })
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    /**
     * storeImage
     */
    storeImage(image, image_id, keyData, type) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const storeReqResp = yield this.storeRequest(image_id);
            const encrypt_data = extractPayload(storeReqResp);
            const key = yield __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_getFileKey).call(this, keyData, encrypt_data.salt);
            const data = yield SB_Crypto.encrypt(image, key, 'arrayBuffer', encrypt_data.iv);
            const storageTokenReq = yield __classPrivateFieldGet(this, _StorageApi_channel, "f").api.storageRequest(data.content.byteLength);
            if (storageTokenReq.hasOwnProperty('error')) {
                return { error: storageTokenReq.error };
            }
            const storageToken = JSON.stringify(storageTokenReq);
            const resp_json = yield this.storeData(type, image_id, encrypt_data, storageToken, data);
            if (resp_json.hasOwnProperty('error')) {
                reject(new Error(resp_json.error));
            }
            resolve({ verificationToken: resp_json.verification_token, id: resp_json.image_id, type: type });
        }));
    }
    /**
     * fetchData
     */
    fetchData(msgId, verificationToken) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(this.server + '/fetchData?id=' + encodeURIComponent(msgId) + '&verification_token=' + verificationToken, {
                method: 'GET'
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.arrayBuffer();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    /**
     * retrieveData
     */
    retrieveData(msgId, messages, controlMessages) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageMetaData = messages.find((msg) => msg._id === msgId).imageMetaData;
            const image_id = imageMetaData.previewId;
            const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.hasOwnProperty('id') && ctrl_msg.id.startsWith(image_id));
            if (!control_msg) {
                return { 'error': 'Failed to fetch data - missing control message for that image' };
            }
            const imageFetch = yield this.fetchData(control_msg.id, control_msg.verificationToken);
            const data = extractPayload(imageFetch);
            const iv = data.iv;
            const salt = data.salt;
            const image_key = yield __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_getFileKey).call(this, imageMetaData.previewKey, salt);
            const encrypted_image = data.image;
            const padded_img = yield SB_Crypto.decrypt(image_key, { content: encrypted_image, iv: iv }, 'arrayBuffer');
            const img = __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_unpadData).call(this, padded_img);
            if (img.error) {
                console.error('(Image error: ' + img.error + ')');
                throw new Error('Failed to fetch data - authentication or formatting error');
            }
            return { 'url': 'data:image/jpeg;base64,' + arrayBufferToBase64(img) };
        });
    }
    /**
     * retrieveDataFromMessage
     */
    retrieveDataFromMessage(message, controlMessages) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageMetaData = typeof message.imageMetaData === 'string' ? jsonParseWrapper(message.imageMetaData, 'L1893') : message.imageMetaData;
            const image_id = imageMetaData.previewId;
            const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.hasOwnProperty('id') && ctrl_msg.id === image_id);
            if (!control_msg) {
                return { 'error': 'Failed to fetch data - missing control message for that image' };
            }
            const imageFetch = yield this.fetchData(control_msg.id, control_msg.verificationToken);
            const data = extractPayload(imageFetch);
            const iv = data.iv;
            const salt = data.salt;
            const image_key = yield __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_getFileKey).call(this, imageMetaData.previewKey, salt);
            const encrypted_image = data.image;
            const padded_img = yield SB_Crypto.decrypt(image_key, { content: encrypted_image, iv: iv }, 'arrayBuffer');
            const img = __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_unpadData).call(this, padded_img);
            if (img.error) {
                console.error('(Image error: ' + img.error + ')');
                throw new Error('Failed to fetch data - authentication or formatting error');
            }
            return { 'url': 'data:image/jpeg;base64,' + arrayBufferToBase64(img) };
        });
    }
}
_StorageApi_channel = new WeakMap(), _StorageApi_identity = new WeakMap(), _StorageApi_instances = new WeakSet(), _StorageApi_getFileKey = function _StorageApi_getFileKey(fileHash, _salt) {
    return __awaiter(this, void 0, void 0, function* () {
        const keyMaterial = yield SB_Crypto.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
        // TODO - Support deriving from PBKDF2 in deriveKey function
        const key = yield crypto.subtle.deriveKey({
            'name': 'PBKDF2',
            'salt': _salt,
            'iterations': 100000,
            'hash': 'SHA-256'
        }, keyMaterial, { 'name': 'AES-GCM', 'length': 256 }, true, ['encrypt', 'decrypt']);
        // return key;
        return key;
    });
}, _StorageApi_unpadData = function _StorageApi_unpadData(data_buffer) {
    const _size = new Uint32Array(data_buffer.slice(-4))[0];
    return data_buffer.slice(0, _size);
};
/**
 * Channel API
 * @class
 * @constructor
 * @public
 */
class ChannelApi {
    constructor(server, channel, identity) {
        _ChannelApi_identity.set(this, void 0);
        _ChannelApi_channel.set(this, void 0);
        _ChannelApi_channelApi.set(this, void 0);
        _ChannelApi_channelServer.set(this, void 0);
        _ChannelApi_payload.set(this, void 0);
        this.server = server;
        __classPrivateFieldSet(this, _ChannelApi_channel, channel, "f");
        __classPrivateFieldSet(this, _ChannelApi_payload, new Payload(), "f");
        __classPrivateFieldSet(this, _ChannelApi_channelApi, server + '/api/', "f");
        __classPrivateFieldSet(this, _ChannelApi_channelServer, server + '/api/room/', "f");
        __classPrivateFieldSet(this, _ChannelApi_identity, identity, "f");
    }
    /**
     * getLastMessageTimes
     */
    getLastMessageTimes() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelApi, "f") + '/getLastMessageTimes', {
                method: 'POST', body: JSON.stringify([__classPrivateFieldGet(this, _ChannelApi_channel, "f")._id])
            }).then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            }).then((message_times) => {
                resolve(message_times[__classPrivateFieldGet(this, _ChannelApi_channel, "f")._id]);
            }).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * getOldMessages
     */
    getOldMessages(currentMessagesLength) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/oldMessages?currentMessagesLength=' + currentMessagesLength, {
                method: 'GET',
            }).then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            }).then((_encrypted_messages) => __awaiter(this, void 0, void 0, function* () {
                resolve(_encrypted_messages);
            })).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * updateCapacity
     */
    updateCapacity(capacity) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/updateRoomCapacity?capacity=' + capacity, {
                method: 'GET', credentials: 'include'
            }).then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            }).then((data) => __awaiter(this, void 0, void 0, function* () {
                resolve(data);
            })).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * getCapacity
     */
    getCapacity() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/getRoomCapacity', {
                method: 'GET', credentials: 'include'
            }).then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            }).then((data) => __awaiter(this, void 0, void 0, function* () {
                resolve(data.capacity);
            })).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * getJoinRequests
     */
    getJoinRequests() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/getJoinRequests', {
                method: 'GET', credentials: 'include'
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => __awaiter(this, void 0, void 0, function* () {
                if (data.error) {
                    reject(new Error(data.error));
                }
                resolve(data);
            })).catch((error) => {
                reject(error);
            });
        }));
    }
    /**
     * isLocked
     */
    isLocked() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/roomLocked', {
                method: 'GET', credentials: 'include'
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                resolve(data.locked);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    /**
     * Set message of the day
     */
    setMOTD(motd) {
        console.log(motd);
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            //if (this.#channel.owner) {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/motd', {
                method: 'POST', body: JSON.stringify({ motd: motd }), headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
            //} else {
            //  reject(new Error('Must be chann el owner to get admin data'));
            //}
        }));
    }
    /**
     * getAdminData
     */
    getAdminData() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            //if (this.#channel.owner) {
            const token_data = new Date().getTime().toString();
            const token_sign = yield SB_Crypto.sign(__classPrivateFieldGet(this, _ChannelApi_identity, "f").personal_signKey, token_data);
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/getAdminData', {
                method: 'GET', credentials: 'include', headers: {
                    'authorization': token_data + '.' + token_sign, 'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                if (data.error) {
                    reject(new Error(data.error));
                }
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
            ///} else {
            ///  reject(new Error('Must be channel owner to get admin data'));
            //}
        }));
    }
    /**
     * downloadData
     */
    downloadData() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/downloadData', {
                method: 'GET', credentials: 'include', headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    uploadChannel(channelData) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/uploadRoom', {
                method: 'POST', body: channelData, headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    authorize(ownerPublicKey, serverSecret) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/authorizeRoom', {
                method: 'POST', body: { roomId: __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id, SERVER_SECRET: serverSecret, ownerKey: ownerPublicKey }
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    postPubKey(_exportable_pubKey) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/postPubKey?type=guestKey', {
                method: 'POST',
                body: JSON.stringify(_exportable_pubKey),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    storageRequest(byteLength) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/storageRequest?size=' + byteLength, {
                method: 'GET', credentials: 'include', headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    lock() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _ChannelApi_channel, "f").keys.locked_key == null && __classPrivateFieldGet(this, _ChannelApi_channel, "f").channel_admin) {
                const _locked_key = yield crypto.subtle.generateKey({
                    name: 'AES-GCM', length: 256
                }, true, ['encrypt', 'decrypt']);
                const _exportable_locked_key = yield crypto.subtle.exportKey('jwk', _locked_key);
                fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/lockRoom', {
                    method: 'GET', credentials: 'include'
                })
                    .then((response) => {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then((data) => __awaiter(this, void 0, void 0, function* () {
                    if (data.locked) {
                        yield this.acceptVisitor(JSON.stringify(__classPrivateFieldGet(this, _ChannelApi_identity, "f").exportable_pubKey));
                    }
                    resolve({ locked: data.locked, lockedKey: _exportable_locked_key });
                })).catch((error) => {
                    reject(error);
                });
            }
        }));
    }
    acceptVisitor(pubKey) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const shared_key = yield SB_Crypto.deriveKey(__classPrivateFieldGet(this, _ChannelApi_identity, "f").keys.privateKey, yield SB_Crypto.importKey('jwk', jsonParseWrapper(pubKey, 'L2276'), 'ECDH', false, []), 'AES', false, ['encrypt', 'decrypt']);
            const _encrypted_locked_key = yield SB_Crypto.encrypt(JSON.stringify(__classPrivateFieldGet(this, _ChannelApi_channel, "f").keys.exportable_locked_key), shared_key, 'string');
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/acceptVisitor', {
                method: 'POST',
                body: JSON.stringify({ pubKey: pubKey, lockedKey: JSON.stringify(_encrypted_locked_key) }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    ownerKeyRotation() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/ownerKeyRotation', {
                method: 'GET', credentials: 'include', headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            })
                .then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    // unused
    notifications() {
    }
    //unused
    getPubKeys() {
    }
    // unused
    ownerUnread() {
    }
    // unused
    registerDevice() {
    }
}
_ChannelApi_identity = new WeakMap(), _ChannelApi_channel = new WeakMap(), _ChannelApi_channelApi = new WeakMap(), _ChannelApi_channelServer = new WeakMap(), _ChannelApi_payload = new WeakMap();
/**
 * KV
 * @class
 * @constructor
 * @public
 */
class KV {
    constructor(options) {
        this.events = new EventEmitter();
        // if (!process.browser) {
        //   this.db = new FileSystemDB(options);
        // } else {
        if (!window.indexedDB) {
            throw new Error('Your browser doesn\'t support a stable version of IndexedDB.');
        }
        this.db = new IndexedKV(options);
        // }
    }
    openCursor(match, callback) {
        return this.db.openCursor(match, callback);
    }
    // Set item will insert or replace
    setItem(key, value) {
        return this.db.setItem(key, value);
    }
    ;
    //Add item but not replace
    add(key, value) {
        return this.db.add(key, value);
    }
    ;
    getItem(key) {
        return this.db.getItem(key);
    }
    ;
    removeItem(key) {
        return this.db.removeItem(key);
    }
    ;
}
/**
 * FileSystemDB
 *
 * @class
 * @constructor
 * @public
 */
class FileSystemDB {
    constructor(options) {
        _FileSystemDB_instances.add(this);
        this.options = {
            db: 'MyDB', table: 'default', onReady: null
        };
        this.openCursor = (match, callback) => {
            return new Promise((resolve, reject) => {
                try {
                    _fs.readdir(this.path, (err, files) => {
                        if (err) {
                            reject(err);
                        }
                        files.forEach((f) => __awaiter(this, void 0, void 0, function* () {
                            const regex = new RegExp(`^${match}`);
                            if (f.match(regex)) {
                                callback(yield this.getItem(f));
                            }
                        }));
                        resolve();
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        _FileSystemDB_useDatabase.set(this, () => {
            this.path = _path.join(process.env.PWD, 'FileSystemDB', this.options.db, this.options.table);
            if (!_fs.existsSync(this.path)) {
                _fs.mkdirSync(this.path, { recursive: true });
                console.info('Created directory for FileSystemDB');
            }
        });
        // Set item will insert or replace
        this.setItem = (key, value) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const data = yield __classPrivateFieldGet(this, _FileSystemDB_instances, "m", _FileSystemDB_serialize).call(this, value);
                    _fs.writeFileSync(this.path + _path.sep + __classPrivateFieldGet(this, _FileSystemDB_instances, "m", _FileSystemDB_serializeKey).call(this, key), data);
                }
                catch (e) {
                    reject(e);
                }
            }));
        };
        //Add item but not replace
        this.add = (key, value) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const data = yield __classPrivateFieldGet(this, _FileSystemDB_instances, "m", _FileSystemDB_serialize).call(this, value);
                    _fs.writeFileSync(this.path + _path.sep + __classPrivateFieldGet(this, _FileSystemDB_instances, "m", _FileSystemDB_serializeKey).call(this, key), data, 'wx');
                    resolve(true);
                }
                catch (e) {
                    console.error(e);
                    reject(e);
                }
            }));
        };
        this.getItem = (key) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const file = this.path + _path.sep + __classPrivateFieldGet(this, _FileSystemDB_instances, "m", _FileSystemDB_serializeKey).call(this, key);
                    if (_fs.existsSync(file)) {
                        const data = _fs.readFileSync(file);
                        resolve(__classPrivateFieldGet(this, _FileSystemDB_instances, "m", _FileSystemDB_unserialize).call(this, data));
                    }
                    else {
                        resolve(null);
                    }
                }
                catch (e) {
                    reject(e);
                }
            }));
        };
        this.removeItem = (key) => {
            return new Promise((resolve, reject) => {
                try {
                    _fs.unlinkSync(this.path + _path.sep + __classPrivateFieldGet(this, _FileSystemDB_instances, "m", _FileSystemDB_serializeKey).call(this, key));
                    resolve(true);
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        this.options = Object.assign(this.options, options);
        __classPrivateFieldGet(this, _FileSystemDB_useDatabase, "f").call(this);
    }
}
_FileSystemDB_useDatabase = new WeakMap(), _FileSystemDB_instances = new WeakSet(), _FileSystemDB_serialize = function _FileSystemDB_serialize(value) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const storable = {
                dataType: typeof value
            };
            switch (storable.dataType) {
                case 'string' || 'number' || 'bigint' || 'boolean' || 'symbol':
                    storable.value = value;
                    break;
                case 'object':
                    storable.constructor = value.constructor.name;
                    storable.value = __classPrivateFieldGet(this, _FileSystemDB_instances, "m", _FileSystemDB_serializeConstructor).call(this, value, storable.constructor);
            }
            resolve(JSON.stringify(storable));
        }
        catch (e) {
            reject(e);
        }
    }));
}, _FileSystemDB_serializeConstructor = function _FileSystemDB_serializeConstructor(value, constructor) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            let data;
            switch (constructor) {
                case 'ArrayBuffer' || 'TypedArray' || 'DataView' || 'Blob':
                    data = arrayBufferToBase64(value);
                    break;
                case 'Array' || 'Object' || 'Map' || 'Set':
                    data = value;
                    break;
                default:
                    data = value;
            }
            return data;
        }
        catch (e) {
            reject(e);
        }
    }));
}, _FileSystemDB_unserialize = function _FileSystemDB_unserialize(value) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const readable = jsonParseWrapper(value, 'L2478');
            switch (readable.dataType) {
                case 'string' || 'number' || 'bigint' || 'boolean' || 'symbol':
                    break;
                case 'object':
                    readable.value = __classPrivateFieldGet(this, _FileSystemDB_instances, "m", _FileSystemDB_unserializeConstructor).call(this, value, readable.constructor);
            }
            resolve(readable.value);
        }
        catch (e) {
            reject(e);
        }
    }));
}, _FileSystemDB_unserializeConstructor = function _FileSystemDB_unserializeConstructor(value, constructor) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            let data;
            switch (constructor) {
                case 'ArrayBuffer' || 'TypedArray' || 'DataView' || 'Blob':
                    data = base64ToArrayBuffer(value);
                    break;
                case 'Array' || 'Object' || 'Map' || 'Set':
                    data = value;
                    break;
                default:
                    data = value;
            }
            return data;
        }
        catch (e) {
            reject(e);
        }
    }));
}, _FileSystemDB_serializeKey = function _FileSystemDB_serializeKey(key) {
    return (key.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, ''));
};
/**
 * Augments IndexedDB to be used as a KV to easily
 * replace localStorage for larger and more complex datasets
 *
 * @class
 * @constructor
 * @public
 */
class IndexedKV {
    constructor(options) {
        _IndexedKV_instances.add(this);
        this.events = new MessageBus();
        this.options = {
            db: 'MyDB', table: 'default', onReady: null
        };
        this.options = Object.assign(this.options, options);
        if (typeof this.options.onReady === 'function') {
            this.events.subscribe(`ready`, (e) => {
                this.options.onReady(e);
            });
        }
        // if (!process.browser) {
        //   this.indexedDB = global.indexedDB;
        // } else {
        if (!window.indexedDB) {
            console.error('Your browser doesn\'t support a stable version of IndexedDB.');
            return;
        }
        this.indexedDB = window.indexedDB;
        // }
        const openReq = this.indexedDB.open(this.options.db);
        openReq.onerror = (event) => {
            console.error(event);
        };
        openReq.onsuccess = (event) => {
            this.db = event.target.result;
            this.events.publish('ready');
        };
        this.indexedDB.onerror = (event) => {
            console.error('Database error: ' + event.target.errorCode);
        };
        openReq.onupgradeneeded = (event) => {
            this.db = event.target.result;
            this.db.createObjectStore(this.options.table, { keyPath: 'key' });
            __classPrivateFieldGet(this, _IndexedKV_instances, "m", _IndexedKV_useDatabase).call(this);
            this.events.publish('ready');
        };
    }
    openCursor(match, callback) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.options.table], 'readonly');
            const objectStore = transaction.objectStore(this.options.table);
            const request = objectStore.openCursor(null, 'next');
            request.onsuccess = function (event) {
                resolve(event.target.result);
                const cursor = event.target.result;
                if (cursor) {
                    const regex = new RegExp(`^${match}`);
                    if (cursor.key.match(regex)) {
                        callback(cursor.value.value);
                    }
                    cursor.continue();
                }
                else {
                    resolve();
                }
            };
            request.onerror = function (event) {
                reject(event);
            };
        });
    }
    ;
    ;
    // Set item will insert or replace
    setItem(key, value) {
        return new Promise((resolve, reject) => {
            const objectStore = this.db.transaction([this.options.table], 'readwrite').objectStore(this.options.table);
            const request = objectStore.get(key);
            request.onerror = (event) => {
                reject(event);
            };
            request.onsuccess = (event) => {
                var _a;
                const data = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.result;
                if (data === null || data === void 0 ? void 0 : data.value) {
                    data.value = value;
                    const requestUpdate = objectStore.put(data);
                    requestUpdate.onerror = (event) => {
                        reject(event);
                    };
                    requestUpdate.onsuccess = (event) => {
                        const data = event.target.result;
                        resolve(data.value);
                    };
                }
                else {
                    const requestAdd = objectStore.add({ key: key, value: value });
                    requestAdd.onsuccess = (event) => {
                        resolve(event.target.result);
                    };
                    requestAdd.onerror = (event) => {
                        reject(event);
                    };
                }
            };
        });
    }
    ;
    //Add item but not replace
    add(key, value) {
        return new Promise((resolve, reject) => {
            const objectStore = this.db.transaction([this.options.table], 'readwrite').objectStore(this.options.table);
            const request = objectStore.get(key);
            request.onerror = (event) => {
                reject(event);
            };
            request.onsuccess = (event) => {
                var _a;
                const data = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.result;
                if (data === null || data === void 0 ? void 0 : data.value) {
                    resolve(data.value);
                }
                else {
                    const requestAdd = objectStore.add({ key: key, value: value });
                    requestAdd.onsuccess = (event) => {
                        resolve(event.target.result);
                    };
                    requestAdd.onerror = (event) => {
                        reject(event);
                    };
                }
            };
        });
    }
    ;
    getItem(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.options.table]);
            const objectStore = transaction.objectStore(this.options.table);
            const request = objectStore.get(key);
            request.onerror = (event) => {
                reject(event);
            };
            request.onsuccess = (event) => {
                var _a;
                const data = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.result;
                if (data === null || data === void 0 ? void 0 : data.value) {
                    resolve(data.value);
                }
                else {
                    resolve(null);
                }
            };
        });
    }
    ;
    removeItem(key) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.options.table], 'readwrite')
                .objectStore(this.options.table)
                .delete(key);
            request.onsuccess = (event) => {
                resolve();
            };
            request.onerror = (event) => {
                reject(event);
            };
        });
    }
    ;
}
_IndexedKV_instances = new WeakSet(), _IndexedKV_useDatabase = function _IndexedKV_useDatabase() {
    this.db.onversionchange = (event) => {
        this.db.close();
        console.info('A new version of this page is ready. Please reload or close this tab!');
    };
};
// if (!process.browser) {
//   global.localStorage = new KV({db: 'localStorage', table: 'items'});
// }
/**
 * QueueItem class
 *
 * @class
 * @constructor
 * @public
 */
class QueueItem {
    constructor(body, action) {
        this.timestamp = Date.now();
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.action = action;
                this.body = body;
                this._id = arrayBufferToBase64(yield crypto.subtle
                    .digest('SHA-256', new TextEncoder().encode(JSON.stringify(body))));
                resolve(this);
            }
            catch (e) {
                reject(e.message);
            }
        }));
    }
}
/**
 * Queue Class
 *
 * @class
 * @constructor
 * @public
 */
class Queue {
    // Needs to run from the
    constructor(options) {
        this.lastProcessed = Date.now();
        this.events = new MessageBus();
        this.options = {
            name: 'queue_default', processor: false
        };
        this._memoryQueue = [];
        this.ready = false;
        this.init = () => {
            this.ready = true;
            this.queueReady();
        };
        this.queueReady = () => __awaiter(this, void 0, void 0, function* () {
            this.processQueue();
        });
        this.ws = (options) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    this.wsOptions = {
                        url: options.url + options._id + '/websocket', onOpen: (event) => __awaiter(this, void 0, void 0, function* () {
                            this.init = { name: options.init.name };
                            yield this.currentWS.currentWebSocket.send(JSON.stringify(this.init));
                        })
                    };
                    this.currentWS = new ManagedWS(this.wsOptions);
                    const cachedWs = (yield this.cacheDb.getItem(`queue_ws_${options._id}`)) || null;
                    if (!cachedWs) {
                        yield this.cacheDb.add(`queue_ws_${this.wsOptions._id}`, options);
                    }
                    resolve(this.currentWS);
                }
                catch (e) {
                    reject(e);
                }
            }));
        };
        this.setLastProcessed = () => {
            this.lastProcessed = Date.now();
        };
        this.wsSend = (_id, message, socket) => {
            socket.send(JSON.stringify(message)).then(() => __awaiter(this, void 0, void 0, function* () {
                yield this.remove(_id);
                this.setLastProcessed();
            })).catch(() => {
                console.info('Your client is offline, your message will be sent when you reconnect');
                if (typeof this.onOffline === 'function') {
                    this.events.publish('offline');
                    this.onOffline(message);
                    this.setLastProcessed();
                }
            });
        };
        this.wsCallback = (_id, ws, message, ms) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (ms) {
                    while (Date.now() <= this.lastProcessed + ms) {
                        yield sleep(ms);
                    }
                }
                try {
                    if (!this.currentWS) {
                        const options = (yield this.cacheDb.getItem(`queue_ws_${ws._id}`)) || false;
                        if (options) {
                            this.ws(options).then((socket) => {
                                this.wsSend(_id, message, socket);
                            });
                        }
                        else {
                            this.ws(ws).then((socket) => {
                                this.wsSend(_id, message, socket);
                            });
                        }
                    }
                    else {
                        if (this.currentWS.readyState !== 1) {
                            return;
                        }
                        this.wsSend(_id, message, this.currentWS);
                    }
                }
                catch (e) {
                    console.error(e);
                    reject(e);
                }
            }));
        };
        this.add = (args, action) => __awaiter(this, void 0, void 0, function* () {
            if (!this.ready) {
                this._memoryQueue.push(yield new QueueItem(args, action));
                return;
            }
            const item = yield new QueueItem(args, action);
            yield this.cacheDb.add(`queued_${item._id}`, item);
            this.processQueue();
        });
        this.remove = (_id) => __awaiter(this, void 0, void 0, function* () {
            return yield this.cacheDb.removeItem(`queued_${_id}`);
        });
        this.processQueue = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.ready || !this.options.processor) {
                return;
            }
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield this.cacheDb.openCursor('queued_', (item) => __awaiter(this, void 0, void 0, function* () {
                    if (item.action === 'wsCallback') {
                        return yield this.wsCallback(item._id, item.body.ws, item.body.message, 250);
                    }
                    else {
                        try {
                            item.action();
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }));
            }), 2000);
        });
        this.options = Object.assign(this.options, options);
        this.cacheDb = new KV({ db: 'offline_queue', table: 'items', onReady: this.init });
    }
}
/**
 * Constructor expects an object with the names of the matching servers, for example
 * (this shows the miniflare local dev config):
 * ::
 *
 *     {
 *       channel_server: 'http://127.0.0.1:4001',
 *       channel_ws: 'ws://127.0.0.1:4001',
 *       storage_server: 'http://127.0.0.1:4000'
 *     }
 *
 */
class Snackabra {
    /**
     */
    constructor(args) {
        _Snackabra_instances.add(this);
        this.MessageBus = MessageBus;
        // PSM: i think these two are on a per-channel object basis?
        _Snackabra_channel.set(this, Channel);
        _Snackabra_storage.set(this, StorageApi);
        _Snackabra_identity.set(this, Identity);
        _Snackabra_queue.set(this, Queue);
        this.options = {
            channel_server: null, channel_ws: null, storage_server: null
        };
        _sb_assert(args, 'Snackabra(args) - missing args');
        try {
            this.options = Object.assign(this.options, {
                channel_server: args.channel_server,
                channel_ws: args.channel_ws,
                storage_server: args.storage_server
            });
        }
        catch (e) {
            _sb_exception('Snackabra.constructor()', e);
        }
    }
    setIdentity(keys) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                __classPrivateFieldSet(this, _Snackabra_identity, yield new Identity(keys), "f");
                resolve(__classPrivateFieldGet(this, _Snackabra_identity, "f"));
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    createIdentity() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                __classPrivateFieldSet(this, _Snackabra_identity, yield new Identity(), "f");
                resolve(__classPrivateFieldGet(this, _Snackabra_identity, "f"));
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    /**
     * Connects to :term:`Channel Name` on this SB config.
     * Returns a (promise to a) channel object
     */
    connect(channel_id) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const _self = this;
                if (!__classPrivateFieldGet(_self, _Snackabra_identity, "f").exportable_pubKey) {
                    // TODO: does it?
                    reject(new Error('setIdentity must be called before connecting'));
                }
                __classPrivateFieldSet(_self, _Snackabra_queue, new Queue({ processor: true }), "f");
                _sb_resolve(channel_id).then((channel_id) => {
                    const c = new Channel(_self.options.channel_server, _self.options.channel_ws, __classPrivateFieldGet(_self, _Snackabra_identity, "f"), channel_id);
                    c.then((c) => {
                        __classPrivateFieldSet(_self, _Snackabra_channel, c, "f");
                        __classPrivateFieldSet(_self, _Snackabra_storage, new StorageApi(_self.options.storage_server, __classPrivateFieldGet(_self, _Snackabra_channel, "f"), __classPrivateFieldGet(_self, _Snackabra_identity, "f")), "f");
                        resolve(_self);
                    });
                });
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    /**
     * Creates a channel. Currently uses trivial authentication.
     * Returns the :term:`Channel Name`.
     * (TODO: token-based approval of storage spend)
     */
    create(serverSecret) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ownerKeyPair = yield crypto.subtle.generateKey({
                    name: 'ECDH',
                    namedCurve: 'P-384'
                }, true, ['deriveKey']);
                const exportable_privateKey = yield crypto.subtle.exportKey('jwk', ownerKeyPair.privateKey);
                const exportable_pubKey = yield crypto.subtle.exportKey('jwk', ownerKeyPair.publicKey);
                const channelId = yield __classPrivateFieldGet(this, _Snackabra_instances, "m", _Snackabra_generateRoomId).call(this, exportable_pubKey.x, exportable_pubKey.y);
                const encryptionKey = yield crypto.subtle.generateKey({
                    name: 'AES-GCM',
                    length: 256
                }, true, ['encrypt', 'decrypt']);
                const exportable_encryptionKey = yield crypto.subtle.exportKey('jwk', encryptionKey);
                const signKeyPair = yield crypto.subtle.generateKey({
                    name: 'ECDH', namedCurve: 'P-384'
                }, true, ['deriveKey']);
                const exportable_signKey = yield crypto.subtle.exportKey('jwk', signKeyPair.privateKey);
                const channelData = {
                    roomId: channelId,
                    ownerKey: JSON.stringify(exportable_pubKey),
                    encryptionKey: JSON.stringify(exportable_encryptionKey),
                    signKey: JSON.stringify(exportable_signKey),
                    SERVER_SECRET: serverSecret
                };
                const data = new TextEncoder().encode(JSON.stringify(channelData));
                let resp = yield fetch(this.options.channel_server + '/api/room/' + channelId + '/uploadRoom', {
                    method: 'POST',
                    body: data
                });
                resp = yield resp.json();
                if (resp.hasOwnProperty('success')) {
                    yield this.connect(channelId);
                    localStorage.setItem(channelId, JSON.stringify(exportable_privateKey));
                    resolve(channelId);
                }
                else {
                    reject(new Error(JSON.stringify(resp)));
                }
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    get channel() {
        return __classPrivateFieldGet(this, _Snackabra_channel, "f");
    }
    get storage() {
        return __classPrivateFieldGet(this, _Snackabra_storage, "f");
    }
    get crypto() {
        return SB_Crypto;
    }
    get identity() {
        return __classPrivateFieldGet(this, _Snackabra_identity, "f");
    }
    sendMessage(message) {
        this.channel.socket.send(message);
    }
    sendFile(file) {
        this.storage.saveFile(file);
    }
}
_Snackabra_channel = new WeakMap(), _Snackabra_storage = new WeakMap(), _Snackabra_identity = new WeakMap(), _Snackabra_queue = new WeakMap(), _Snackabra_instances = new WeakSet(), _Snackabra_generateRoomId = function _Snackabra_generateRoomId(x, y) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const xBytes = base64ToArrayBuffer(decodeB64Url(x));
            const yBytes = base64ToArrayBuffer(decodeB64Url(y));
            const channelBytes = _appendBuffer(xBytes, yBytes);
            const channelBytesHash = yield crypto.subtle.digest('SHA-384', channelBytes);
            resolve(encodeB64Url(arrayBufferToBase64(channelBytesHash)));
        }
        catch (e) {
            reject(e);
        }
    }));
};
export { Snackabra, SBMessage, SBFile, SB_libraryVersion, ab2str, str2ab, base64ToArrayBuffer, arrayBufferToBase64, getRandomValues };
