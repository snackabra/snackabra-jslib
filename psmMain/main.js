/*
  COMPILE WITH (for now):
  
  tsc -lib dom,es5,es6,es2021 -t es6 --pretty false --strict ./main.ts
 xc
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
var _MessageBus_instances, _MessageBus_select, _SBFile_instances, _SBFile_asImage, _SBFile_getFileData, _SBFile_padImage, _SBFile_restrictPhoto, _SBFile_scaleCanvas, _SBFile_generateImageHash, _SBFile_readPhoto, _WS_Protocol_options, _Channel_keys, _Channel_api, _Channel_socket, _ChannelSocket_channel, _ChannelSocket_identity, _ChannelSocket_payload, _ChannelSocket_queue, _StorageApi_instances, _StorageApi_channel, _StorageApi_identity, _StorageApi_getFileKey, _StorageApi_unpadData, _ChannelApi_identity, _ChannelApi_channel, _ChannelApi_channelApi, _ChannelApi_channelServer, _ChannelApi_payload, _IndexedKV_instances, _IndexedKV_useDatabase, _Snackabra_instances, _Snackabra_channel, _Snackabra_storage, _Snackabra_identity, _Snackabra_generateRoomId;
/* Zen Master: "um" */
function SB_libraryVersion() {
    throw new Error('THIS IS NEITHER BROWSER NOR NODE THIS IS SPARTA!');
}
/**
 * SB simple events (mesage bus) class
 */
class MessageBus {
    constructor() {
        _MessageBus_instances.add(this);
        this.bus = {};
    }
    /**
     * Subscribe. 'event' is a string, special case '*' means everything
     *  (in which case the handler is also given the message)
     */
    subscribe(event, handler) {
        __classPrivateFieldGet(this, _MessageBus_instances, "m", _MessageBus_select).call(this, event).push(handler);
    }
    /**
     * Unsubscribe
     */
    unsubscribe(event, handler) {
        let i = -1;
        if (this.bus[event]) {
            if ((i = this.bus[event].findLastIndex((e) => e == handler)) != -1) {
                this.bus[event].splice(i, 1);
            }
            else {
                console.info(`fyi: asked to remove a handler but it's not there`);
            }
        }
        else {
            console.info(`fyi: asked to remove a handler but the event is not there`);
        }
    }
    /**
     * Publish
     */
    publish(event, ...args) {
        for (const handler of __classPrivateFieldGet(this, _MessageBus_instances, "m", _MessageBus_select).call(this, '*')) {
            handler(event, ...args);
        }
        for (const handler of __classPrivateFieldGet(this, _MessageBus_instances, "m", _MessageBus_select).call(this, event)) {
            handler(...args);
        }
    }
}
_MessageBus_instances = new WeakSet(), _MessageBus_select = function _MessageBus_select(event) {
    return this.bus[event] || (this.bus[event] = []);
};
/*
  For possible future use with cleaner identifiers:

  * #uniqueID() {
    let i = 0;
    while (true) {
      i += 1;
      yield i;
    }
  }
*/
/* where do we use sleep()?  we should probably use setInterval() instead */
// /*
//   Sleep for ms milliseconds
//   */
// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
/**
 * @fileoverview Main file for snackabra javascript utilities.
 *               See https://snackabra.io for details.
 * @package
 */
/* TODO - list of modules that main.js can now fully support:
          (note: some MI-internal references)
   m042/src/scripts/components/FormSubmission.js
*/
// the below general exception handler can be improved so us to
// retain the error stack, per:
// https://stackoverflow.com/a/42755876
// class RethrownError extends Error {
//   constructor(message, error){
//     super(message)
//     this.name = this.constructor.name
//     if (!error) throw new Error('RethrownError requires a message and error')
//     this.original_error = error
//     this.stack_before_rethrow = this.stack
//     const message_lines =  (this.message.match(/\n/g)||[]).length + 1
//     this.stack = this.stack.split('\n').slice(0, message_lines+1).join('\n') + '\n' +
//                  error.stack
//   }
// }
// throw new RethrownError(`Oh no a "${error.message}" error`, error)
function _sb_exception(loc, msg) {
    const m = '<< SB lib error (' + loc + ': ' + msg + ') >>';
    // for now disabling this to keep node testing less noisy
    // console.error(m);
    throw new Error(m);
}
// internal - general handling of paramaters that might be promises
// (basically the "anti" of resolve, if it's *not* a promise then
// it becomes one
function _sb_resolve(val) {
    if (val.then) {
        // it's already a promise
        // console.log('it is a promise')
        return val;
    }
    else {
        // console.log('it was not a promise')
        return new Promise((resolve) => resolve(val));
    }
}
// internal - handle assertions
function _sb_assert(val, msg) {
    if (!(val)) {
        const m = `<< SB assertion error: ${msg} >>`;
        throw new Error(m);
    }
}
/* ****************************************************************
 *  These are wrappers to handle both browser and node targets
 *  with the same code. The 'process.browser' value is replaced
 *  by rollup and this whole library is then tree-shaken so
 *  that only either the node-specific or browser-specific code
 *  is retained, into 'index.mjs' and 'browser.mjs' respectively.
 * ****************************************************************/
/**
 * Fills buffer with random data
 */
function getRandomValues(buffer) {
    return crypto.getRandomValues(buffer);
}
// Strict b64 check:
// const b64_regex = new RegExp('^(?:[A-Za-z0-9+/_\-]{4})*(?:[A-Za-z0-9+/_\-]{2}==|[A-Za-z0-9+/_\-]{3}=)?$')
// But we will go (very) lenient:
const b64_regex = /^([A-Za-z0-9+/_\-=]*)$/;
/**
 * Returns 'true' if (and only if) string is well-formed base64.
 * Works same on browsers and nodejs.
 */
