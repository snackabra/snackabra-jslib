/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function createLabel(nameOrId) {
    console.log(typeof nameOrId);
    if (typeof nameOrId === 'number') {
        return nameOrId + 1;
    }
    else {
        return "we got a string:" + nameOrId;
    }
}
console.log(createLabel(4));
console.log(createLabel("four"));
// demo / example / testing
export function f(v) {
    if (v.type === 'channelKeys') {
        return v;
    }
    else {
        return null;
    }
}
export function g(v) {
    if (v.type === 'system') {
        return v;
    }
    else {
        return null;
    }
}
//#region - not so core stuff
/* zen Master: "um" */
export function SB_libraryVersion() {
    return ('THIS IS NEITHER BROWSER NOR NODE THIS IS SPARTA!');
}
/**
 * SB simple events (mesage bus) class
 */
export class MessageBus {
    bus = {};
    /**
     * Safely returns handler for any event
     */
    #select(event) {
        return this.bus[event] || (this.bus[event] = []);
    }
    /**
     * Subscribe. 'event' is a string, special case '*' means everything
     *  (in which case the handler is also given the message)
     */
    subscribe(event, handler) {
        this.#select(event).push(handler);
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
        for (const handler of this.#select('*')) {
            handler(event, ...args);
        }
        for (const handler of this.#select(event)) {
            handler(...args);
        }
    }
}
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
export function _sb_exception(loc, msg) {
    const m = '<< SB lib error (' + loc + ': ' + msg + ') >>';
    // for now disabling this to keep node testing less noisy
    // console.error(m);
    throw new Error(m);
}
// internal - general handling of paramaters that might be promises
// (basically the "anti" of resolve, if it's *not* a promise then
// it becomes one
export function _sb_resolve(val) {
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
export function _sb_assert(val, msg) {
    if (!(val)) {
        const m = `<< SB assertion error: ${msg} >>`;
        throw new Error(m);
    }
}
//#endregion
//#region - crypto and translation stuff
/**
 * Fills buffer with random data
 */
export function getRandomValues(buffer) {
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
export function _assertBase64(base64) {
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
export function str2ab(string) {
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
export function ab2str(buffer) {
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
export function base64ToArrayBuffer(str) {
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
const bs2dv = (bs) => bs instanceof ArrayBuffer
    ? new DataView(bs)
    : new DataView(bs.buffer, bs.byteOffset, bs.byteLength);
/**
 * Standardized 'btoa()'-like function, e.g., takes a binary string
 * ('b') and returns a Base64 encoded version ('a' used to be short
 * for 'ascii').
 *
 * @param {bufferSource} ArrayBuffer buffer
 * @return {string} base64 string
 */
export function arrayBufferToBase64(buffer) {
    if (buffer == null) {
        _sb_exception('L509', 'arrayBufferToBase64() -> null paramater');
        return '';
    }
    else {
        // const view = bs2dv(bufferSource)
        // const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        // console.log(buffer)
        // const view = new DataView(buffer)
        const view = bs2dv(buffer);
        const len = view.byteLength;
        const extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
        const len2 = len - extraBytes;
        const parts = new Array(Math.floor(len2 / MAX_CHUNK_LENGTH) + Math.sign(extraBytes));
        // const lookup = urlLookup;
        const lookup = b64lookup; // regular atob() doesn't like url friendly
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
export function _appendBuffer(buffer1, buffer2) {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}
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
export function importPublicKey(pem) {
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
export function simpleRand256() {
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
export function simpleRandomString(n, code) {
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
export function cleanBase32mi(s) {
    // this of course is not the most efficient
    return s.replace(/[OoQD]/g, '0').replace(/[lIiJ]/g, '1').replace(/[Zz]/g, '2').replace(/[A]/g, '4').replace(/[Ss]/g, '5').replace(/[G]/g, '6').replace(/[t]/g, '7').replace(/[B]/g, '8').replace(/[gq]/g, '9').replace(/[C]/g, 'c').replace(/[Y]/g, 'y').replace(/[KxX]/g, 'k').replace(/[M]/g, 'm').replace(/[n]/g, 'N').replace(/[P]/g, 'p').replace(/[uvV]/g, 'U').replace(/[w]/g, 'w');
}
/**
 * Takes an arbitrary dict object, a public key in PEM
 * format, and a callback function: generates a random AES key,
 * wraps that in (RSA) key, and when all done will call the
 * callback function with the results.
 *
 * This function is for direct use in a web page, for example
 * capturing a 'form' input set of data about a user, and
 * sending towards a backend in such a way that the contents
 * can only be decrypted and read off-line (air gapped).
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
export function partition(str, n) {
    const returnArr = [];
    let i, l;
    for (i = 0, l = str.length; i < l; i += n) {
        returnArr.push(str.substr(i, n));
    }
    return returnArr;
}
/**
 * There are many problems with JSON parsing, adding a wrapper to capture more info.
 * The 'loc' parameter should be a (unique) string that allows you to find the usage
 * in the code; one approach is the line number in the file (at some point).
 */
export function jsonParseWrapper(str, loc) {
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
            while (str2 != (s3 = s2, s2 = str2, str2 = str2?.match(/^(['"])(.*)\1$/m)?.[2]))
                return JSON.parse(`'${s3}'`);
        }
        catch {
            // let's try one more thing
            try {
                return JSON.parse(str.slice(1, -1));
            }
            catch {
                // i am beginning to dislike TS .. ugh no simple way to get error message
                // see: https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
                throw new Error(`JSON.parse() error at ${loc} (tried eval and slice)\nString was: ${str}`);
            }
        }
    }
}
/**
 * Deprecated (older version of payloads, for older channels)
 */
export function extractPayloadV1(payload) {
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
export function assemblePayload(data) {
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
        return null;
    }
}
/**
 * Extract payload - this decodes from our binary (wire) format
 * to a JS object. This provides a binary encoding of any JSON,
 * and it allows some elements of the JSON to be raw (binary).
 */
export function extractPayload(payload) {
    try {
        // number of bytes of meta data (encoded as a 32-bit Uint)
        const metadataSize = new Uint32Array(payload.slice(0, 4))[0];
        console.info('METADATASIZE: ', metadataSize);
        const decoder = new TextDecoder();
        // extracts the string of meta data and parses
        console.info('METADATASTRING: ', decoder.decode(payload.slice(4, 4 + metadataSize)));
        const _metadata = jsonParseWrapper(decoder.decode(payload.slice(4, 4 + metadataSize)), 'L533');
        console.info('METADATA EXTRACTED', JSON.stringify(_metadata));
        // calculate start of actual contents
        const startIndex = 4 + metadataSize;
        if (!_metadata.version) {
            // backwards compatibility
            _metadata['version'] = '001';
        }
        console.info(_metadata['version']);
        switch (_metadata['version']) {
            case '001': {
                // deprecated, older format
                return extractPayloadV1(payload);
            }
            case '002': {
                const data = [];
                for (let i = 1; i < Object.keys(_metadata).length; i++) {
                    const _index = i.toString();
                    if (_metadata._index) {
                        const propertyStartIndex = _metadata[_index]['start'];
                        // start (in bytes) of contents
                        console.info(propertyStartIndex);
                        const size = _metadata[_index]['size'];
                        // where to put it
                        const entry = _metadata[_index];
                        // extracts contents - this supports raw data
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
export function encodeB64Url(input) {
    return input.replaceAll('+', '-').replaceAll('/', '_');
}
/**
 * Decode b64 URL
 */
export function decodeB64Url(input) {
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
//#endregion - crypto and translation stuff
/**
 * SBCrypto contains all the SB specific crypto functions
 *
 * @class
 * @constructor
 * @public
 */
class SBCrypto {
    /**
     * Extracts (generates) public key from a private key.
     */
    extractPubKey(privateKey) {
        try {
            const pubKey = { ...privateKey };
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
            return null;
        }
    }
    /**
     * SBCrypto.generatekeys()
     *
     * Generates standard ``ECDH`` keys using ``P-384``.
     */
    generateKeys() {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await crypto.subtle.generateKey({
                    name: 'ECDH', namedCurve: 'P-384'
                }, true, ['deriveKey']));
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /**
     * SBCrypto.importKey()
     *
     * Import keys
     */
    importKey(format, key, type, extractable, keyUsages) {
        const keyAlgorithms = {
            ECDH: { name: 'ECDH', namedCurve: 'P-384' },
            AES: { name: 'AES-GCM' },
            PBKDF2: 'PBKDF2'
        };
        if (format === 'jwk') {
            return (window.crypto.subtle.importKey('jwk', key, keyAlgorithms[type], extractable, keyUsages));
        }
        else {
            return (window.crypto.subtle.importKey(format, key, keyAlgorithms[type], extractable, keyUsages));
        }
    }
    /**
     * SBCrypto.deriveKey()
     *
     * Derive key.
     */
    deriveKey(privateKey, publicKey, type, extractable, keyUsages) {
        return new Promise(async (resolve, reject) => {
            const keyAlgorithms = {
                AES: {
                    name: 'AES-GCM', length: 256
                }, HMAC: {
                    name: 'HMAC', hash: 'SHA-256', length: 256
                }
            };
            try {
                resolve(await crypto.subtle.deriveKey({
                    name: 'ECDH',
                    public: publicKey
                }, privateKey, keyAlgorithms[type], extractable, keyUsages));
            }
            catch (e) {
                console.error(e, privateKey, publicKey, type, extractable, keyUsages);
                reject(e);
            }
        });
    }
    /**
     * SBCrypto.getFileKey()
     *
     * Get file key
     */
    getFileKey(fileHash, _salt) {
        return new Promise(async (resolve, reject) => {
            try {
                const keyMaterial = await this.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
                // @psm TODO - Support deriving from PBKDF2 in deriveKey function
                const key = await crypto.subtle.deriveKey({
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
        });
    }
    /**
     * SBCrypto.encrypt()
     *
     * Encrypt. if no nonce (iv) is given, will create it.
     */
    encrypt(data, key, _iv = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data === null)
                    reject(new Error('no contents'));
                const iv = _iv === null ? crypto.getRandomValues(new Uint8Array(12)) : _iv;
                if (typeof data === 'string')
                    data = (new TextEncoder()).encode(data);
                crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, data).then((encrypted) => {
                    // console.log("encrypt() result:")
                    // console.log(encrypted)
                    resolve({
                        content: encodeURIComponent(arrayBufferToBase64(encrypted)),
                        iv: encodeURIComponent(arrayBufferToBase64(iv))
                    });
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    wrap(k, b, bodyType) {
        return new Promise((resolve) => {
            let a;
            if (bodyType === 'string') {
                // console.log("wrap() got string:")
                // console.log(b as string)
                a = str2ab(b);
            }
            else {
                a = b;
            }
            // console.log("wrap() is encrypting buffer:")
            // console.log(a)
            sbCrypto.encrypt(a, k).then((c) => { resolve(c); });
        });
    }
    unwrap(k, o, returnType) {
        // console.log("SBCrypto.unwrap():"); console.log(k); console.log(o)
        return new Promise(async (resolve, reject) => {
            try {
                const t = base64ToArrayBuffer(decodeURIComponent(o.content));
                const iv = base64ToArrayBuffer(decodeURIComponent(o.iv));
                crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, k, t).then((d) => {
                    if (returnType === 'string') {
                        resolve(new TextDecoder().decode(d));
                    }
                    else if (returnType === 'arrayBuffer') {
                        resolve(d);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /**
     * SBCrypto.sign()
     *
     * Sign
     */
    sign(secretKey, contents) {
        return new Promise(async (resolve, reject) => {
            try {
                const encoder = new TextEncoder();
                const encoded = encoder.encode(contents);
                let sign;
                try {
                    // console.log("signing with:")
                    // console.log(secretKey)
                    sign = await crypto.subtle.sign('HMAC', secretKey, encoded);
                    resolve(encodeURIComponent(arrayBufferToBase64(sign)));
                }
                catch (error) {
                    reject(error);
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * SBCrypto.verify()
     *
     * Verify
     */
    verify(secretKey, sign, contents) {
        return new Promise(async (resolve, reject) => {
            try {
                const _sign = base64ToArrayBuffer(decodeURIComponent(sign));
                const encoder = new TextEncoder();
                const encoded = encoder.encode(contents);
                try {
                    const verified = await crypto.subtle.verify('HMAC', secretKey, _sign, encoded);
                    resolve(verified);
                }
                catch (e) {
                    reject(e);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /**
     * SBCrypto.areKeysSame()
     *
     * Compare keys. (TODO: deprecate/ change)
     */
    areKeysSame(key1, key2) {
        if (key1 != null && key2 != null && typeof key1 === 'object' && typeof key2 === 'object') {
            return key1['x'] === key2['x'] && key1['y'] === key2['y'];
        }
        return false;
    }
} /* SBCrypto */
const sbCrypto = new SBCrypto();
//#region - local descriptors
function Memoize(target, propertyKey, descriptor) {
    if (descriptor.get) {
        let get = descriptor.get;
        descriptor.get = function () {
            const prop = `__${propertyKey}__`;
            if (this.hasOwnProperty(prop)) {
                const returnValue = this[prop];
                // console.log("Memoize found value in cache")
                // console.log(returnValue)
                return (returnValue);
            }
            else {
                // console.log("Memoize new return value")
                const returnValue = get.call(this);
                Object.defineProperty(this, prop, { configurable: false, enumerable: false, writable: false, value: returnValue });
                // console.log(returnValue)
                return returnValue;
            }
        };
    }
}
function Ready(target, propertyKey, descriptor) {
    if (descriptor.get) {
        // console.log("Checking ready for:")
        // console.log(target)
        let get = descriptor.get;
        descriptor.get = function () {
            // console.log("============= Ready checking this:")
            // console.log(this)
            if ("readyFlag" in this) {
                // console.log(`============= Ready() - checking readyFlag for ${propertyKey}`)
                const rf = "readyFlag";
                // console.log(this[rf])
                // _sb_assert(this[rf], `${propertyKey} getter accessed but object not ready (fatal)`)  
            }
            const retValue = get.call(this);
            _sb_assert(retValue != null, `${propertyKey} getter accessed but returns NULL (fatal)`);
            return retValue;
        };
    }
}
//# endregion
/**
 * SB384 - basic (core) capability object in SB
 * @class
 * @constructor
 * @public
 */
class SB384 {
    ready;
    #readyFlag = false;
    #exportable_pubKey = null;
    #exportable_privateKey = null;
    #privateKey = null;
    #ownerChannelId = null;
    #keyPair = null;
    /**
     * new SB384()
     * @param key a jwk with which to create identity; if not provided,
     * it will 'mint' (generate) them randomly
     */
    constructor(key) {
        // console.log("setting SB384.ready")
        this.ready = new Promise((resolve, reject) => {
            try {
                if (key) {
                    this.#exportable_privateKey = key;
                    const pk = sbCrypto.extractPubKey(key);
                    if (pk)
                        this.#exportable_pubKey = pk;
                    sbCrypto.importKey('jwk', key, 'ECDH', true, ['deriveKey']).then((k) => {
                        this.#privateKey = k;
                        this.#readyFlag = true;
                        resolve(this);
                    });
                }
                else {
                    sbCrypto.generateKeys().then((keyPair) => {
                        this.#privateKey = keyPair.privateKey;
                        this.#keyPair = keyPair;
                        // console.log("========== Public Key part:")
                        // console.log(keyPair.publicKey)
                        Promise.all([
                            crypto.subtle.exportKey('jwk', keyPair.publicKey),
                            crypto.subtle.exportKey('jwk', keyPair.privateKey)
                        ]).then((v) => {
                            this.#exportable_pubKey = v[0];
                            this.#exportable_privateKey = v[1];
                            this.#generateRoomId(this.#exportable_pubKey.x, this.#exportable_pubKey.y).then((channelId) => {
                                this.#ownerChannelId = channelId;
                                this.#readyFlag = true;
                                resolve(this);
                            });
                        });
                    });
                }
            }
            catch (e) {
                let errMsg = `failed to create Identity(): ${e}`;
                console.error(errMsg);
                // _sb_exception("new Identity()", `failed to create Identity(): ${e}`) // do reject instead
                reject(errMsg);
            }
        });
    }
    #generateRoomId(x, y) {
        return new Promise(async (resolve, reject) => {
            try {
                const xBytes = base64ToArrayBuffer(decodeB64Url(x));
                const yBytes = base64ToArrayBuffer(decodeB64Url(y));
                const channelBytes = _appendBuffer(xBytes, yBytes);
                crypto.subtle.digest('SHA-384', channelBytes).then((channelBytesHash) => {
                    resolve(encodeB64Url(arrayBufferToBase64(channelBytesHash)));
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    get readyFlag() { return this.#readyFlag; }
    get exportable_pubKey() { return this.#exportable_pubKey; }
    get exportable_privateKey() { return this.#exportable_privateKey; }
    get privateKey() { return this.#privateKey; }
    get keyPair() { return this.#keyPair; }
    get _id() { return JSON.stringify(this.exportable_pubKey); }
    get ownerChannelId() { return this.#ownerChannelId; }
} /* class Identity */
__decorate([
    Memoize
], SB384.prototype, "readyFlag", null);
__decorate([
    Memoize,
    Ready
], SB384.prototype, "exportable_pubKey", null);
__decorate([
    Memoize,
    Ready
], SB384.prototype, "exportable_privateKey", null);
__decorate([
    Memoize,
    Ready
], SB384.prototype, "privateKey", null);
__decorate([
    Memoize,
    Ready
], SB384.prototype, "keyPair", null);
__decorate([
    Memoize,
    Ready
], SB384.prototype, "_id", null);
__decorate([
    Memoize,
    Ready
], SB384.prototype, "ownerChannelId", null);
/**
 * SBMessage
 * @class
 * @constructor
 * @public
 */
class SBMessage {
    ready;
    channel;
    contents;
    /* SBMessage */
    constructor(channel, body) {
        // console.log("creating SBMessage on channel:")
        // console.log(channel)
        this.channel = channel;
        this.contents = { encrypted: false, contents: body, sign: '', image: '', imageMetaData: {} };
        this.ready = new Promise((resolve, reject) => {
            this.contents.sender_pubKey = this.channel.exportable_pubKey;
            // console.log("SBMessage: waiting on channel to be ready... ")
            channel.ready.then(() => {
                // console.log("SBMessage: ... got keys .. here are keys and sign key ")
                // console.log(this.channel.keys)
                // console.log(this.channel.keys.signKey)
                if (channel.userName)
                    this.contents.sender_username = channel.userName;
                const signKey = this.channel.keys.channelSignKey;
                // console.log("SBMessage: ... got sign key ... waiting on closure")
                const sign = sbCrypto.sign(signKey, body);
                const image_sign = sbCrypto.sign(signKey, this.contents.image);
                const imageMetadata_sign = sbCrypto.sign(signKey, JSON.stringify(this.contents.imageMetaData));
                Promise.all([sign, image_sign, imageMetadata_sign]).then((values) => {
                    // console.log("SBMessage: ... got everything, about to resolve")
                    this.contents.sign = values[0];
                    this.contents.image_sign = values[1];
                    this.contents.imageMetadata_sign = values[2];
                    resolve(this);
                });
            });
        });
    }
    /**
     * SBMessage.send()
     *
     * @param {SBMessage} message - the message object to send
     */
    send() {
        // console.log("SBMessage.send()")
        // console.log(this)
        return new Promise((resolve, reject) => {
            this.ready.then(() => {
                // message ready
                this.channel.send(this).then((result) => {
                    if (result === "success") {
                        resolve(result);
                    }
                    else {
                        reject(result);
                    }
                });
            });
        });
        // TODO: i've punted on queue here <--- queueMicrotaks maybe?
    }
}
//#region ImageProcessor.js (being rewritten to be in this library starting 20221020 ...)
import * as utils from "./utils";
import config from "../config";
import { encrypt, getImageKey } from "./crypto";
import { decrypt } from "./utils";
import ImageWorker from './ImageWorker.js';
// experiment with https://silvia-odwyer.github.io/photon/guide/using-photon-web/
// import("@silvia-odwyer/photon").then(photon => {
//   // it's now imported and should work
//   console.log("Looks like photon got imported");
//   console.log(photon);
// });
// // experiment with https://github.com/ai/offscreen-canvas
// import createWorker from '../offscreen-canvas/create-worker'
// const worker = createWorker(canvas, '/worker.js', e => {
//   // Messages from the worker
// })
// document.addEventListener("localKvReady", function(e) {
//   ReactDOM.render(<App />, document.getElementById('root'));
// });
// refactoring - 'image' becomes sbImage object
export async function saveImage(sbImage, roomId, sendSystemMessage) {
    const t0 = new Date().getTime();
    const previewImage = padImage(await (await restrictPhoto(sbImage, 4096)).arrayBuffer());
    const previewHash = await generateImageHash(previewImage);
    const t1 = new Date().getTime();
    console.log(`#### previewHash took took total ${t1 - t0} milliseconds (blocking)`);
    // only if the file is over 15 MB do we restrict the full file - 15360 here is 15360 KB which is 15 MB
    const fullImage = sbImage.image.size > 15728640 ? padImage(await (await restrictPhoto(sbImage, 15360)).arrayBuffer()) : padImage(await sbImage.image.arrayBuffer());
    const t2 = new Date().getTime();
    console.log(`#### fullImage load took took total ${t2 - t1} milliseconds (blocking)`);
    const fullHash = await generateImageHash(fullImage);
    const t3 = new Date().getTime();
    console.log(`#### fullHash took took total ${t3 - t2} milliseconds (blocking)`);
    const previewStorePromise = storeImage(previewImage, previewHash.id, previewHash.key, 'p', roomId).then(_x => {
        if (_x.hasOwnProperty('error'))
            sendSystemMessage('Could not store preview: ' + _x['error']);
        const t5 = new Date().getTime();
        console.log(`#### previewStorePromise took ${t5 - t3} milliseconds (asynchronous)`);
        return _x;
    });
    const t4 = new Date().getTime();
    const fullStorePromise = storeImage(fullImage, fullHash.id, fullHash.key, 'f', roomId).then(_x => {
        if (_x.hasOwnProperty('error'))
            sendSystemMessage('Could not store full image: ' + _x['error']);
        const t5 = new Date().getTime();
        console.log(`#### fullStorePromise took ${t5 - t4} milliseconds (but asynchronous)`);
        return _x;
    });
    // return { full: { id: fullHash.id, key: fullHash.key }, preview: { id: previewHash.id, key: previewHash.key } }
    return {
        full: fullHash.id,
        preview: previewHash.id,
        fullKey: fullHash.key,
        previewKey: previewHash.key,
        fullStorePromise: fullStorePromise,
        previewStorePromise: previewStorePromise // and this promise
    };
}
async function uploadImage(storageToken, encrypt_data, type, image_id, data) {
    return await fetch(config.STORAGE_SERVER + "/storeData?type=" + type + "&key=" + encodeURIComponent(image_id), {
        method: "POST",
        body: utils.assemblePayload({
            iv: encrypt_data.iv,
            salt: encrypt_data.salt,
            image: data.content,
            storageToken: (new TextEncoder()).encode(storageToken),
            vid: window.crypto.getRandomValues(new Uint8Array(48))
        })
    });
}
export async function storeImage(image, image_id, keyData, type, roomId) {
    try {
        const storeReqResp = await (await fetch(config.STORAGE_SERVER + "/storeRequest?name=" + image_id)).arrayBuffer();
        const encrypt_data = utils.extractPayload(storeReqResp);
        const key = await getImageKey(keyData, encrypt_data.salt);
        let storageToken, verificationToken;
        const data = await encrypt(image, key, "arrayBuffer", encrypt_data.iv);
        const storageTokenReq = await (await fetch(config.ROOM_SERVER + roomId + '/storageRequest?size=' + data.content.byteLength)).json();
        if (storageTokenReq.hasOwnProperty('error')) {
            return { error: storageTokenReq.error };
        }
        storageToken = JSON.stringify(storageTokenReq);
        const resp = await uploadImage(storageToken, encrypt_data, type, image_id, data);
        const status = resp.status;
        const resp_json = await resp.json();
        if (status !== 200) {
            return { error: 'Error: storeImage() failed (' + resp_json.error + ')' };
        }
        verificationToken = resp_json.verification_token;
        return { verificationToken: verificationToken, id: resp_json.image_id, type: type };
    }
    catch (e) {
        console.error(e);
        return image_id;
    }
}
export async function generateImageHash(image) {
    try {
        const digest = await crypto.subtle.digest('SHA-512', image);
        const _id = digest.slice(0, 32);
        const _key = digest.slice(32);
        return {
            id: encodeURIComponent(utils.arrayBufferToBase64(_id)),
            key: encodeURIComponent(utils.arrayBufferToBase64(_key))
        };
    }
    catch (e) {
        console.log(e);
        return {};
    }
}
async function downloadImage(control_msg, image_id, cache) {
    const imageFetch = await (await fetch(config.STORAGE_SERVER + "/fetchData?id=" + encodeURIComponent(control_msg.id) + '&verification_token=' + control_msg.verificationToken)).arrayBuffer();
    let data = utils.extractPayload(imageFetch);
    document.cacheDb.setItem(`${image_id}_cache`, data);
    return data;
}
export async function retrieveData(message, controlMessages, cache) {
    const imageMetaData = message.imageMetaData;
    const image_id = imageMetaData.previewId;
    const control_msg = controlMessages.find(msg => msg.hasOwnProperty('id') && msg.id.startsWith(image_id));
    if (!control_msg) {
        return { 'error': 'Failed to fetch data - missing control message for that image' };
    }
    const cached = await document.cacheDb.getItem(`${image_id}_cache`);
    let data;
    if (cached === null) {
        data = await downloadImage(control_msg, image_id, cache);
    }
    else {
        console.log('Loading image data from cache');
        data = cached;
    }
    const iv = data.iv;
    const salt = data.salt;
    const image_key = await getImageKey(imageMetaData.previewKey, salt);
    const encrypted_image = data.image;
    const padded_img = await decrypt(image_key, { content: encrypted_image, iv: iv }, "arrayBuffer");
    const img = unpadData(padded_img.plaintext);
    if (img.error) {
        console.log('(Image error: ' + img.error + ')');
        throw new Error('Failed to fetch data - authentication or formatting error');
    }
    return { 'url': "data:image/jpeg;base64," + utils.arrayBufferToBase64(img) };
}
export async function getFileData(file, outputType) {
    try {
        let reader = new FileReader();
        if (file.size === 0) {
            return null;
        }
        outputType === 'url' ? reader.readAsDataURL(file) : reader.readAsArrayBuffer(file);
        return new Promise((resolve, reject) => {
            reader.onloadend = (event) => {
                let the_blob = reader.result;
                resolve(the_blob);
            };
        });
    }
    catch (e) {
        console.log(e);
        return null;
    }
}
// refactoring from using raw photo to using SBImage object
// change: imageType, qualityArgument both hardcoded
// helper
// maxSize: target (max) size in KB
// _c: full image on starting point canvas (eg sbImage.canvas)
// _b1: blob version (eg sbImage.blob)
export async function _restrictPhoto(maxSize, _c, _b1) {
    const t2 = new Date().getTime();
    const imageType = "image/jpeg";
    const qualityArgument = 0.92;
    let _size = _b1.size;
    if (_size <= maxSize) {
        console.log(`Starting size ${_size} is fine (below target size ${maxSize}`);
        return _b1;
    }
    console.log(`Starting size ${_size} too large (max is ${maxSize}) bytes.`);
    console.log(`Reduce size by scaling canvas - start size is W ${_c.width} x H ${_c.height}`);
    // compression wasn't enough, so let's resize until we're getting close
    let _old_size;
    let _old_c;
    if (false) {
        // experiments: we first cut it with quality argument (normalize)
        _b1 = await new Promise((resolve) => {
            _c.toBlob(resolve, imageType, qualityArgument);
        });
        console.log(`setting quality changed size from ${_size} to ${_b1.size}`);
        await createImageBitmap(_b1).then(bm => { _c.getContext('2d').drawImage(bm, 0, 0); });
        _size = _b1.size;
        // now we do a *single* big adjustment
        _c = scaleCanvas(_c, Math.sqrt(maxSize / _size));
        _old_c = _c;
        _b1 = await new Promise((resolve) => {
            _c.toBlob(resolve, imageType, qualityArgument);
        });
        _size = _b1.size;
        _old_size = _size;
        const t3 = new Date().getTime();
        console.log(`... reduced to W ${_c.width} x H ${_c.height} (to size ${_size}) ... total time ${t3 - t2} milliseconds`);
    }
    else {
        while (_size > maxSize) {
            _old_c = _c;
            _c = scaleCanvas(_c, .5);
            _b1 = await new Promise((resolve) => {
                _c.toBlob(resolve, imageType, qualityArgument);
            });
            _old_size = _size;
            _size = _b1.size;
            // workingDots();
            const t3 = new Date().getTime();
            console.log(`... reduced to W ${_c.width} x H ${_c.height} (to size ${_size}) ... total time ${t3 - t2} milliseconds`);
        }
    }
    // we assume that within this width interval, storage is roughly prop to area,
    // with a little tuning downwards
    let _ratio = (maxSize / _old_size) * 0.95; // overshoot a bit
    let _maxIteration = 12; // to be safe
    console.log("_old_c is:");
    console.log(_old_c);
    console.log(`... stepping back up to W ${_old_c.width} x H ${_old_c.height} and will then try scale ${_ratio.toFixed(4)}`);
    let _final_c;
    const t4 = new Date().getTime();
    do {
        _final_c = scaleCanvas(_old_c, Math.sqrt(_ratio) * 0.95); // always overshoot
        _b1 = await new Promise((resolve) => {
            _final_c.toBlob(resolve, imageType, qualityArgument);
            console.log(`(generating blob of requested type ${imageType})`);
        });
        // workingDots();
        console.log(`... fine-tuning to W ${_final_c.width} x H ${_final_c.height} (size ${_b1.size})`);
        _ratio *= (maxSize / _b1.size);
        const t5 = new Date().getTime();
        console.log(`... resulting _ratio is ${_ratio} ... total time here ${t5 - t4} milliseconds`);
        console.log(` ... we're within ${(Math.abs(_b1.size - maxSize) / maxSize)} of cap (${maxSize})`);
    } while (((_b1.size > maxSize) || ((Math.abs(_b1.size - maxSize) / maxSize) > 0.10)) && (--_maxIteration > 0)); // we're pretty tolerant here
    return _b1;
}
export async function restrictPhoto(sbImage, maxSize) {
    console.log("################################################################");
    console.log("#################### inside restrictPhoto() ####################");
    console.log("################################################################");
    const t0 = new Date().getTime();
    // imageType default should be 'image/jpeg'
    // qualityArgument should be 0.92 for jpeg and 0.8 for png (MDN default)
    maxSize = maxSize * 1024; // KB
    // let _c = await readPhoto(photo);
    let _c = await sbImage.img.then(() => sbImage.canvas);
    console.log("Got sbImage as:");
    console.log(sbImage);
    console.log("And got sbImage.canvas as:");
    console.log(_c);
    const t1 = new Date().getTime();
    console.log(`#### readPhoto took ${t1 - t0} milliseconds`);
    // let _b1 = await new Promise((resolve) => _c.blob.then((b) => resolve(b)));
    let _b1 = await sbImage.blob.then(() => sbImage.blob);
    console.log("got blob");
    console.log(_b1);
    // let _b1 = await new Promise((resolve) => {
    //   _c.toBlob(resolve, imageType, qualityArgument);
    // });
    const t2 = new Date().getTime();
    console.log(`#### getting photo into a blob took ${t2 - t1} milliseconds`);
    // workingDots();
    let _final_b1 = _restrictPhoto(maxSize, _c, _b1);
    // workingDots();
    console.log(`... ok looks like we're good now ... final size is ${_b1.size} (which is ${((_b1.size * 100) / maxSize).toFixed(2)}% of cap)`);
    // document.getElementById('the-original-image').width = _final_c.width;  // a bit of a hack
    const end = new Date().getTime();
    console.log(`#### restrictPhoto() took total ${end - t0} milliseconds`);
    return _final_b1;
}
// basically replaced by SBImage
// export async function readPhoto(photo) {
//   const canvas = document.createElement('canvas');
//   const img = document.createElement('img');
//   // create img element from File object
//   img.src = await new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.onload = (e) => resolve(e.target.result);
//     reader.readAsDataURL(photo);
//   });
//   await new Promise((resolve) => {
//     img.onload = resolve;
//   });
//   // console.log("img object");
//   // console.log(img);
//   // console.log("canvas object");
//   // console.log(canvas);
//   // draw image in canvas element
//   canvas.width = img.width;
//   canvas.height = img.height;
//   canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
//   return canvas;
// }
// let scaledCanvas = document.createElement('canvas');
export function scaleCanvas(canvas, scale) {
    var start = new Date().getTime();
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;
    // console.log(`#### scaledCanvas starting with W ${canvas.width} x H ${canvas.height}`);
    scaledCanvas
        .getContext('2d')
        .drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    // console.log(`#### scaledCanvas actual W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
    var end = new Date().getTime();
    // console.log(`#### scaleCanvas() took ${end - start} milliseconds`);
    console.log(`#### scaledCanvas scale ${scale} to target W ${scaledCanvas.width} x H ${scaledCanvas.height} took ${end - start} milliseconds`);
    return scaledCanvas;
}
export function padImage(image_buffer) {
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
    let _padding_array = [128];
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
    let final_data = utils._appendBuffer(image_buffer, _padding);
    final_data = utils._appendBuffer(final_data, new Uint32Array([image_size]).buffer);
    // console.log('AFTER PADDING: ', final_data.byteLength)
    return final_data;
}
export function unpadData(data_buffer) {
    // console.log(data_buffer, typeof data_buffer)
    const _size = new Uint32Array(data_buffer.slice(-4))[0];
    return data_buffer.slice(0, _size);
}
// let script_01 = 
//     `data:text/javascript,
//     function functionThatTakesLongTime(someArgument){
//         //There are obviously faster ways to do this, I made this function slow on purpose just for the example.
//         for(let i = 0; i < 1000000000; i++){
//             someArgument++;
//         }
//         return someArgument;
//     }
//     onmessage = function(event){    //This will be called when worker.postMessage is called in the outside code.
//         let foo = event.data;    //Get the argument that was passed from the outside code, in this case foo.
//         let result = functionThatTakesLongTime(foo);    //Find the result. This will take long time but it doesn't matter since it's called in the worker.
//         postMessage(result);    //Send the result to the outside code.
//     };
//     `;
let script_02 = `data:text/javascript,
    function fileToAB(file) {
      file.arrayBuffer().then((a) => postMessage(a, [a]));
    }
    onmessage = function(event){
        fileToAB(event.data);
    };
    `;
// code by Thomas Lochmatter, thomas.lochmatter@viereck.ch
// Returns an object with the width and height of the JPEG image
// stored in bytes, or null if the bytes do not represent a JPEG
// image.
function readJpegHeader(bytes) {
    // JPEG magick
    if (bytes[0] != 0xff)
        return;
    if (bytes[1] != 0xd8)
        return;
    // Go through all markers
    var pos = 2;
    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    while (pos + 4 < bytes.byteLength) {
        // Scan for the next start marker (if the image is corrupt, this marker may not be where it is expected)
        if (bytes[pos] != 0xff) {
            pos += 1;
            continue;
        }
        var type = bytes[pos + 1];
        // Short marker
        pos += 2;
        if (bytes[pos] == 0xff)
            continue;
        // SOFn marker
        var length = dv.getUint16(pos);
        if (pos + length > bytes.byteLength)
            return;
        if (length >= 7 && (type == 0xc0 || type == 0xc2)) {
            var data = {};
            data.progressive = type == 0xc2;
            data.bitDepth = bytes[pos + 2];
            data.height = dv.getUint16(pos + 3);
            data.width = dv.getUint16(pos + 5);
            data.components = bytes[pos + 7];
            return data;
        }
        // Other marker
        pos += length;
    }
    return;
}
export class SBImage {
    constructor(image) {
        this.image = image; // file
        var resolveAspectRatio;
        this.aspectRatio = new Promise((resolve) => {
            // block on getting width and height...
            resolveAspectRatio = resolve;
        });
        // Fetch the original image
        console.log("Fetching file:");
        console.log(image);
        this.imgURL = new Promise((resolve) => {
            const _self = this;
            const reader = image.stream().getReader();
            return new ReadableStream({
                start(controller) {
                    var foundSize = false;
                    return pump();
                    function pump() {
                        return reader.read().then(({ done, value }) => {
                            // When no more data needs to be consumed, close the stream
                            if (done) {
                                controller.close();
                                return;
                            }
                            // console.log("Got a chunk!");
                            // console.log(value);
                            // pull out size
                            if (!foundSize) {
                                foundSize = true;
                                // console.log("$$$$$$$ found first chunk")
                                const h = readJpegHeader(value);
                                // _self.width = value[165] * 256 + value[166];
                                // _self.height = value[163] * 256 + value[164];
                                // var width = value[165] * 256 + value[166];
                                // var height = value[163] * 256 + value[164];
                                if (h) {
                                    console.log("^^^^^^^^^^^^^^^^", h);
                                    _self.width = h.width;
                                    _self.height = h.height;
                                    console.log(`got the size of the image!!  ${_self.width} x ${_self.height}`);
                                    resolveAspectRatio(_self.width / _self.height);
                                }
                                else {
                                    console.log("PROBLEM ***** ... could not parse jpeg header");
                                }
                            }
                            // Enqueue the next data chunk into our target stream
                            controller.enqueue(value);
                            return pump();
                        });
                    }
                }
            });
        })
            // Create a new response out of the stream
            .then((stream) => new Response(stream))
            // Create an object URL for the response
            .then((response) => response.blob())
            .then((blob) => URL.createObjectURL(blob))
            // Update image
            .then((url) => {
            console.log("Finished getting 'url':");
            console.log(url);
            resolve(url);
        })
            .catch((err) => console.error(err));
        this.img = new Promise((resolve) => {
            const reader = new FileReader();
            const img = document.createElement('img');
            reader.onload = (e) => {
                img.src = e.target.result;
                resolve(img);
            };
            reader.readAsDataURL(this.image);
        });
        // this.canvas = new Promise((resolve) => {
        //   this.img.then((img) => {
        // 	const canvas = document.createElement('canvas'); 
        // 	canvas.width = img.width;
        // 	canvas.height = img.height;
        // 	canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        // 	console.log("resolved canvas object:");
        // 	console.log(canvas);
        // 	resolve(canvas);
        //   });
        // });
        // create a canvas and then wait for the correct size
        this.canvas = new Promise((resolve) => {
            this.aspectRatio.then((r) => {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                this.img.then((img) => canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height));
                // this will return right away with correctly-sized canvas
                resolve(canvas);
            });
        });
        // this.blob = new Promise((resolve) => {
        //   const imageType = "image/jpeg";
        //   const qualityArgument = 0.92;
        //   this.canvas.then((canvas) => canvas.toBlob(resolve, imageType, qualityArgument));
        // });
        this.blob = new Promise((resolve) => {
            // spin up worker
            let worker = new Worker(script_02);
            worker.onmessage = (event) => {
                console.log("Got blob from worker:");
                console.log(event.data);
                resolve(new Blob([event.data])); // convert arraybuffer to blob
            };
            worker.postMessage(image);
        });
        // this requests some worker to load the file into a sharedarraybuffer
        this.imageSAB = doImageTask(['loadSB', image], false);
        // // simple worker template
        // this.w = new Promise((resolve) => {
        //   // spin up worker
        //   let worker = new Worker(script_01);
        //   worker.onmessage = (event) => {
        // 	console.log(`Got result from worker: ${event.data}`);
        // 	resolve(event.data);
        //   }
        //   worker.postMessage(42); // kick it off
        // });
        // this.canvas = new Promise((resolve) => {
        //   const canvas = document.createElement('canvas');
        //   this.img.then((img) => {
        // 	canvas.width = img.width;
        // 	canvas.height = img.height;
        // 	canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        // 	resolve(canvas);
        //   });
        // });
    }
    loadToCanvas(canvas) {
        return new Promise((resolve) => {
            this.aspectRatio.then((r) => {
                console.log("~~~~~~~~~~~~~~~~ got WxH", this.width, this.height);
                canvas.width = this.width;
                canvas.height = this.height;
                this.imageSAB.then((imageSAB) => {
                    if (OffscreenCanvas) {
                        console.log("%%%%%%%%%%%%%%%% we are here");
                        console.log(imageSAB);
                        // const canvas = document.createElement('canvas'); // test to give it from caller
                        // var ctx = canvas.getContext('2d');
                        // var imageData = ctx.createImageData(400, 400);
                        const offscreen = canvas.transferControlToOffscreen();
                        // const ctx = offscreen.getContext('2d');
                        // doImageTask(['testCanvas', imageData.data.buffer], [imageData.data.buffer]).then((m) => console.log(m));
                        doImageTask(['testCanvas', offscreen, imageSAB], [offscreen]).then((m) => {
                            console.log("**************** Returned message:", m);
                            console.log("**************** offscreen:", canvas);
                            console.log("**************** offscreen:", offscreen);
                            resolve(canvas);
                        });
                    }
                    else {
                        console.log("**************** THIS feature only works with OffscreenCanvas");
                        console.log("                 (TODO: make the code work as promise as fallback");
                    }
                });
            });
        });
    }
}
// we need this so it can be packaged
export class BlobWorker extends Worker {
    constructor(worker, i) {
        const code = worker.toString();
        const blob = new Blob([`(${code})(${i})`]);
        return new Worker(URL.createObjectURL(blob));
    }
}
let image_workers = [];
let next_worker = 0;
let max_workers = window.navigator.hardwareConcurrency;
console.log(`setting up ${max_workers} image helper workers`);
// const IW_code = _restrictPhoto.toString();
// const IW_blob = new Blob([`${IW_code}`]);
// const IW_url = URL.createObjectURL(IW_blob);
// console.log("%%%%%%%%%%%%%%%% IW_code:", IW_code);
for (let i = 0; i < max_workers; i++) {
    let newWorker = {
        worker: new BlobWorker(ImageWorker, i),
        i: i,
        broken: false // tracks if there's a problem
    };
    image_workers.push(newWorker);
}
function doImageTask(vars, transfer) {
    console.log("doImageTask() - vars are:");
    console.log(vars);
    var i = next_worker;
    next_worker = (next_worker + 1) % max_workers;
    var instance = image_workers[i].worker;
    return new Promise(function (resolve, reject) {
        // we pick one, rotating
        console.log(`Passing ${vars} on to ${next_worker}`);
        instance.onmessage = function (m) {
            console.log(`[${i}] finished finished ... returning with:`);
            console.log(m);
            resolve(m.data);
        };
        try {
            if (transfer) {
                instance.postMessage(vars, transfer);
            }
            else {
                instance.postMessage(vars);
            }
        }
        catch (error) {
            console.error(`Failed to send task to worker ${i}`);
            console.error(error);
            reject("failed");
        }
    });
}
// export function indexFile(ab) {
//   // first file it sees is done "locally"
//   if (!window.g_t_ndx) {
//     window.g_t_ndx = {}; // otherwise race condition
//     return new Promise(function (resolve, reject) {
//       var p = (new Blob([ab])).text();
//       p.then((s) => {
//         console.log("indexFile() - got the string (file)");
//         // console.log(s.slice(0, 200) + "...");
//         var t = s.match(/([^.!?]+[.!?]+)|([^.!?]+$)/g);
//         window.g_t = t;
//         console.log("array should be in g_t ... ");
//         var index = new Index();
//         t.forEach((item, i) => index.add(i, item));
//         window.g_t_ndx = index;
//         console.log("index should be in window.g_t_ndx");
//         resolve(index); // TODO - this needs to be same blob format as from web worker
//       });
//     });
//   } else {
//     // do first so there's no race condition
//     var i = next_worker;
//     next_worker = (next_worker + 1) % max_workers;
//     var instance = search_workers[i].worker;
//     return new Promise(function (resolve, reject) {
//       // we pick one, rotating
//       // var instance = new BlobWorker(IndexWorker);
//       if (ab.byteLength > 0) {
// 	console.log(`got a blob of size ${ab.byteLength} sending to worker ${next_worker}`);
// 	instance.onmessage = function(m) {
// 	  console.log(`[${i}] finished indexing ... returning buffer`);
// 	  // console.log(m);
// 	  resolve(m);
// 	}
// 	try {
// 	  instance.postMessage(ab, [ab]);
// 	} catch {
// 	  console.error(`Failed to send task to worker ${i}`);
// 	  reject("failed");
// 	}
//       } else {
// 	reject(`[${i}] did not get anything to work with`);
//       }
//     });
//   }
// }
//#endregion
/**
 * SBFile
 * @class
 * @constructor
 * @public
 */
export class SBFile extends SBMessage {
    // encrypted = false
    // contents: string = ''
    // senderPubKey: CryptoKey
    // sign: Promise<string>
    data = {
        previewImage: '',
        fullImage: ''
    };
    // (now extending SBMessage)
    image = '';
    image_sign = '';
    imageMetaData = {};
    imageMetadata_sign = '';
    // file is an instance of File
    constructor(channel, file /* signKey: CryptoKey, key: CryptoKey */) {
        super(channel, '');
        // all is TODO with new image code
        // this.senderPubKey = key;
        // ... done by SBMessage parent?
        // this.sign = sbCrypto.sign(channel.keys.channelSignKey, this.contents);
        if (file.type.match(/^image/i)) {
            this.#asImage(file, signKey);
        }
        else {
            throw new Error('Unsupported file type: ' + file.type);
        }
    }
    async #asImage(image, signKey) {
        // TODO: the getfile/restrict should be done by SBImage etc, other stuff is SB messaging
        // throw new Error(`#asImage() needs carryover from SBImage etc (${image}, ${signKey})`)
        this.data.previewImage = this.#padImage(await (await this.#restrictPhoto(image, 4096, 'image/jpeg', 0.92)).arrayBuffer());
        const previewHash = await this.#generateImageHash(this.data.previewImage);
        this.data.fullImage = image.byteLength > 15728640 ? this.#padImage(await (await this.#restrictPhoto(image, 15360, 'image/jpeg', 0.92)).arrayBuffer()) : this.#padImage(image);
        const fullHash = await this.#generateImageHash(this.data.fullImage);
        this.image = await this.#getFileData(await this.#restrictPhoto(image, 15, 'image/jpeg', 0.92), 'url');
        this.image_sign = await sbCrypto.sign(signKey, this.image);
        this.imageMetaData = JSON.stringify({
            imageId: fullHash.id,
            previewId: previewHash.id,
            imageKey: fullHash.key,
            previewKey: previewHash.key
        });
        this.imageMetadata_sign = await sbCrypto.sign(signKey, this.imageMetaData);
    }
    #padImage(image_buffer) {
        let _sizes = [128, 256, 512, 1024, 2048, 4096]; // in KB
        _sizes = _sizes.map((size) => size * 1024);
        const image_size = image_buffer.byteLength;
        // console.log('BEFORE PADDING: ', image_size)
        let _target = 0;
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
    }
    async #restrictPhoto(photo, maxSize, // in KB
    imageType, qualityArgument) {
        // latest and greatest JS version is in:
        // 384-snackabra-webclient/src/utils/ImageProcessor.js
        throw new Error('restrictPhoto() needs TS version');
        return null;
    }
}
/**
 * Channel
 *
 * @class
 * @constructor
 * @public
 */
class Channel extends SB384 {
    ready;
    channelReady;
    #readyFlag = false;
    #sbServer;
    motd = '';
    locked = false;
    owner = false;
    admin = false;
    verifiedGuest = false;
    userName = '';
    #channelId;
    #api;
    /*
     * Channel()
     * Join a channel, returns channel object.
     *
     * Currently, you must have an identity when connecting, because every single
     * message is signed by sender. TODO is to look at how to provide a 'listening'
     * mode on channels.
     *
     * @param {Snackabra} which server to join
     * @param {string} channelId (the :term:`Channel Name`) to find on that server
     * @param {Identity} the identity which you want to present (defaults to server default)
     */
    constructor(sbServer, key, channelId) {
        super(key);
        this.#sbServer = sbServer;
        this.#api = new ChannelApi(this);
        // console.log("setting Channel.ready")
        this.ready = new Promise((resolve) => {
            if (channelId) {
                this.#channelId = channelId;
                this.#readyFlag = true;
                resolve(this);
            }
            else {
                super.ready.then(() => {
                    this.#channelId = this.ownerChannelId;
                    this.#readyFlag = true;
                    resolve(this);
                });
            }
        });
        this.channelReady = this.ready;
        // console.log("Channel.ready set to:")
        // console.log(this.ready)
    }
    get api() { return this.#api; }
    get sbServer() { return this.#sbServer; }
    get channelId() { return this.#channelId; }
    get readyFlag() { return this.#readyFlag; }
} /* Channel */
__decorate([
    Memoize,
    Ready
], Channel.prototype, "channelId", null);
/**
 *
 * ChannelSocket
 *
 *  Class managing connections
 */
class ChannelSocket extends Channel {
    ready;
    #readyFlag = false;
    // #channelId: string
    #ws;
    #keys;
    adminData; // TODO: add getter
    // #queue: Array<SBMessage> = [];
    #onMessage; // the user message handler
    #ack = [];
    /* ChannelSocket */
    constructor(sbServer, onMessage, key, channelId) {
        // console.log("----ChannelSocket.constructor() start:")
        // console.log(sbServer)
        // console.log("----ChannelSocket.constructor() ... end")
        super(sbServer, key, channelId /*, identity ? identity : new Identity() */); // initialize 'channel' parent       
        const url = sbServer.options.channel_ws + '/api/room/' + this.channelId + '/websocket';
        this.#onMessage = onMessage;
        this.#ws = {
            url: url,
            websocket: new WebSocket(url),
            ready: false,
            closed: false,
            timeout: 30000
        };
        // console.log("setting ChannelSocket.ready")
        this.ready = this.#readyPromise();
    }
    /* ChannelSocket
       internal to channelsocket: this always gets all messages; certain
      protocol aspects are low-level (independent of 'app') and those
      are handled here. others are never delivered 'raw', for example
      encrypted messages are always decrypted */
    #processMessage(m) {
        // console.log("got raw message:")
        // console.log(m)
        const data = jsonParseWrapper(m, 'L1489');
        // console.log("... json unwrapped:")
        // console.log(data)
        if (data.ack) {
            const r = this.#ack[data._id];
            if (r) {
                console.log(`++++++++ found matching ack for id ${data._id} (on first check?)`);
                delete this.#ack[data._id];
                r("success"); // resolve
            }
        }
        else if (data.nack) {
            console.error('Nack received');
            this.#ws.closed = true;
            // if (this.#websocket) this.#websocket.close()
        }
        else if (typeof this.#onMessage === 'function') {
            const message = data;
            // 'id' will be first property
            // console.log("++++++++ ChannelSocket.#processMessage():")
            const id = Object.keys(message)[0];
            // console.log("++++++++ #processMessage: note .. 'id' was:")
            // console.log(id)
            // TODO: we should regex on Object.entries(message)[0] but we can't quite yet because
            //       some versions of channel server return 'undefined' as channel name
            // let unwrapped: string = ''
            // console.log("++++++++ #processMessage: ... parsing ...:")
            // console.log(message)
            // console.log(Object.entries(message))
            try {
                // console.log("++++++++ #processMessage: will attempt to decipher ...:")
                if (Object.keys(Object.entries(message)[0][1])[0] === 'encrypted_contents') {
                    // TODO: parse out ID and time stamp, regex:
                    const encryptedContents = Object.entries(message)[0][1];
                    // console.log(encryptedContents)
                    sbCrypto.unwrap(this.keys.encryptionKey, encryptedContents.encrypted_contents, 'string').then((unwrapped) => {
                        // console.log("++++++++ #processMessage: unwrapped:")
                        // console.log(unwrapped)
                        this.#onMessage(unwrapped);
                    });
                }
                else if (Object.entries(message)[0][1].type === 'ack') {
                    // console.log("++++++++ Received 'ack'")
                    const ack_id = Object.entries(message)[0][1]._id;
                    const r = this.#ack[ack_id];
                    if (r) {
                        // console.log(`++++++++ found matching ack for id ${ack_id}`)
                        // console.log(r)
                        delete this.#ack[ack_id];
                        r("success"); // resolve
                    }
                    else {
                        console.log(`++++++++ did NOT find matching ack for id ${ack_id}`);
                    }
                }
                else {
                    // 
                    // TODO: other message types (low level) are parsed here ...
                    //
                    console.log("++++++++ #processMessage: can't decipher message, passing along unchanged:");
                    console.log(message);
                    this.#onMessage(message); // 'as string' ?
                }
            }
            catch (e) {
                console.log(`++++++++ #processMessage: caught exception while decyphering (${e}), passing it along unchanged`);
                this.#onMessage(message); // 'as string' ?
                // console.error(`#processmessage: cannot handle locked channels yet (${e})`)
                // TODO: locked key might never resolve (if we don't have it)
                // unwrapped = await sbCrypto.unwrap(this.keys.lockedKey, message.encrypted_contents, 'string')
            }
            // TODO: re-enable local storage of messages
            // _localStorage.setItem(this.#channel.channelId + '_lastSeenMessage', id.slice(this.#channel.channelId.length));
            // if (message._id) _localStorage.setItem(this.#channel.channelId + '_lastSeenMessage', message._id)
            // return JSON.stringify(unwrapped);
        }
        else {
            _sb_exception('ChannelSocket', 'received message but there is no handler');
        }
    }
    /* ChannelSocket */
    #readyPromise() {
        const url = this.#ws.url;
        let backlog = [];
        let processingKeys = false;
        return new Promise((resolve, reject) => {
            try {
                // if (this.#ws.websocket) this.#ws.websocket.close() // keep clean
                if (this.#ws.websocket.readyState === 3) {
                    // it's been closed
                    this.#ws.websocket = new WebSocket(url);
                }
                else if (this.#ws.websocket.readyState === 2) {
                    console.log("STRANGE - trying to use a ChannelSocket that is in the process of closing ...");
                    this.#ws.websocket = new WebSocket(url);
                }
                this.#ws.websocket.addEventListener('open', () => {
                    this.#ws.closed = false;
                    this.channelReady.then(() => {
                        // console.log("++++++++ readyPromise() has identity:")
                        // console.log(id)
                        this.#ws.init = { name: JSON.stringify(this.exportable_pubKey) };
                        this.#ws.init = { name: JSON.stringify(this.exportable_pubKey) };
                        // console.log("++++++++ readyPromise() constructed init:")
                        // console.log(this.#ws.init)
                        this.#ws.websocket.send(JSON.stringify(this.#ws.init));
                        // note: not ready until channel responds with keys
                    });
                });
                this.#ws.websocket.addEventListener('message', (e) => {
                    // the 'root' administrative messages are processed first before
                    // anything else can be processed, when this is done it self-replaces
                    // console.log("++++++++ readyPromise() received ChannelKeysMessage:")
                    // console.log(e)
                    if (processingKeys) {
                        backlog.push(e.data);
                        // console.log("++++++++ readyPromise() pushing message to backlog:")
                        // console.log(e)
                        return;
                    }
                    processingKeys = true; // helps not drop messages
                    // const message: ChannelKeysMessage = deserializeMessage(e.data, 'channelKeys')! as ChannelKeysMessage
                    const message = JSON.parse(e.data);
                    // console.log(message)
                    _sb_assert(message.ready, 'got roomKeys but channel reports it is not ready (?)');
                    this.motd = message.motd;
                    this.locked = message.roomLocked;
                    Promise.all([
                        sbCrypto.importKey('jwk', JSON.parse(message.keys.ownerKey), 'ECDH', false, []),
                        sbCrypto.importKey('jwk', JSON.parse(message.keys.encryptionKey), 'AES', false, ['encrypt', 'decrypt']),
                        sbCrypto.importKey('jwk', JSON.parse(message.keys.signKey), 'ECDH', true, ['deriveKey']),
                        sbCrypto.importKey('jwk', sbCrypto.extractPubKey(JSON.parse(message.keys.signKey)), 'ECDH', true, []),
                        // this.identity!.privateKey // we know we have id by now
                    ]).then((v) => {
                        // console.log("++++++++ readyPromise() processed first batch of keys")
                        const ownerKey = v[0];
                        const encryptionKey = v[1];
                        const signKey = v[2];
                        const publicSignKey = v[3];
                        const privateKey = this.privateKey;
                        Promise.all([
                            sbCrypto.deriveKey(privateKey, publicSignKey, 'HMAC', false, ['sign', 'verify'])
                        ]).then((w) => {
                            // console.log("++++++++ readyPromise() second phase of key processing")
                            const channelSignKey = w[0];
                            this.#keys = {
                                ownerKey: ownerKey,
                                encryptionKey: encryptionKey,
                                signKey: signKey,
                                channelSignKey: channelSignKey
                            };
                            // once we have keys we can also query admin info
                            const adminData = this.api.getAdminData();
                            // console.log("++++++++ readyPromise() getting adminData:")
                            // console.log(adminData)
                            this.adminData = adminData;
                            // this causes queued messages to be processed ahead of ones from new callbacks 
                            if (backlog.length > 0) {
                                // console.log("++++++++ readyPromise() we are queuing up a microtask for message processing")
                                queueMicrotask(() => {
                                    console.log("++++++++ readyPromise() inside micro task");
                                    for (let d in backlog) {
                                        // console.log("++++++++ pulling this message from the backlog:")
                                        // console.log(e)
                                        this.#processMessage(d);
                                    }
                                });
                            }
                            else {
                                // console.log("++++++++ readyPromise() there were NO messages queued up")
                            }
                            // once we've gotten our keys, we substitute the message handler
                            // console.log("++++++++ readyPromise() changing onMessage to processMessage")
                            this.#ws.websocket.addEventListener('message', (e) => this.#processMessage(e.data));
                            // and now we are ready!
                            this.#readyFlag = true;
                            // console.log("++++++++ readyPromise() all done - resolving!")
                            resolve(this);
                        });
                    });
                });
                this.#ws.websocket.addEventListener('close', (e) => {
                    this.#ws.closed = true;
                    if (!e.wasClean) {
                        console.log('ChannelSocket() was closed (and NOT cleanly): ', e.reason);
                    }
                    else {
                        console.log('ChannelSocket() was closed (cleanly): ', e.reason);
                    }
                    reject('wbSocket() closed before it was opened (?)');
                });
                this.#ws.websocket.addEventListener('error', (e) => {
                    this.#ws.closed = true;
                    console.log('ChannelSocket() error: ', e);
                    reject('ChannelSocket creation error (see log)');
                });
            }
            catch (e) {
                this.#ws.closed = true;
                console.error(e);
                reject('failed to create ChannelSocket, see log');
            }
        });
    }
    // @Memoize @Ready get channelId(): string { return this.#channelId }
    set onMessage(f) {
        this.#onMessage = f;
    }
    get onMessage() {
        return this.#onMessage;
    }
    /**
     * ChannelSocket.keys
     *
     * Will throw an exception if keys are unknown or not yet loaded
     */
    get keys() {
        if (!this.#keys) {
            _sb_assert(false, "ChannelSocket.keys: not initialized (?)");
        }
        return (this.#keys);
    }
    /**
     * ChannelSocket.sendSbObject()
     *
     * Send SB object (file) on channel socket
     */
    // todo - move to API?
    async sendSbObject(file) {
        return (this.send(file));
        // this.ready.then(() => {
        //   this.#wrap(file /* , this.#keys!.encryptionKey */).then((payload) => this.send(payload));
        // } else {
        //   this.#queue.push(file);
        // }
    }
    /**
      * ChannelSocket.send()
      *
      * Returns a promise that resolves to "success" when sent,
      * or an error message if it fails.
      */
    send(msg) {
        let message;
        if (typeof msg === 'string') {
            message = new SBMessage(this, msg);
        }
        else if (msg instanceof SBMessage) {
            message = msg;
        }
        else {
            // SBFile for example
            _sb_exception("ChannelSocket.send()", "unknown parameter type");
        }
        // for future inspiration here are more thoughts on making this more iron clad:
        // https://stackoverflow.com/questions/29881957/websocket-connection-timeout
        // console.log("++++++++ ChannelSocket.send() this message: ")
        // console.log(message)
        if (this.#ws.closed) {
            // console.info("send() triggered reset of #readyPromise() (normal)")
            this.ready = this.#readyPromise(); // possible reset of ready 
        }
        return new Promise((resolve, reject) => {
            this.ready.then(() => {
                if (!this.#readyFlag)
                    reject("ChannelSocket.send() is confused - ready or not?");
                switch (this.#ws.websocket.readyState) {
                    case 1: // OPEN
                        sbCrypto.wrap(this.keys.encryptionKey, JSON.stringify(message.contents), 'string').then((wrappedMessage) => {
                            // console.log("ChannelSocket.send():")
                            // console.log(wrappedMessage)
                            const m = JSON.stringify({ encrypted_contents: wrappedMessage });
                            // console.log("++++++++ ChannelSocket.send() got this from wrap:")
                            // console.log(m)
                            // console.log("++++++++ ChannelSocket.send() then got this from JSON.stringify:")
                            // console.log(wrappedMessage)
                            crypto.subtle.digest('SHA-256', new TextEncoder().encode(m)).then((hash) => {
                                const _id = arrayBufferToBase64(hash);
                                const ackPayload = { timestamp: Date.now(), type: 'ack', _id: _id };
                                this.#ack[_id] = resolve;
                                // console.log(`++++++++ ChannelSocket.send() this message: '${m}' `)
                                this.#ws.websocket.send(m);
                                // TODO: update protocol so server acks on message
                                this.#ws.websocket.send(JSON.stringify(ackPayload));
                                setTimeout(() => {
                                    if (this.#ack[_id]) {
                                        delete this.#ack[_id];
                                        const msg = `Websocket request timed out (no ack) after ${this.#ws.timeout}ms (${_id})`;
                                        console.error(msg);
                                        reject(msg);
                                    }
                                    else {
                                        // normal behavior
                                        // console.log("++++++++ ChannelSocket.send() completed sending!")
                                        resolve("success");
                                    }
                                }, this.#ws.timeout);
                            });
                        });
                        break;
                    case 3: // CLOSED
                    case 0: // CONNECTING
                    case 2: // CLOSING
                        const errMsg = 'socket not OPEN - either CLOSED or in the state of CONNECTING/CLOSING';
                        _sb_exception('ChannelSocket', errMsg);
                        reject(errMsg);
                }
            });
        });
    }
} // ChannelSocket
__decorate([
    Ready
], ChannelSocket.prototype, "send", null);
/**
 * Storage API
 * @class
 * @constructor
 * @public
 */
class StorageApi {
    server;
    constructor(server) {
        this.server = server + '/api/v1';
    }
    /**
     * StorageApi.saveFile()
     */
    async saveFile(channel, sbFile) {
        // const metaData: Dictionary = jsonParseWrapper(sbFile.imageMetaData, 'L1732');
        const metaData = sbFile.imageMetaData;
        const fullStorePromise = this.storeImage(sbFile.data.fullImage, metaData.imageId, metaData.imageKey, 'f');
        const previewStorePromise = this.storeImage(sbFile.data.previewImage, metaData.previewId, metaData.previewKey, 'p');
        // TODO: We should probably discuss this in more detail
        Promise.all([fullStorePromise, previewStorePromise]).then((results) => {
            results.forEach((controlData) => {
                // @ts-ignore
                channel.sendSbObject({ ...controlData, control: true });
            });
            // psm: need to generalize classes ... sbFile and sbImage descent from sbMessage?
            // channel.sendSbObject(sbFile);
            channel.send(sbFile);
        });
    }
    /**
     * StorageApi().getFileKey
     */
    async #getFileKey(fileHash, _salt) {
        const keyMaterial = await sbCrypto.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
        // @psm TODO - Support deriving from PBKDF2 in deriveKey function
        const key = await crypto.subtle.deriveKey({
            'name': 'PBKDF2',
            'salt': _salt,
            'iterations': 100000,
            'hash': 'SHA-256'
        }, keyMaterial, { 'name': 'AES-GCM', 'length': 256 }, true, ['encrypt', 'decrypt']);
        // return key;
        return key;
    }
    /**
     * StorageApi().storeRequest
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
     * StorageApi().storeData()
     */
    storeData(type, fileId, encrypt_data, storageToken, data) {
        return new Promise((resolve, reject) => {
            fetch(this.server + '/storeData?type=' + type + '&key=' + encodeURIComponent(fileId), {
                // psm: need to clean up these types
                method: 'POST',
                body: assemblePayload({
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
     * StorageApi().storeImage()
     */
    storeImage(image, image_id, keyData, type) {
        // latest and greatest JS version is in:
        // 384-snackabra-webclient/src/utils/ImageProcessor.js
        throw new Error('Storage() needs TS version');
    }
    /**
     * StorageApi().fetchData()
     */
    fetchData(msgId, verificationToken) {
        if (!verificationToken) {
            _sb_exception('StorageApi.fetchData()', 'verificationToken is undefined');
        }
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
     * StorageApi().unpadData()
     */
    #unpadData(data_buffer) {
        const _size = new Uint32Array(data_buffer.slice(-4))[0];
        return data_buffer.slice(0, _size);
    }
    /**
     * StorageApi().retrieveData()
     * retrieves an object from storage
     */
    async retrieveData(msgId, messages, controlMessages) {
        console.log("... need to code up retrieveData() with new typing ..");
        console.log(msgId);
        console.log(messages);
        console.log(controlMessages);
        console.error("... need to code up retrieveData() with new typing ..");
        const imageMetaData = messages.find((msg) => msg._id === msgId).imageMetaData;
        const image_id = imageMetaData.previewId;
        // const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.id && ctrl_msg.id.startsWith(image_id));
        const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.id && ctrl_msg.id == image_id);
        if (!control_msg) {
            return { 'error': 'Failed to fetch data - missing control message for that image' };
        }
        // const imageFetch = await this.fetchData(control_msg.id, control_msg.verificationToken);
        const imageFetch = await this.fetchData(control_msg.id, control_msg.verificationToken);
        // extracts from binary format
        const data = extractPayload(imageFetch);
        const iv = data.iv;
        const salt = data.salt;
        const image_key = await this.#getFileKey(imageMetaData.previewKey, salt);
        const encrypted_image = data.image;
        const padded_img = await sbCrypto.unwrap(image_key, { content: encrypted_image, iv: iv }, 'arrayBuffer');
        const img = this.#unpadData(padded_img);
        // psm: issues should throw i think
        // if (img.error) {
        //   console.error('(Image error: ' + img.error + ')');
        //   throw new Error('Failed to fetch data - authentication or formatting error');
        // }
        return { 'url': 'data:image/jpeg;base64,' + arrayBufferToBase64(img) };
    }
    /**
     * StorageApi().retrieveDataFromMessage()
     */
    async retrieveDataFromMessage(message, controlMessages) {
        const imageMetaData = typeof message.imageMetaData === 'string' ? jsonParseWrapper(message.imageMetaData, 'L1893') : message.imageMetaData;
        const image_id = imageMetaData.previewId;
        const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.id && ctrl_msg.id === image_id);
        if (!control_msg) {
            return { 'error': 'Failed to fetch data - missing control message for that image' };
        }
        const imageFetch = await this.fetchData(control_msg.id, control_msg.verificationToken);
        const data = extractPayload(imageFetch);
        const iv = data.iv;
        const salt = data.salt;
        const image_key = await this.#getFileKey(imageMetaData.previewKey, salt);
        const encrypted_image = data.image;
        const padded_img = await sbCrypto.unwrap(image_key, { content: encrypted_image, iv: iv }, 'arrayBuffer');
        const img = this.#unpadData(padded_img);
        // if (img.error) {
        //   console.error('(Image error: ' + img.error + ')');
        //   throw new Error('Failed to fetch data - authentication or formatting error');
        // }
        return { 'url': 'data:image/jpeg;base64,' + arrayBufferToBase64(img) };
    }
}
/**
 * Channel API
 * @class
 * @constructor
 * @public
 */
class ChannelApi {
    #sbServer;
    #server; // channel server
    #channel;
    #channelApi;
    #channelServer;
    // #payload: Payload;
    constructor(/* sbServer: Snackabra, */ channel /*, identity?: Identity */) {
        this.#channel = channel;
        this.#sbServer = this.#channel.sbServer;
        this.#server = this.#sbServer.options.channel_server;
        // this.#payload = new Payload()
        this.#channelApi = this.#server + '/api/';
        this.#channelServer = this.#server + '/api/room/';
        // if (identity) this.#identity = identity!
    }
    /**
     * getLastMessageTimes
     */
    getLastMessageTimes() {
        return new Promise((resolve, reject) => {
            fetch(this.#channelApi + '/getLastMessageTimes', {
                method: 'POST', body: JSON.stringify([this.#channel.channelId])
            }).then((response) => {
                if (!response.ok) {
                    reject(new Error('Network response was not OK'));
                }
                return response.json();
            }).then((message_times) => {
                resolve(message_times[this.#channel.channelId]);
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
            fetch(this.#channelServer + this.#channel.channelId + '/oldMessages?currentMessagesLength=' + currentMessagesLength, {
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
            fetch(this.#channelServer + this.#channel.channelId + '/updateRoomCapacity?capacity=' + capacity, {
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
            fetch(this.#channelServer + this.#channel.channelId + '/getRoomCapacity', {
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
            fetch(this.#channelServer + this.#channel.channelId + '/getJoinRequests', {
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
            fetch(this.#channelServer + this.#channel.channelId + '/roomLocked', {
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
            fetch(this.#channelServer + this.#channel.channelId + '/motd', {
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
        return new Promise(async (resolve, reject) => {
            //if (this.#channel.owner) {
            const token_data = new Date().getTime().toString();
            const token_sign = await sbCrypto.sign(this.#channel.keys.channelSignKey, token_data);
            fetch(this.#channelServer + this.#channel.channelId + '/getAdminData', {
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
        });
    }
    /**
     * downloadData
     */
    downloadData() {
        return new Promise((resolve, reject) => {
            fetch(this.#channelServer + this.#channel.channelId + '/downloadData', {
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
            fetch(this.#channelServer + this.#channel.channelId + '/uploadRoom', {
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
            fetch(this.#channelServer + this.#channel.channelId + '/authorizeRoom', {
                method: 'POST',
                body: JSON.stringify({ roomId: this.#channel.channelId, SERVER_SECRET: serverSecret, ownerKey: ownerPublicKey })
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
    // we post our pub key if we're first
    postPubKey(_exportable_pubKey) {
        return new Promise((resolve, reject) => {
            fetch(this.#channelServer + this.#channel.channelId + '/postPubKey?type=guestKey', {
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
            fetch(this.#channelServer + this.#channel.channelId + '/storageRequest?size=' + byteLength, {
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
/**
 * Augments IndexedDB to be used as a KV to easily
 * replace _localStorage for larger and more complex datasets
 *
 * @class
 * @constructor
 * @public
 */
class IndexedKV {
    db;
    events = new MessageBus();
    options = {
        db: 'MyDB', table: 'default', onReady: () => {
            return;
        },
    };
    // psm: override doesn't seem to be used
    // mtg: we have the option to expose this elswhere, but it might be better to break this out into a helper
    constructor( /* options: IndexedKVOptions */) {
        // psm: hm?
        this.options = Object.assign(this.options, this.options);
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
            this.#useDatabase();
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
    #useDatabase() {
        this.db.onversionchange = () => {
            this.db.close();
            console.info('A new version of this page is ready. Please reload or close this tab!');
        };
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
                const data = event?.target?.result;
                if (data?.value) {
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
                const data = event?.target?.result;
                if (data?.value) {
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
                const data = event?.target?.result;
                if (data?.value) {
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
const _localStorage = new IndexedKV();
class Snackabra {
    #listOfChannels = [];
    #storage;
    #channel;
    // #defaultIdentity = new Identity();
    // defaultIdentity?: Identity
    options = {
        channel_server: '',
        channel_ws: '',
        storage_server: ''
    };
    /**
     * Constructor expects an object with the names of the matching servers, for example
     * (below shows the miniflare local dev config). Note that 'new Snackabra()' is
     * guaranteed synchronous, so can be 'used' right away.
     *
     *
     * ::
     *
     *     {
     *       channel_server: 'http://127.0.0.1:4001',
     *       channel_ws: 'ws://127.0.0.1:4001',
     *       storage_server: 'http://127.0.0.1:4000'
     *     }
     *
     * @param args {SnackabraOptions} interface
     *
     *
     */
    constructor(args) {
        _sb_assert(args, 'Snackabra(args) - missing args');
        try {
            this.options = Object.assign(this.options, {
                channel_server: args.channel_server,
                channel_ws: args.channel_ws,
                storage_server: args.storage_server
            });
            this.#storage = new StorageApi(args.storage_server);
        }
        catch (e) {
            if (e.hasOwnProperty('message')) {
                _sb_exception('Snackabra.constructor()', e.message);
            }
            else {
                _sb_exception('Snackabra.constructor()', 'Unknown exception');
            }
        }
    }
    /**
     * Snackabra.connect()
     *
     * Connects to :term:`Channel Name` on this SB config.
     * Returns a (promise to the) channel (socket) object
     *
     * @param {string} channelId - channel name
     * @param {Identity} identity - default identity for all messages
     */
    connect(onMessage, key, channelId /*, identity?: SB384 */) {
        return new Promise((resolve, reject) => {
            const c = new ChannelSocket(this, onMessage, key, channelId);
            this.#listOfChannels.push(c);
            resolve(c);
        });
    }
    /**
     * Snackabra.create()
     *
     * Creates a new channel. Currently uses trivial authentication.
     * Returns the :term:`Channel Name`. Note that this does not
     * create a channel object, e.g. does not make a connection.
     * Therefore you need
     * (TODO: token-based approval of storage spend)
     */
    create(serverSecret, keys) {
        return new Promise(async (resolve, reject) => {
            try {
                const owner384 = new SB384(keys);
                const ownerKeyPair = await owner384.ready.then((x) => x.keyPair);
                // const ownerKeyPair: CryptoKeyPair = await crypto.subtle.generateKey({
                //   name: 'ECDH',
                //   namedCurve: 'P-384'
                // }, true, ['deriveKey']);
                const exportable_privateKey = await crypto.subtle.exportKey('jwk', ownerKeyPair.privateKey);
                const exportable_pubKey = await crypto.subtle.exportKey('jwk', ownerKeyPair.publicKey);
                // const channelId: string = await this.#generateRoomId(exportable_pubKey.x, exportable_pubKey.y);
                const channelId = owner384.ownerChannelId;
                const encryptionKey = await crypto.subtle.generateKey({
                    name: 'AES-GCM',
                    length: 256
                }, true, ['encrypt', 'decrypt']);
                const exportable_encryptionKey = await crypto.subtle.exportKey('jwk', encryptionKey);
                const signKeyPair = await crypto.subtle.generateKey({
                    name: 'ECDH', namedCurve: 'P-384'
                }, true, ['deriveKey']);
                const exportable_signKey = await crypto.subtle.exportKey('jwk', signKeyPair.privateKey);
                const channelData = {
                    roomId: channelId,
                    ownerKey: JSON.stringify(exportable_pubKey),
                    encryptionKey: JSON.stringify(exportable_encryptionKey),
                    signKey: JSON.stringify(exportable_signKey),
                    SERVER_SECRET: serverSecret
                };
                const data = new TextEncoder().encode(JSON.stringify(channelData));
                let resp = await fetch(this.options.channel_server + '/api/room/' + channelId + '/uploadRoom', {
                    method: 'POST',
                    body: data
                });
                resp = await resp.json();
                if (resp.success) {
                    // await this.connect(channelId, identity);
                    _localStorage.setItem(channelId, JSON.stringify(exportable_privateKey));
                    resolve({ channelId: channelId, key: exportable_privateKey });
                }
                else {
                    reject(new Error(JSON.stringify(resp)));
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    get channel() {
        return this.#channel;
    }
    get storage() {
        return this.#storage;
    }
    get crypto() {
        return sbCrypto;
    }
    // get identity(): Identity {
    //   // return this.#identity;
    //   return this.#defaultIdentity
    // }
    // set identity(identity: Identity) {
    //   this.#defaultIdentity = identity
    // }
    // // These are just helper methods, we can still access from SB.channel.socket.send externally
    // sendMessage(message: SBMessage) {
    //   this.channel.send(message);
    // }
    sendFile(file) {
        this.storage.saveFile(this.#channel, file);
    }
}
export { 
// ChannelMessage,
Channel, SBMessage, Snackabra, SBCrypto, };
//# sourceMappingURL=snackabra.js.map