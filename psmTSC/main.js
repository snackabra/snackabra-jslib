/*
  THIS HEADER HAS INFO WHILE WE ARE REFACTORING
  
  currently experimenting with
  tsc -lib dom,es5,es6,es2021 -t es6 --explainFiles --pretty false --strict ./main.ts

  main target options are (default is es3)
  es3, es5, es6/es2015, es2016, es2017, es2018, es2019, es2020,
  es2021, es2022, esnext

  TODO list:
  * look for "ts-ignore" in the code below for lingering issues
  * latest (fast) code for image loading etc is in the JS client:
    384-snackabra-webclient/src/utils/ImageProcessor.js
    384-snackabra-webclient/src/utils/ImageWorker.js
    that JS code needs to carry over, below the "most modified"
    parts of that code will throw an error
    

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
    return ('THIS IS NEITHER BROWSER NOR NODE THIS IS SPARTA!');
}
/**
 * SB simple events (mesage bus) class
 */
export class MessageBus {
    constructor() {
        _MessageBus_instances.add(this);
        Object.defineProperty(this, "bus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
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
    // const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const view = new DataView(buffer);
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
                // TODO: correctly match differenct combinations of types in the above function declaration
                // @ts-ignore
                const response = yield window.crypto.subtle.importKey(format, key, keyAlgorithms[type], extractable, keyUsages);
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
        Object.defineProperty(this, "resolve_exportable_pubKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (() => { throw new Error('uninit prom called'); })
        });
        Object.defineProperty(this, "resolve_exportable_privateKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (() => { throw new Error('uninit prom called'); })
        });
        Object.defineProperty(this, "resolve_privateKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (() => { throw new Error('uninit prom called'); })
        });
        Object.defineProperty(this, "exportable_pubKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Promise((resolve) => this.resolve_exportable_pubKey = resolve)
        });
        Object.defineProperty(this, "exportable_privateKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Promise((resolve) => this.resolve_exportable_privateKey = resolve)
        });
        Object.defineProperty(this, "privateKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Promise((resolve) => this.resolve_privateKey = resolve)
        });
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
        Object.defineProperty(this, "encrypted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "contents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sender_pubKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sign", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "image", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "image_sign", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "imageMetaData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "imageMetadata_sign", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // TODO: does it work to return a promise as a class instance?
        // @ts-ignore
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
        Object.defineProperty(this, "encrypted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "contents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sender_pubKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sign", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                previewImage: '',
                fullImage: ''
            }
        });
        Object.defineProperty(this, "image", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "image_sign", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "imageMetaData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "imageMetadata_sign", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // TODO: does it work to return a promise as a class instance?
        // @ts-ignore
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
        this.data.fullImage = image.byteLength > 15728640 ? __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_padImage).call(this, yield (yield __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_restrictPhoto).call(this, image, 15360, 'image/jpeg', 0.92)).arrayBuffer()) : __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_padImage).call(this, image);
        const fullHash = yield __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_generateImageHash).call(this, this.data.fullImage);
        // psm: not sure what this does next, but the new SBImage class should do all this for you
        // @ts-ignore
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
}, _SBFile_restrictPhoto = function _SBFile_restrictPhoto(photo, maxSize, // in KB
imageType, qualityArgument) {
    return __awaiter(this, void 0, void 0, function* () {
        // latest and greatest JS version is in:
        // 384-snackabra-webclient/src/utils/ImageProcessor.js
        throw new Error('restrictPhoto() needs TS version');
        return null;
    });
}, _SBFile_scaleCanvas = function _SBFile_scaleCanvas(canvas, scale) {
    // latest and greatest JS version is in:
    // 384-snackabra-webclient/src/utils/ImageProcessor.js
    throw new Error('scaleCanvas() needs TS version');
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
        // latest and greatest JS version is in:
        // 384-snackabra-webclient/src/utils/ImageProcessor.js
        throw new Error('generateImageHash() needs TS version');
    });
}, _SBFile_readPhoto = function _SBFile_readPhoto(photo) {
    return __awaiter(this, void 0, void 0, function* () {
        const canvas = document.createElement('canvas');
        const img = document.createElement('img');
        // create img element from File object
        img.src = yield new Promise((resolve) => {
            const reader = new FileReader();
            // TODO: the entire readPhoto stuff is replaced by SBImage
            // @ts-ignore
            reader.onload = (e) => { var _a; return resolve((_a = e.target) === null || _a === void 0 ? void 0 : _a.result); };
            // TODO: ditto
            // @ts-ignore
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
        Object.defineProperty(this, "currentWebSocket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new MessageBus()
        });
        _WS_Protocol_options.set(this, {
            url: '', onOpen: null, onMessage: null, onClose: null, onError: null, timeout: 30000
        });
        Object.defineProperty(this, "send", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (message) => {
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
            }
        });
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
                this.currentWebSocket = new WebSocket(this.options.url);
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
        Object.defineProperty(this, "_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "wss", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "identity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "owner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "admin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "verifiedGuest", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "metaData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        _Channel_keys.set(this, void 0);
        _Channel_api.set(this, void 0);
        _Channel_socket.set(this, void 0);
        Object.defineProperty(this, "loadKeys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (keys) => {
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
            }
        });
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
        Object.defineProperty(this, "socket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "init", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "channelId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _ChannelSocket_channel.set(this, void 0);
        _ChannelSocket_identity.set(this, void 0);
        _ChannelSocket_payload.set(this, void 0);
        _ChannelSocket_queue.set(this, []);
        Object.defineProperty(this, "ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "onOpen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onJoin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onClose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onSystemInfo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        Object.defineProperty(this, "server", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        // latest and greatest JS version is in:
        // 384-snackabra-webclient/src/utils/ImageProcessor.js
        throw new Error('Storage() needs TS version');
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
        Object.defineProperty(this, "server", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new MessageBus()
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                db: 'MyDB', table: 'default', onReady: () => {
                    return;
                },
            }
        });
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
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                channel_server: '',
                channel_ws: '',
                storage_server: ''
            }
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFtQkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3RUYsc0JBQXNCO0FBQ3RCLFNBQVMsaUJBQWlCO0lBQ3hCLE9BQU0sQ0FBQyxrREFBa0QsQ0FBQyxDQUFBO0FBQzVELENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTyxVQUFVO0lBQXZCOztRQUNFOzs7O21CQUFrQixFQUFFO1dBQUE7SUE0Q3RCLENBQUM7SUFuQ0M7OztPQUdHO0lBQ0gsU0FBUyxDQUFDLEtBQWEsRUFBRSxPQUF5QjtRQUNoRCx1QkFBQSxJQUFJLGlEQUFRLE1BQVosSUFBSSxFQUFTLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxXQUFXLENBQUMsS0FBYSxFQUFFLE9BQXlCO1FBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ25CLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUMzRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDOUI7aUJBQU07Z0JBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO2FBQ25FO1NBQ0Y7YUFBTTtZQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkRBQTJELENBQUMsQ0FBQztTQUMzRTtJQUNILENBQUM7SUFFRDs7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