function _assertBase64(base64) {
    // return (b64_regex.exec(base64)?.[0] === base64);
    const z = b64_regex.exec(base64);
    if (z)
        return (z[0] === base64);
    else
        return false;
}
/**
 * Standardized 'str2ab()' function, string to array buffer.
 * This assumes on byte per character.
 *
 * @param {string} string
 * @return {Uint8Array} buffer
 */
function str2ab(string) {
    return new TextEncoder().encode(string);
}
/**
 * Standardized 'ab2str()' function, array buffer to string.
 * This assumes one byte per character.
 *
 * @return {Uint8Array} Uint8Array
 *
 * @param buffer
 */
function ab2str(buffer) {
    return new TextDecoder('utf-8').decode(buffer);
}
/**
 * From:
 * https://github.com/qwtel/base64-encoding/blob/master/base64-js.ts
 */
const b64lookup = [];
const urlLookup = [];
const revLookup = [];
const CODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const CODE_B64 = CODE + '+/';
const CODE_URL = CODE + '-_';
const PAD = '=';
const MAX_CHUNK_LENGTH = 16383; // must be multiple of 3
for (let i = 0, len = CODE_B64.length; i < len; ++i) {
    b64lookup[i] = CODE_B64[i];
    urlLookup[i] = CODE_URL[i];
    revLookup[CODE_B64.charCodeAt(i)] = i;
}
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;
function getLens(b64) {
    const len = b64.length;
    let validLen = b64.indexOf(PAD);
    if (validLen === -1)
        validLen = len;
    const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
    return [validLen, placeHoldersLen];
}
function _byteLength(validLen, placeHoldersLen) {
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen;
}
/**
 * Standardized 'atob()' function, e.g. takes the a Base64 encoded
 * input and decodes it. Note: always returns Uint8Array.
 * Accepts both regular Base64 and the URL-friendly variant,
 * where `+` => `-`, `/` => `_`, and the padding character is omitted.
 *
 * @param {str} base64 string in either regular or URL-friendly representation.
 * @return {Uint8Array} returns decoded binary result
 */
function base64ToArrayBuffer(str) {
    if (!_assertBase64(str))
        throw new Error('invalid character');
    let tmp;
    switch (str.length % 4) {
        case 2:
            str += '==';
            break;
        case 3:
            str += '=';
            break;
    }
    const [validLen, placeHoldersLen] = getLens(str);
    const arr = new Uint8Array(_byteLength(validLen, placeHoldersLen));
    let curByte = 0;
    const len = placeHoldersLen > 0 ? validLen - 4 : validLen;
    let i;
    for (i = 0; i < len; i += 4) {
        const r0 = revLookup[str.charCodeAt(i)];
        const r1 = revLookup[str.charCodeAt(i + 1)];
        const r2 = revLookup[str.charCodeAt(i + 2)];
        const r3 = revLookup[str.charCodeAt(i + 3)];
        tmp = (r0 << 18) | (r1 << 12) | (r2 << 6) | (r3);
        arr[curByte++] = (tmp >> 16) & 0xff;
        arr[curByte++] = (tmp >> 8) & 0xff;
        arr[curByte++] = (tmp) & 0xff;
    }
    if (placeHoldersLen === 2) {
        const r0 = revLookup[str.charCodeAt(i)];
        const r1 = revLookup[str.charCodeAt(i + 1)];
        tmp = (r0 << 2) | (r1 >> 4);
        arr[curByte++] = tmp & 0xff;
    }
    if (placeHoldersLen === 1) {
        const r0 = revLookup[str.charCodeAt(i)];
        const r1 = revLookup[str.charCodeAt(i + 1)];
        const r2 = revLookup[str.charCodeAt(i + 2)];
        tmp = (r0 << 10) | (r1 << 4) | (r2 >> 2);
        arr[curByte++] = (tmp >> 8) & 0xff;
        arr[curByte++] = tmp & 0xff;
    }
    return arr;
}
function tripletToBase64(lookup, num) {
    return (lookup[num >> 18 & 0x3f] +
        lookup[num >> 12 & 0x3f] +
        lookup[num >> 6 & 0x3f] +
        lookup[num & 0x3f]);
}
function encodeChunk(lookup, view, start, end) {
    let tmp;
    const output = new Array((end - start) / 3);
    for (let i = start, j = 0; i < end; i += 3, j++) {
        tmp =
            ((view.getUint8(i) << 16) & 0xff0000) +
                ((view.getUint8(i + 1) << 8) & 0x00ff00) +
                (view.getUint8(i + 2) & 0x0000ff);
        output[j] = tripletToBase64(lookup, tmp);
    }
    return output.join('');
}
// /* ALTERNATIVE solution below, just needs some typescripting */
//
// const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
// const b64chs = Array.prototype.slice.call(b64ch);
// const b64tab = ((a) => {
//   const tab = {};
//   a.forEach((c, i) => tab[c] = i);
//   return tab;
// })(b64chs);
//
// function base64ToArrayBuffer(asc) {
//   asc = asc.replace(/\s+/g, ''); // collapse any whitespace
//   asc += '=='.slice(2 - (asc.length & 3)); // make it tolerant of padding
//   if (!_assertBase64(asc)) throw new Error('Invalid Character');
//   if (process.browser) {
//     // we could use window.atob but chose not to
//     let u24, bin = '', r1, r2;
//     for (let i = 0; i < asc.length;) {
//       u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
//       bin += r1 === 64 ? _fromCC(u24 >> 16 & 255) : r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255) : _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
//     }
//     return str2ab(bin);
//   } else {
//     return _U8Afrom(Buffer.from(asc, 'base64'));
//   }
// }
// const bs2dv = (bs: BufferSource) => bs instanceof ArrayBuffer
//   ? new DataView(bs)
//   : new DataView(bs.buffer, bs.byteOffset, bs.byteLength)
/**
 * Standardized 'btoa()'-like function, e.g., takes a binary string
 * ('b') and returns a Base64 encoded version ('a' used to be short
 * for 'ascii').
 *
 * @param {bufferSource} ArrayBuffer buffer
 * @return {string} base64 string
 */
function arrayBufferToBase64(buffer) {
    // const view = bs2dv(bufferSource)
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const len = view.byteLength;
    const extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
    const len2 = len - extraBytes;
    const parts = new Array(Math.floor(len2 / MAX_CHUNK_LENGTH) + Math.sign(extraBytes));
    const lookup = urlLookup;
    const pad = '';
    let j = 0;
    for (let i = 0; i < len2; i += MAX_CHUNK_LENGTH) {
        parts[j++] = encodeChunk(lookup, view, i, (i + MAX_CHUNK_LENGTH) > len2 ? len2 : (i + MAX_CHUNK_LENGTH));
    }
    if (extraBytes === 1) {
        const tmp = view.getUint8(len - 1);
        parts[j] = (lookup[tmp >> 2] +
            lookup[(tmp << 4) & 0x3f] +
            pad + pad);
    }
    else if (extraBytes === 2) {
        const tmp = (view.getUint8(len - 2) << 8) + view.getUint8(len - 1);
        parts[j] = (lookup[tmp >> 10] +
            lookup[(tmp >> 4) & 0x3f] +
            lookup[(tmp << 2) & 0x3f] +
            pad);
    }
    return parts.join('');
}
// /* ALTERNATIVE implementation to above (not yet typescripted) */
// const _fromCC = String.fromCharCode.bind(String);
// const _U8Afrom = (it, fn = (x) => x) => new Uint8Array(Array.prototype.slice.call(it, 0).map(fn));
// function arrayBufferToBase64(buffer) {
//   const u8a = new Uint8Array(buffer);
//   if (process.browser) {
//     // we could use window.btoa but chose not to
//     let u32, c0, c1, c2, asc = '';
//     const maxargs = 0x1000;
//     const strs = [];
//     for (let i = 0, l = u8a.length; i < l; i += maxargs) strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
//     const bin = strs.join('');
//     const pad = bin.length % 3;
//     for (let i = 0; i < bin.length;) {
//       if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255) throw new Error('Invalid Character');
//       u32 = (c0 << 16) | (c1 << 8) | c2;
//       asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
//     }
//     return pad ? asc.slice(0, pad - 3) + '==='.substring(pad) : asc;
//   } else {
//     // nodejs, so has Buffer, just use that
//     return Buffer.from(u8a).toString('base64');
//   }
// }
function _appendBuffer(buffer1, buffer2) {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}
/* ****************************************************************
 *  @psm TODO functions - look for duplicates
 * ****************************************************************/
/*
function verifyCookie(request, env) {
  // room.mjs uses without env, storage with env
}
*/
// the publicKeyPEM paramater below needs to look like this
// if not given, will use this default (MI/384 has private key)
const defaultPublicKeyPEM = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtVedzwPq7OIl84xx9ruV
TAkv+sUPUYeQJ3PtFOJkBSrMyGPErVxjXQQ6nvb+OevQ2t7EhimyQ3bnP7PdeAU2
mWQX6V8LfhJj0ox8Envtw9DF7nEED5aLwnimTjox906j7itXO2xDdJCRuAfpar3u
Tj3d0EAKWFXTBHrorKI0pHCg1opIRsqNjpVnetZn1SweCtArE7YymNRQmoi8XWzj
yCt41fGFoFcmVeE87hiq41NJkE0iMfrmf6QqE91Fp1BSSTD75KEbKPXepS/jl3nV
VFe4tWrHypcT+Uk7I2UBqHnR+AnODVrSxZMzoVnXoYbhDAdReTQ81MrSQ+LW7yZV
rTxa5uYVPIRB6l58dpBEhIGcvEz376fvEwdhEqw9iXm7FchbqX3FQpwDVKvguj+w
jIaV60/hyBaRPO2oD9IhByvL3F+Gq+iwQRXbEgvI8QvkJ1w/WcelytljcwUoYbC5
7VS7EvnoNvMQT+r5RJfoPVPbwsCOFAQCVnzyOPAMZyUn69ycK+rONvrVxkM+c8Q2
8w7do2MDeRWJRf4Va0XceXsN+YcK7g9bqBWrBYJIWzeRiAQ3R6kyaxxbdEhyY3Hl
OlY876IbVmwlWAQ82l9r7ECjBL2nGMjDFm5Lv8TXKC5NHWHwY1b2vfvl6cyGtG1I
OTJj8TMRI6y3Omop3kIfpgUCAwEAAQ==
-----END PUBLIC KEY-----`;
/**
 * Import a PEM encoded RSA public key, to use for RSA-OAEP
 * encryption.  Takes a string containing the PEM encoded key, and
 * returns a Promise that will resolve to a CryptoKey representing
 * the public key.
 *
 * @param {pem} RSA public key, string, PEM format
 * @return {cryptoKey} RSA-OAEP key
 *
 */
function importPublicKey(pem) {
    if (typeof pem == 'undefined')
        pem = defaultPublicKeyPEM;
    // fetch the part of the PEM string between header and footer
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const start = pem.indexOf(pemHeader);
    const end = pem.indexOf(pemFooter);
    if ((start < 0) || (end < 0))
        _sb_exception('importPublicKey()', 'fail to find BEGIN and/or END string in RSA (PEM) key');
    const pemContents = pem.slice(start + pemHeader.length, end);
    // const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    // console.log(pemContents)
    const binaryDer = base64ToArrayBuffer(pemContents);
    return crypto.subtle.importKey('spki', binaryDer, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
}
/**
 * Returns random number
 *
 * @return {int} integer 0..255
 *
 */
function simpleRand256() {
    return crypto.getRandomValues(new Uint8Array(1))[0];
}
const base32mi = '0123456789abcdefyhEjkLmNHpFrRTUW';
/**
 * Returns a random string in requested encoding
 *
 * @param {n} number of characters
 * @param {code} encoding, supported types: 'base32mi'
 * @return {string} random string
 *
 * base32mi: ``0123456789abcdefyhEjkLmNHpFrRTUW``
 */
function simpleRandomString(n, code) {
    if (code == 'base32mi') {
        // yeah, of course we need to add base64 etc
        const z = crypto.getRandomValues(new Uint8Array(n));
        let r = '';
        for (let i = 0; i < n; i++)
            r += base32mi[z[i] & 31];
        return r;
    }
    _sb_exception('simpleRandomString', 'code ' + code + ' not supported');
    return '';
}
/**
 * Disambiguates strings that are known to be 'base32mi' type
 *
 * ::
 *
 *     'base32mi': '0123456789abcdefyhEjkLmNHpFrRTUW'
 *
 * This is the base32mi disambiguation table ::
 *
 *     [OoQD] -> '0'
 *     [lIiJ] -> '1'
 *     [Zz] -> '2'
 *     [A] -> '4'
 *     [Ss] -> '5'
 *     [G] -> '6'
 *     [t] -> '7'
 *     [B] -> '8'
 *     [gq] -> '9'
 *     [C] -> 'c'
 *     [Y] -> 'y'
 *     [KxX] -> 'k'
 *     [M] -> 'm'
 *     [n] -> 'N'
 *     [P] -> 'p'
 *     [uvV] -> 'U'
 *     [w] -> 'W'
 *
 * Another way to think of it is that this, becomes this ('.' means no change): ::
 *
 *     0123456789abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ
 *     ................9.1..1.N0.9.57UUk.248c0EF6.11kLm.0p0.5..Uky2
 *
 */
function cleanBase32mi(s) {
    // this of course is not the most efficient
    return s.replace(/[OoQD]/g, '0').replace(/[lIiJ]/g, '1').replace(/[Zz]/g, '2').replace(/[A]/g, '4').replace(/[Ss]/g, '5').replace(/[G]/g, '6').replace(/[t]/g, '7').replace(/[B]/g, '8').replace(/[gq]/g, '9').replace(/[C]/g, 'c').replace(/[Y]/g, 'y').replace(/[KxX]/g, 'k').replace(/[M]/g, 'm').replace(/[n]/g, 'N').replace(/[P]/g, 'p').replace(/[uvV]/g, 'U').replace(/[w]/g, 'w');
}
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
function packageEncryptDict(dict, publicKeyPEM, callback) {
    const clearDataArrayBufferView = str2ab(JSON.stringify(dict));
    const aesAlgorithmKeyGen = { name: 'AES-GCM', length: 256 };
    const aesAlgorithmEncrypt = { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(16)) };
    if (!publicKeyPEM)
        publicKeyPEM = defaultPublicKeyPEM;
    // Create a key generator to produce a one-time-use AES key to encrypt some data
    crypto.subtle.generateKey(aesAlgorithmKeyGen, true, ['encrypt']).then((aesKey) => {
        // we are exporting the symmetric AES key so we can encrypt it using pub key
        crypto.subtle.exportKey('raw', aesKey).then((theKey) => {
            const rsaAlgorithmEncrypt = { name: 'RSA-OAEP' };
            importPublicKey(publicKeyPEM).then((publicKey) => {
                return crypto.subtle.encrypt(rsaAlgorithmEncrypt, publicKey, theKey);
            }).then((buf) => {
                const encryptedAesKey = arrayBufferToBase64(buf);
                return encryptedAesKey;
            }).then((encAesKey) => {
                return Promise.all([crypto.subtle.encrypt(aesAlgorithmEncrypt, aesKey, clearDataArrayBufferView), encAesKey]);
            }).then((arr) => {
                // arr[0] is the encrypted dict in raw format, arr[1] is the aes key encrypted with rsa public key
                const encryptedData = arrayBufferToBase64(arr[0]);
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
function partition(str, n) {
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
    // psm: you can't have a return type in TS if the function
    //      might throw an exception
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
            let str2 = str;
            while (str2 != (s3 = s2, s2 = str2, str2 = (_a = str2 === null || str2 === void 0 ? void 0 : str2.match(/^(['"])(.*)\1$/m)) === null || _a === void 0 ? void 0 : _a[2]))
                return JSON.parse(`'${s3}'`);
        }
        catch (_b) {
            // let's try one more thing
            try {
                return JSON.parse(str.slice(1, -1));
            }
            catch (_d) {
                // i am beginning to dislike TS .. ugh no simple way to get error message
                // see: https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
                throw new Error(`JSON.parse() error at ${loc} (tried eval and slice)\nString was: ${str}`);
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
            if (data.key) {
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
        const metadata = {};
        metadata['version'] = '002';
        let keyCount = 0;
        let startIndex = 0;
        for (const key in data) {
            if (data.key) {
                keyCount++;
                metadata[keyCount.toString()] = { name: key, start: startIndex, size: data[key].byteLength };
                startIndex += data[key].byteLength;
            }
        }
        const encoder = new TextEncoder();
        const metadataBuffer = encoder.encode(JSON.stringify(metadata));
        const metadataSize = new Uint32Array([metadataBuffer.byteLength]);
        // psm: changed to Uint8 .. hope that doesn't break things?
        let payload = _appendBuffer(new Uint8Array(metadataSize.buffer), new Uint8Array(metadataBuffer));
        for (const key in data) {
            if (data.key) {
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
        if (!_metadata.version) {
            _metadata['version'] = '001';
        }
        console.info(_metadata['version']);
        switch (_metadata['version']) {
            case '001': {
                return extractPayloadV1(payload);
            }
            case '002': {
                const data = [];
                for (let i = 1; i < Object.keys(_metadata).length; i++) {
                    const _index = i.toString();
                    if (_metadata._index) {
                        const propertyStartIndex = _metadata[_index]['start'];
                        console.info(propertyStartIndex);
                        const size = _metadata[_index]['size'];
                        const entry = _metadata[_index];
                        data[entry['name']] = payload.slice(startIndex + propertyStartIndex, startIndex + propertyStartIndex + size);
                    }
                }
                return data;
            }
            default: {
                throw new Error('Unsupported payload version (' + _metadata['version'] + ') - fatal');
            }
        }
    }
    catch (e) {
        throw new Error('extractPayload() exception (' + e + ')');
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
// class EventEmitter extends EventTarget {
//   on(type: string, callback: (ev: DocumentEventMap[E]) => any) {
//     this.addEventListener(type, callback);
//   }
//   emit(type: string, data: unknown) {
//     new Event(type, data);
//   }
// }
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
                // ok stuck here ... importKey() is *supposed* to accept 'jwk' but the prototype does not
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
                    name: 'ECDH',
                    public: publicKey
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
                // @psm TODO - Support deriving from PBKDF2 in deriveKey function
                const key = yield crypto.subtle.deriveKey({
                    'name': 'PBKDF2',
                    'salt': _salt,
                    'iterations': 100000,
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
    encrypt(contents, secret_key, outputType = 'string', _iv = null) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (contents === null) {
                    reject(new Error('no contents'));
                }
                const iv = _iv === null ? crypto.getRandomValues(new Uint8Array(12)) : _iv;
                const algorithm = {
                    name: 'AES-GCM',
                    iv: iv
                };
                const key = secret_key;
                let data = contents;
                const encoder = new TextEncoder();
                if (typeof contents === 'string') {
                    data = encoder.encode(contents);
                }
                let encrypted;
                encrypted = yield crypto.subtle.encrypt(algorithm, key, data);
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
                resolve(new TextDecoder().decode(decrypted));
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
    constructor() {
        this.resolve_exportable_pubKey = (() => { throw new Error('uninit prom called'); });
        this.resolve_exportable_privateKey = (() => { throw new Error('uninit prom called'); });
        this.resolve_privateKey = (() => { throw new Error('uninit prom called'); });
        this.exportable_pubKey = new Promise((resolve) => this.resolve_exportable_pubKey = resolve);
        this.exportable_privateKey = new Promise((resolve) => this.resolve_exportable_privateKey = resolve);
        this.privateKey = new Promise((resolve) => this.resolve_privateKey = resolve);
    }
    /**
     * Mint keys
     */
    mintKeys() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                SB_Crypto.generateKeys().then((keyPair) => {
                    crypto.subtle.exportKey('jwk', keyPair.publicKey).then((k) => this.resolve_exportable_pubKey(k));
                    crypto.subtle.exportKey('jwk', keyPair.privateKey).then((k) => this.resolve_exportable_privateKey(k));
                    this.resolve_privateKey(keyPair.privateKey);
                    Promise.all([this.resolve_exportable_pubKey, this.resolve_privateKey]).then(() => resolve(true));
                });
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    /**
     * Mount keys
     */
    mountKeys(key) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.resolve_exportable_privateKey(key);
                this.resolve_exportable_pubKey(SB_Crypto.extractPubKey(key));
                SB_Crypto.importKey('jwk', key, 'ECDH', true, ['deriveKey']).then((k) => {
                    this.resolve_privateKey(k);
                    resolve(true);
                });
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
            const imgId = '', previewId = '', imgKey = '', previewKey = '';
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
    try {
        const reader = new FileReader();
        if (file.size === 0) {
            return null;
        }
        outputType === 'url' ? reader.readAsDataURL(file) : reader.readAsArrayBuffer(file);
        return new Promise((resolve) => {
            reader.onloadend = () => {
                const the_blob = reader.result;
                resolve(the_blob);
            };
        });
    }
    catch (e) {
        console.log(e);
        return null;
    }
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
            reader.onload = (e) => { var _a; return resolve((_a = e.target) === null || _a === void 0 ? void 0 : _a.result); };
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
        _WS_Protocol_options.set(this, {
            url: '', onOpen: null, onMessage: null, onClose: null, onError: null, timeout: 30000
        });
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
                            resolve(true);
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
        __classPrivateFieldSet(this, _WS_Protocol_options, Object.assign(this.options, options), "f");
        this.join();
    }
    /**
     * Get options
     */
    get options() {
        return __classPrivateFieldGet(this, _WS_Protocol_options, "f");
    }
    /**
     * join
     */
    join() {
        return new Promise((resolve, reject) => {
            try {
                this.currentWebSocket = new Websocket(this.options.url);
                this.onError();
                this.onClose();
                this.onOpen();
                this.onMessage();
                resolve(true);
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
        this.currentWebSocket.addEventListener('error', (event) => {
            console.error('WebSocket error, reconnecting:', event);
            if (typeof this.options.onError === 'function') {
                this.options.onError(event);
            }
        });
    }
    /**
     * onClose
     */
    onClose() {
        this.currentWebSocket.addEventListener('close', (event) => {
            console.info('Websocket closed', event);
            if (typeof this.options.onClose === 'function') {
                this.options.onClose(event);
            }
        });
    }
    /**
     * onMessage
     */
    onMessage() {
        this.currentWebSocket.addEventListener('message', (event) => {
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
        this.currentWebSocket.addEventListener('open', (event) => {
            if (typeof this.options.onOpen === 'function') {
                this.options.onOpen(event);
            }
        });
    }
}
_WS_Protocol_options = new WeakMap();
/**
 * Channel
 * @class
 * @constructor
 * @public
 */
class Channel {
    constructor(https, wss, identity) {
        this._id = '';
        this.owner = false;
        this.admin = false;
        this.verifiedGuest = false;
        this.metaData = {};
        _Channel_keys.set(this, void 0);
        _Channel_api.set(this, void 0);
        _Channel_socket.set(this, void 0);
        this.loadKeys = (keys) => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (keys.ownerKey === null) {
                    reject(new Error('Channel does not exist'));
                }
                let _exportable_owner_pubKey = jsonParseWrapper(keys.ownerKey || JSON.stringify({}), 'L1460');
                if (_exportable_owner_pubKey.key) {
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
                const isOwner = SB_Crypto.areKeysSame(_exportable_pubKey, _exportable_owner_pubKey);
                // @psm TODO .. hardcoded i don't know what this does ...
                // if (process.browser) {
                //const isAdmin: boolean = (document.cookie.split('; ').find((row: string) => row.startsWith('token_' +
                // this._id)) !== undefined) || (this.url !== 'https://s_socket.privacy.app' && isOwner);
                const isAdmin = (this.url !== 'https://s_socket.privacy.app' && isOwner);
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
                let _shared_key;
                if (!isOwner) {
                    _shared_key = yield SB_Crypto.deriveKey(_privateKey, _owner_pubKey, 'AES', false, ['encrypt', 'decrypt']);
                }
                let _locked_key, _exportable_locked_key;
                // if (process.browser) {
                _exportable_locked_key = _localStorage.getItem(this._id + '_lockedKey');
                // } else {
                //   _exportable_locked_key = await _localStorage.getItem(this._id + '_lockedKey');
                // }
                if (_exportable_locked_key !== null) {
                    _locked_key = yield SB_Crypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key, 'L1517'), 'AES', false, ['encrypt', 'decrypt']);
                }
                else if (keys.locked_key) {
                    const _string_locked_key = yield SB_Crypto.decrypt(isOwner ? yield SB_Crypto.deriveKey(keys.privateKey, yield SB_Crypto.importKey('jwk', keys.exportable_pubKey, 'ECDH', true, []), 'AES', false, ['decrypt']) : _shared_key, jsonParseWrapper(keys.locked_key, 'L1519'), 'string');
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
        this.url = https;
        this.wss = wss;
        this.identity = identity;
    }
    /**
     * Join channel, channel_id is the :term:`Channel Name`.
     */
    join(channel_id) {
        this._id = channel_id;
        return new Promise((resolve) => {
            if (channel_id === null) {
                return;
            }
            this._id = channel_id;
            __classPrivateFieldSet(this, _Channel_api, new ChannelApi(this.url, this, this.identity), "f");
            __classPrivateFieldSet(this, _Channel_socket, new ChannelSocket(this.wss, this, this.identity), "f");
            __classPrivateFieldGet(this, _Channel_socket, "f").onJoin = (message) => {
                if (message === null || message === void 0 ? void 0 : message.ready) {
                    console.log(message);
                    this.metaData = message;
                    this.loadKeys(message.keys).then(() => {
                        this.socket.isReady();
                        resolve(this);
                    });
                }
            };
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
                __classPrivateFieldGet(this, _ChannelSocket_queue, "f").push(file);
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
                if (message[id].encrypted_contents) {
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
                _localStorage.setItem(__classPrivateFieldGet(this, _ChannelSocket_channel, "f")._id + '_lastSeenMessage', id.slice(__classPrivateFieldGet(this, _ChannelSocket_channel, "f")._id.length));
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
    constructor() {
        _StorageApi_instances.add(this);
        _StorageApi_channel.set(this, void 0);
        _StorageApi_identity.set(this, void 0);
        /* Unused Currently
        migrateStorage() {
      
        }
      
        fetchDataMigration() {
      
        }
         */
    }
    init(server, channel, identity) {
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
                Promise.all([fullStorePromise, previewStorePromise]).then((results) => {
                    results.forEach((controlData) => {
                        __classPrivateFieldGet(this, _StorageApi_channel, "f").socket.sendSbObject(Object.assign(Object.assign({}, controlData), { control: true }));
                    });
                    __classPrivateFieldGet(this, _StorageApi_channel, "f").socket.sendSbObject(sbFile);
                });
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
        return new Promise((resolve, reject) => {
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
        });
    }
    /**
     * storeData
     */
    storeData(type, fileId, encrypt_data, storageToken, data) {
        return new Promise((resolve, reject) => {
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
        });
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
            if (storageTokenReq.error) {
                return { error: storageTokenReq.error };
            }
            const storageToken = JSON.stringify(storageTokenReq);
            const resp_json = yield this.storeData(type, image_id, encrypt_data, storageToken, data);
            if (resp_json.error) {
                reject(new Error(resp_json.error));
            }
            resolve({ verificationToken: resp_json.verification_token, id: resp_json.image_id, type: type });
        }));
    }
    /**
     * fetchData
     */
    fetchData(msgId, verificationToken) {
        return new Promise((resolve, reject) => {
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
        });
    }
    /**
     * retrieveData
     */
    retrieveData(msgId, messages, controlMessages) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const imageMetaData = (_a = messages.find((msg) => msg._id === msgId)) === null || _a === void 0 ? void 0 : _a.imageMetaData;
            const image_id = imageMetaData.previewId;
            const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.id && ctrl_msg.id.startsWith(image_id));
            if (!control_msg) {
                return { 'error': 'Failed to fetch data - missing control message for that image' };
            }
            const imageFetch = yield this.fetchData(control_msg.id, control_msg.verificationToken);
            const data = extractPayload(imageFetch);
            const iv = data.iv;
            const salt = data.salt;
            const image_key = yield __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_getFileKey).call(this, imageMetaData.previewKey, salt);
            const encrypted_image = data.image;
            const padded_img = yield SB_Crypto.decrypt(image_key, {
                content: encrypted_image,
                iv: iv
            }, 'arrayBuffer');
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
            const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.id && ctrl_msg.id === image_id);
            if (!control_msg) {
                return { 'error': 'Failed to fetch data - missing control message for that image' };
            }
            const imageFetch = yield this.fetchData(control_msg.id, control_msg.verificationToken);
            const data = extractPayload(imageFetch);
            const iv = data.iv;
            const salt = data.salt;
            const image_key = yield __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_getFileKey).call(this, imageMetaData.previewKey, salt);
            const encrypted_image = data.image;
            const padded_img = yield SB_Crypto.decrypt(image_key, {
                content: encrypted_image,
                iv: iv
            }, 'arrayBuffer');
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
        // @psm TODO - Support deriving from PBKDF2 in deriveKey function
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
        return new Promise((resolve, reject) => {
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
        });
    }
    /**
     * getOldMessages
     */
    getOldMessages(currentMessagesLength) {
        return new Promise((resolve, reject) => {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/oldMessages?currentMessagesLength=' + currentMessagesLength, {
                method: 'GET',
            }).then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            }).then((_encrypted_messages) => {
                resolve(_encrypted_messages);
            }).catch((e) => {
                reject(e);
            });
        });
    }
    /**
     * updateCapacity
     */
    updateCapacity(capacity) {
        return new Promise((resolve, reject) => {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/updateRoomCapacity?capacity=' + capacity, {
                method: 'GET', credentials: 'include'
            }).then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            }).then((data) => {
                resolve(data);
            }).catch((e) => {
                reject(e);
            });
        });
    }
    /**
     * getCapacity
     */
    getCapacity() {
        return new Promise((resolve, reject) => {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/getRoomCapacity', {
                method: 'GET', credentials: 'include'
            }).then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            }).then((data) => {
                resolve(data.capacity);
            }).catch((e) => {
                reject(e);
            });
        });
    }
    /**
     * getJoinRequests
     */
    getJoinRequests() {
        return new Promise((resolve, reject) => {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/getJoinRequests', {
                method: 'GET', credentials: 'include'
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
        });
    }
    /**
     * isLocked
     */
    isLocked() {
        return new Promise((resolve, reject) => {
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
        });
    }
    /**
     * Set message of the day
     */
    setMOTD(motd) {
        return new Promise((resolve, reject) => {
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
            //  reject(new Error('Must be channel owner to get admin data'));
            //}
        });
    }
    /**
     * getAdminData
     */
    getAdminData() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            //if (this.#channel.owner) {
            const token_data = new Date().getTime().toString();
            const token_sign = yield SB_Crypto.sign(__classPrivateFieldGet(this, _ChannelApi_channel, "f").keys.personal_signKey, token_data);
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
        return new Promise((resolve, reject) => {
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
        });
    }
    uploadChannel(channelData) {
        return new Promise((resolve, reject) => {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/uploadRoom', {
                method: 'POST', body: JSON.stringify(channelData), headers: {
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
        });
    }
    authorize(ownerPublicKey, serverSecret) {
        return new Promise((resolve, reject) => {
            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/authorizeRoom', {
                method: 'POST',
                body: JSON.stringify({ roomId: __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id, SERVER_SECRET: serverSecret, ownerKey: ownerPublicKey })
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
        });
    }
    postPubKey(_exportable_pubKey) {
        return new Promise((resolve, reject) => {
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
        });
    }
    storageRequest(byteLength) {
        return new Promise((resolve, reject) => {
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
        });
    }
    lock() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _ChannelApi_channel, "f").keys.locked_key == null && __classPrivateFieldGet(this, _ChannelApi_channel, "f").admin) {
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
            const shared_key = yield SB_Crypto.deriveKey(__classPrivateFieldGet(this, _ChannelApi_identity, "f").privateKey, yield SB_Crypto.importKey('jwk', jsonParseWrapper(pubKey, 'L2276'), 'ECDH', false, []), 'AES', false, ['encrypt', 'decrypt']);
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
        return new Promise((resolve, reject) => {
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
        });
    }
}
_ChannelApi_identity = new WeakMap(), _ChannelApi_channel = new WeakMap(), _ChannelApi_channelApi = new WeakMap(), _ChannelApi_channelServer = new WeakMap(), _ChannelApi_payload = new WeakMap();
/**
 * Augments IndexedDB to be used as a KV to easily
 * replace _localStorage for larger and more complex datasets
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
            db: 'MyDB', table: 'default', onReady: () => {
                return;
            },
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
        // }
        const openReq = indexedDB.open(this.options.db);
        openReq.onerror = (event) => {
            console.error(event);
        };
        openReq.onsuccess = (event) => {
            this.db = event.target.result;
            this.events.publish('ready');
        };
        openReq.onerror = (event) => {
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
            const objectStore = this.db.transaction([this.options.table], 'readonly').objectStore(this.options.table);
            const request = objectStore.openCursor(null, 'next');
            request.onsuccess = (event) => {
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
                    resolve(true);
                }
            };
            request.onerror = (event) => {
                reject(event);
            };
        });
    }
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
    getItem(key) {
        return new Promise((resolve, reject) => {
            const objectStore = this.db.transaction([this.options.table]).objectStore(this.options.table);
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
    removeItem(key) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.options.table], 'readwrite')
                .objectStore(this.options.table)
                .delete(key);
            request.onsuccess = () => {
                resolve(true);
            };
            request.onerror = (event) => {
                reject(event);
            };
        });
    }
}
_IndexedKV_instances = new WeakSet(), _IndexedKV_useDatabase = function _IndexedKV_useDatabase() {
    this.db.onversionchange = () => {
        this.db.close();
        console.info('A new version of this page is ready. Please reload or close this tab!');
    };
};
const _localStorage = new IndexedKV();
/**
 * QueueItem class
 *
 * @class
 * @constructor
 * @public
 */
/*
class QueueItem {
  timestamp = Date.now();
  action;
  args;
  _id;

  constructor(body, action) {
    return new Promise(async (resolve, reject) => {
      try {
        this.action = action;
        this.body = body;
        this._id = arrayBufferToBase64(await crypto.subtle
          .digest('SHA-256', new TextEncoder().encode(JSON.stringify(body))));
        resolve(this);
      } catch (e) {
        reject(e.message);
      }
    });
  }
}

 */
/**
 * Queue Class
 *
 * @class
 * @constructor
 * @public
 */
/*
class Queue {
  cacheDb;
  wsOptions;
  currentWS;
  onOffline;
  lastProcessed = Date.now();
  events = new MessageBus();
  options = {
    name: 'queue_default', processor: false
  };
  _memoryQueue = [];
  ready = false;

  // Needs to run from the
  constructor(options) {
    this.options = Object.assign(this.options, options);
    this.cacheDb = new KV({db: 'offline_queue', table: 'items', onReady: this.init});
  }

  init = () => {
    this.ready = true;
    this.queueReady();
  };

  queueReady = async () => {
    this.processQueue();
  };

  ws = (options) => {
    return new Promise(async (resolve, reject) => {
      try {
        this.wsOptions = {
          url: options.url + options._id + '/websocket', onOpen: async (event) => {
            this.init = {name: options.init.name};
            await this.currentWS.currentWebSocket.send(JSON.stringify(this.init));
          }
        };
        this.currentWS = new ManagedWS(this.wsOptions);
        const cachedWs = await this.cacheDb.getItem(`queue_ws_${options._id}`) || null;
        if (!cachedWs) {
          await this.cacheDb.add(`queue_ws_${this.wsOptions._id}`, options);
        }
        resolve(this.currentWS);
      } catch (e) {
        reject(e);
      }
    });
  };

  setLastProcessed = () => {
    this.lastProcessed = Date.now();
  };

  wsSend = (_id, message, socket) => {
    socket.send(JSON.stringify(message)).then(async () => {
      await this.remove(_id);
      this.setLastProcessed();
    }).catch(() => {
      console.info('Your client is offline, your message will be sent when you reconnect');
      if (typeof this.onOffline === 'function') {
        this.events.publish('offline');
        this.onOffline(message);
        this.setLastProcessed();
      }
    });
  };

  wsCallback = (_id, ws, message, ms) => {
    return new Promise(async (resolve, reject) => {
      if (ms) {
        while (Date.now() <= this.lastProcessed + ms) {
          await sleep(ms);
        }
      }
      try {
        if (!this.currentWS) {
          const options = await this.cacheDb.getItem(`queue_ws_${ws._id}`) || false;
          if (options) {
            this.ws(options).then((socket) => {
              this.wsSend(_id, message, socket);
            });
          } else {
            this.ws(ws).then((socket) => {
              this.wsSend(_id, message, socket);
            });
          }
        } else {
          if (this.currentWS.readyState !== 1) {
            return;
          }
          this.wsSend(_id, message, this.currentWS);
        }
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  };

  add = async (args, action) => {
    if (!this.ready) {
      this._memoryQueue.push(await new QueueItem(args, action));
      return;
    }
    const item = await new QueueItem(args, action);
    await this.cacheDb.add(`queued_${item._id}`, item);
    this.processQueue();
  };

  remove = async (_id) => {
    return await this.cacheDb.removeItem(`queued_${_id}`);
  };

  processQueue = async () => {
    if (!this.ready || !this.options.processor) {
      return;
    }
    setInterval(async () => {
      await this.cacheDb.openCursor('queued_', async (item) => {
        if (item.action === 'wsCallback') {
          return await this.wsCallback(item._id, item.body.ws, item.body.message, 250);
        } else {
          try {
            item.action();
          } catch (e) {
            console.error(e);
          }
        }
      });
    }, 2000);
  };
}

 */
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
        // PSM: i think these two are on a per-channel object basis?
        _Snackabra_channel.set(this, void 0);
        _Snackabra_storage.set(this, new StorageApi());
        _Snackabra_identity.set(this, new Identity());
        this.options = {
            channel_server: '',
            channel_ws: '',
            storage_server: ''
        };
        _sb_assert(args, 'Snackabra(args) - missing args');
        try {
            this.options = {
                channel_server: args.channel_server,
                channel_ws: args.channel_ws,
                storage_server: args.storage_server
            };
        }
        catch (e) {
            _sb_exception('Snackabra.constructor()', e);
        }
    }
    setIdentity(keys) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield __classPrivateFieldGet(this, _Snackabra_identity, "f").mountKeys(keys);
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
        return new Promise((resolve, reject) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const _self = this;
                if (!__classPrivateFieldGet(_self, _Snackabra_identity, "f").exportable_pubKey) {
                    // @psm TODO: does it?
                    reject(new Error('setIdentity must be called before connecting'));
                }
                const c = new Channel(_self.options.channel_server, _self.options.channel_ws, __classPrivateFieldGet(_self, _Snackabra_identity, "f"));
                c.join(channel_id).then((_c) => {
                    __classPrivateFieldSet(_self, _Snackabra_channel, _c, "f");
                    __classPrivateFieldSet(_self, _Snackabra_storage, new StorageApi(), "f");
                    __classPrivateFieldGet(_self, _Snackabra_storage, "f").init(_self.options.storage_server, __classPrivateFieldGet(_self, _Snackabra_channel, "f"), __classPrivateFieldGet(_self, _Snackabra_identity, "f"));
                    resolve(_self);
                });
            }
            catch (e) {
                reject(e);
            }
        });
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
                if (resp.success) {
                    yield this.connect(channelId);
                    _localStorage.setItem(channelId, JSON.stringify(exportable_privateKey));
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
_Snackabra_channel = new WeakMap(), _Snackabra_storage = new WeakMap(), _Snackabra_identity = new WeakMap(), _Snackabra_instances = new WeakSet(), _Snackabra_generateRoomId = function _Snackabra_generateRoomId(x, y) {
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
