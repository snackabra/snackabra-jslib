/*
  NOTE: THIS IS IN PROGRESS PURE BROWSER TYPESCRIPT
  */

/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */

/* Distributed under GPL-v03, see 'LICENSE' file for details */

/* eslint-disable no-trailing-spaces */


/* Zen Master: "um" */
function SB_libraryVersion() {
  throw new Error('THIS IS NEITHER BROWSER NOR NODE THIS IS SPARTA!');
}

/**
 * SB simple events (mesage bus) class
 */
export class MessageBus {
  bus: Dictionary = {};

  /**
   * Safely returns handler for any event
   */
  #select(event: string) {
    return this.bus[event] || (this.bus[event] = []);
  }

  /**
   * Subscribe. 'event' is a string, special case '*' means everything
   *  (in which case the handler is also given the message)
   */
  subscribe(event: string, handler: () => void) {
    this.#select(event).push(handler);
  }

  /**
   * Unsubscribe
   */
  unsubscribe(event: string, handler: Function) {
    let i = -1;
    if (this.bus[event]) {
      if ((i = this.bus[event].findLastIndex((e: any) => e == handler)) != -1) {
        this.bus[event].splice(i, 1);
      } else {
        console.info(`fyi: asked to remove a handler but it's not there`);
      }
    } else {
      console.info(`fyi: asked to remove a handler but the event is not there`);
    }
  }

  /**
   * Publish
   */
  publish(event: string, ...args: any[]) {
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

/* where do we use sleep()?  we should probably use setInterval() instead */

// /*
//   Sleep for ms milliseconds
//   */
// export function sleep(ms: number) {
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

export function _sb_exception(loc: string, msg: string) {
  const m = '<< SB lib error (' + loc + ': ' + msg + ') >>';
  // for now disabling this to keep node testing less noisy
  // console.error(m);
  throw new Error(m);
}

// internal - general handling of paramaters that might be promises
// (basically the "anti" of resolve, if it's *not* a promise then
// it becomes one
export function _sb_resolve(val: any) {
  if (val.then) {
    // it's already a promise
    // console.log('it is a promise')
    return val;
  } else {
    // console.log('it was not a promise')
    return new Promise((resolve) => resolve(val));
  }
}

// internal - handle assertions
export function _sb_assert(val: any, msg: string) {
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

let _crypto, _fs, _path, _ws;
_crypto = crypto;
_ws = WebSocket;

/**
 * Fills buffer with random data
 */
export function getRandomValues(buffer: Uint8Array) {
  return _crypto.getRandomValues(buffer);
}

// Strict b64 check:
// const b64_regex = new RegExp('^(?:[A-Za-z0-9+/_\-]{4})*(?:[A-Za-z0-9+/_\-]{2}==|[A-Za-z0-9+/_\-]{3}=)?$')
// But we will go (very) lenient:
const b64_regex = /^([A-Za-z0-9+/_\-=]*)$/;

/**
 * Returns 'true' if (and only if) string is well-formed base64.
 * Works same on browsers and nodejs.
 */
function _assertBase64(base64: string) {
  // return (b64_regex.exec(base64)?.[0] === base64);
  const z = b64_regex.exec(base64);
  if (z) return (z[0] === base64); else return false;
}

/**
 * Standardized 'str2ab()' function, string to array buffer.
 * This assumes on byte per character.
 *
 * @param {string} string
 * @return {Uint8Array} buffer
 */
export function str2ab(string: string) {
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
export function ab2str(buffer: Uint8Array) {
  return new TextDecoder('utf-8').decode(buffer);
}


/**
 * From:
 * https://github.com/qwtel/base64-encoding/blob/master/base64-js.ts
 */
const b64lookup: string[] = [];
const urlLookup: string[] = [];
const revLookup: number[] = [];
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

function getLens(b64: string) {
  const len = b64.length;
  let validLen = b64.indexOf(PAD);
  if (validLen === -1) validLen = len;
  const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
  return [validLen, placeHoldersLen];
}

function _byteLength(validLen: number, placeHoldersLen: number) {
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
export function base64ToArrayBuffer(str: string): Uint8Array {
  if (!_assertBase64(str)) throw new Error('invalid character');
  let tmp: number;
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
  let i: number;
  for (i = 0; i < len; i += 4) {
    const r0: number = revLookup[str.charCodeAt(i)];
    const r1: number = revLookup[str.charCodeAt(i + 1)];
    const r2: number = revLookup[str.charCodeAt(i + 2)];
    const r3: number = revLookup[str.charCodeAt(i + 3)];
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

function tripletToBase64(lookup: string[], num: number) {
  return (
    lookup[num >> 18 & 0x3f] +
    lookup[num >> 12 & 0x3f] +
    lookup[num >> 6 & 0x3f] +
    lookup[num & 0x3f]
  );
}

function encodeChunk(lookup: string[], view: DataView, start: number, end: number) {
  let tmp: number;
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
 * @param {bufferSource} Uint8Array buffer
 * @return {string} base64 string
 */
export function arrayBufferToBase64(buffer: Uint8Array): string {
  // const view = bs2dv(bufferSource)
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const len = view.byteLength;
  const extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  const len2 = len - extraBytes;
  const parts = new Array(
    Math.floor(len2 / MAX_CHUNK_LENGTH) + Math.sign(extraBytes)
  );
  const lookup = urlLookup;
  const pad = '';
  let j = 0;
  for (let i = 0; i < len2; i += MAX_CHUNK_LENGTH) {
    parts[j++] = encodeChunk(
      lookup,
      view,
      i,
      (i + MAX_CHUNK_LENGTH) > len2 ? len2 : (i + MAX_CHUNK_LENGTH),
    );
  }
  if (extraBytes === 1) {
    const tmp = view.getUint8(len - 1);
    parts[j] = (
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3f] +
      pad + pad
    );
  } else if (extraBytes === 2) {
    const tmp = (view.getUint8(len - 2) << 8) + view.getUint8(len - 1);
    parts[j] = (
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3f] +
      lookup[(tmp << 2) & 0x3f] +
      pad
    );
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

export function _appendBuffer(buffer1: Uint8Array, buffer2: Uint8Array): ArrayBufferLike {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
}

/* ****************************************************************
 *  TODO functions - look for duplicates
 * ****************************************************************/

/* TODO
export function verifyCookie(request, env) {
  // room.mjs uses without env, storage with env
}
*/

// the publicKeyPEM paramater below needs to look like this
// if not given, will use this default (MI/384 has private key)
const defaultPublicKeyPEM: string = `-----BEGIN PUBLIC KEY-----
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
 * @param {PEM} RSA public key, string, PEM format
 * @return {cryptoKey} RSA-OAEP key
 *
 */
export function importPublicKey(pem?: string) {
  if (typeof pem == 'undefined') pem = defaultPublicKeyPEM
  // fetch the part of the PEM string between header and footer
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  const start = pem.indexOf(pemHeader);
  const end = pem.indexOf(pemFooter);
  if ((start < 0) || (end < 0)) _sb_exception('importPublicKey()', 'fail to find BEGIN and/or END string in RSA (PEM) key');
  const pemContents = pem.slice(start + pemHeader.length, end);
  // const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
  // console.log(pemContents)
  const binaryDer = base64ToArrayBuffer(pemContents);
  return crypto.subtle.importKey('spki', binaryDer, {name: 'RSA-OAEP', hash: 'SHA-256'}, true, ['encrypt']);
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
export function simpleRandomString(n: number, code: string): string {
  if (code == 'base32mi') {
    // yeah of course we need to add base64 etc
    const z = crypto.getRandomValues(new Uint8Array(n))
    let r = ''
    for (let i = 0; i < n; i++) r += base32mi[z[i] & 31]
    return r
  }
  _sb_exception('simpleRandomString', 'code ' + code + ' not supported')
  return ''
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
export function cleanBase32mi(s: string) {
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
export function packageEncryptDict(dict, publicKeyPEM, callback) {
  const clearDataArrayBufferView = str2ab(JSON.stringify(dict));
  const aesAlgorithmKeyGen = {name: 'AES-GCM', length: 256};
  const aesAlgorithmEncrypt = {name: 'AES-GCM', iv: _crypto.getRandomValues(new Uint8Array(16))};
  if (!publicKeyPEM) publicKeyPEM = defaultPublicKeyPEM;
  // Create a key generator to produce a one-time-use AES key to encrypt some data
  _crypto.subtle.generateKey(aesAlgorithmKeyGen, true, ['encrypt']).then((aesKey) => {
    // we are exporting the symmetric AES key so we can encrypt it using pub key
    _crypto.subtle.exportKey('raw', aesKey).then((theKey) => {
      const rsaAlgorithmEncrypt = {name: 'RSA-OAEP'};
      importPublicKey(publicKeyPEM).then((publicKey) => {
        return _crypto.subtle.encrypt(rsaAlgorithmEncrypt, publicKey, theKey);
      }).then((buf) => {
        const encryptedAesKey = arrayBufferToBase64(buf);
        return encryptedAesKey;
      }).then((encAesKey) => {
        return Promise.all([_crypto.subtle.encrypt(aesAlgorithmEncrypt, aesKey, clearDataArrayBufferView), encAesKey]);
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
        } else {
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
  try {
    return JSON.parse(str);
  } catch (error) {
    // sometimes it's an embedded string
    try {
      // This would be simple: 'return JSON.parse(eval(str));'
      // But eval() not safe. Instead we iteratively strip possible wrapping
      // single or double quotation marks. There are various cases where this
      // will not be enough, but we'll add "unwrapping" logic as we find
      // the examples.
      let s3 = s2 = undefined;
      while (str != (s3 = s2, s2 = str, str = str?.match(/^(['"])(.*)\1$/m)?.[2])) ;
      return JSON.parse(`'${s3}'`);
    } catch {
      // let's try one more thing
      try {
        return JSON.parse(str.slice(1, -1));
      } catch {
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
  } catch (e) {
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
      if (data.hasOwnProperty(key)) {
        keyCount++;
        metadata[keyCount.toString()] = {name: key, start: startIndex, size: data[key].byteLength};
        startIndex += data[key].byteLength;
      }
    }
    const encoder = new TextEncoder();
    const metadataBuffer = encoder.encode(JSON.stringify(metadata));
    const metadataSize = new Uint32Array([metadataBuffer.byteLength]);
    let payload = _appendBuffer(metadataSize.buffer, metadataBuffer);
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        payload = _appendBuffer(payload, data[key]);
      }
    }
    return payload;
  } catch (e) {
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
  } catch (e) {
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
function decodeB64Url(input: string) {
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
      const pubKey = {...privateKey};
      delete pubKey.d;
      delete pubKey.dp;
      delete pubKey.dq;
      delete pubKey.q;
      delete pubKey.qi;
      pubKey.key_ops = [];
      return pubKey;
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  /**
   * Generates standard ``ECDH`` keys using ``P-384``.
   */
  generateKeys() {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(await _crypto.subtle.generateKey({
          name: 'ECDH', namedCurve: 'P-384'
        }, true, ['deriveKey']));
      } catch (e) {
        reject(e);
      }
    });
  }


  /**
   * Import keys
   */
  importKey(format, key, type, extractable, keyUsages) {
    return new Promise(async (resolve, reject) => {
      const keyAlgorithms = {
        ECDH: {
          name: 'ECDH', namedCurve: 'P-384'
        }, AES: {
          name: 'AES-GCM'
        }, PBKDF2: 'PBKDF2'
      };
      try {
        const response = await _crypto.subtle.importKey(format, key, keyAlgorithms[type], extractable, keyUsages);
        resolve(response);
      } catch (e) {
        console.error(format, key, type, extractable, keyUsages);
        reject(e);
      }
    });
  }

  /**
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
        resolve(await _crypto.subtle.deriveKey({
          name: 'ECDH', public: publicKey
        }, privateKey, keyAlgorithms[type], extractable, keyUsages));
      } catch (e) {
        console.error(e, privateKey, publicKey, type, extractable, keyUsages);
        reject(e);
      }
    });
  }

  /**
   * Get file key
   */
  getFileKey(fileHash, _salt) {
    return new Promise(async (resolve, reject) => {
      try {
        const keyMaterial = await this.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey']);

        // TODO - Support deriving from PBKDF2 in deriveKey function
        const key = await _crypto.subtle.deriveKey({
          'name': 'PBKDF2', // salt: _crypto.getRandomValues(new Uint8Array(16)),
          'salt': _salt, 'iterations': 100000, // small is fine, we want it snappy
          'hash': 'SHA-256'
        }, keyMaterial, {'name': 'AES-GCM', 'length': 256}, true, ['encrypt', 'decrypt']);
        // return key;
        resolve(key);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Encrypt
   */
  encrypt(contents, secret_key = null, outputType = 'string', _iv = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (contents === null) {
          reject(new Error('no contents'));
        }
        const iv = _iv === null ? _crypto.getRandomValues(new Uint8Array(12)) : _iv;
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
          encrypted = await _crypto.subtle.encrypt(algorithm, key, data);
        } catch (e) {
          reject(e);
        }
        resolve((outputType === 'string') ? {
          content: encodeURIComponent(arrayBufferToBase64(encrypted)), iv: encodeURIComponent(arrayBufferToBase64(iv))
        } : {content: encrypted, iv: iv});
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  /**
   * Decrypt
   */
  decrypt(secretKey, contents, outputType = 'string') {
    return new Promise(async (resolve, reject) => {
      try {
        const ciphertext = typeof contents.content === 'string' ? base64ToArrayBuffer(decodeURIComponent(contents.content)) : contents.content;
        const iv = typeof contents.iv === 'string' ? base64ToArrayBuffer(decodeURIComponent(contents.iv)) : contents.iv;
        const decrypted = await _crypto.subtle.decrypt({
          name: 'AES-GCM', iv: iv
        }, secretKey, ciphertext);
        if (outputType === 'string') {
          resolve(new TextDecoder().decode(decrypted));
        }
        resolve(decrypted);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Sign
   */
  sign(secretKey, contents) {
    return new Promise(async (resolve, reject) => {
      try {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(contents);
        let sign;
        try {
          sign = await _crypto.subtle.sign('HMAC', secretKey, encoded);
          resolve(encodeURIComponent(arrayBufferToBase64(sign)));
        } catch (error) {
          reject(error);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verify
   */
  verify(secretKey, sign, contents) {
    return new Promise(async (resolve, reject) => {
      try {
        const _sign = base64ToArrayBuffer(decodeURIComponent(sign));
        const encoder = new TextEncoder();
        const encoded = encoder.encode(contents);
        try {
          const verified = await _crypto.subtle.verify('HMAC', secretKey, _sign, encoded);
          resolve(verified);
        } catch (e) {
          reject(e);
        }
      } catch (e) {
        reject(e);
      }
    });
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
class Identity implements SnackabraKeys {
  exportable_pubKey;
  exportable_privateKey;
  privateKey;

  constructor(key) {
    return new Promise(async (resolve, reject) => {
      try {
        if (key) {
          await this.#mountKeys(key);
        } else {
          await this.#mintKeys();
        }
        resolve(this);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Mint keys
   */
  #mintKeys() {
    return new Promise(async (resolve, reject) => {
      try {
        const keyPair = await SB_Crypto.generateKeys();
        this.exportable_pubKey = await _crypto.subtle.exportKey('jwk', keyPair.publicKey);
        this.exportable_privateKey = await _crypto.subtle.exportKey('jwk', keyPair.privateKey);
        this.privateKey = keyPair.privateKey;
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Mount keys
   */
  #mountKeys(key) {
    return new Promise(async (resolve, reject) => {
      try {
        this.exportable_privateKey = key;
        this.exportable_pubKey = SB_Crypto.extractPubKey(key);
        this.privateKey = await SB_Crypto.importKey('jwk', key, 'ECDH', true, ['deriveKey']);
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
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
  encrypted = false;
  contents;
  sender_pubKey;
  sign;
  metaData; //For future use
  image = '';
  image_sign;
  imageMetaData;
  imageMetadata_sign;

  constructor(contents, signKey, key) {
    return new Promise(async (resolve) => {
      // eslint-disable-next-line prefer-const
      let imgId = '', previewId = '', imgKey = '', previewKey = '';
      this.contents = contents;
      this.sender_pubKey = key;
      this.sign = await SB_Crypto.sign(signKey, contents);
      this.image_sign = await SB_Crypto.sign(signKey, this.image);
      this.imageMetaData = JSON.stringify({
        imageId: imgId,
        previewId: previewId,
        imageKey: imgKey,
        previewKey: previewKey
      });
      this.imageMetadata_sign = await SB_Crypto.sign(signKey, this.imageMetaData);
      resolve(this);
    });
  }
}

/**
 * SBFile
 * @class
 * @constructor
 * @public
 */
class SBFile {
  encrypted = false;
  contents;
  sender_pubKey;
  sign;
  data = {
    previewImage: '',
    fullImage: ''
  };
  metaData; //For future use
  image = '';
  image_sign;
  imageMetaData;
  imageMetadata_sign;

  // file is an instance of File
  constructor(file, signKey, key) {
    return new Promise(async (resolve, reject) => {
      this.contents = '';
      this.sender_pubKey = key;
      this.sign = await SB_Crypto.sign(signKey, this.contents);
      if (file.type.match(/^image/i)) {
        this.#asImage(file, signKey).then(() => {
          resolve(this);
        });
      } else {
        reject(new Error('Unsupported file type: ' + file.type));
      }
    });
  }

  /**
   * asImage
   */
  #asImage(image, signKey) {
    return new Promise(async (resolve) => {
      this.data.previewImage = this.#padImage(await (await this.#restrictPhoto(image, 4096, 'image/jpeg', 0.92)).arrayBuffer());
      const previewHash = await this.#generateImageHash(this.data.previewImage);
      this.data.fullImage = image.size > 15728640 ? this.#padImage(await (await this.#restrictPhoto(image, 15360, 'image/jpeg', 0.92)).arrayBuffer()) : this.#padImage(await image.arrayBuffer());
      const fullHash = await this.#generateImageHash(this.data.fullImage);
      this.image = await this.#getFileData(await this.#restrictPhoto(image, 15, 'image/jpeg', 0.92), 'url');
      this.image_sign = await SB_Crypto.sign(signKey, this.image);
      this.imageMetaData = JSON.stringify({
        imageId: fullHash.id,
        previewId: previewHash.id,
        imageKey: fullHash.key,
        previewKey: previewHash.key
      });
      this.imageMetadata_sign = await SB_Crypto.sign(signKey, this.imageMetaData);
      resolve(this);
    });
  }

  /**
   * getFileData
   */
  async #getFileData(file, outputType) {
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
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /**
   * padImage
   */
  #padImage(image_buffer) {
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
    } else {
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

  /**
   * restrictPhoto
   */
  async #restrictPhoto(photo, maxSize, imageType, qualityArgument) {
    // imageType default should be 'image/jpeg'
    // qualityArgument should be 0.92 for jpeg and 0.8 for png (MDN default)
    maxSize = maxSize * 1024; // KB
    // console.log(`Target size is ${maxSize} bytes`);
    let _c = await this.#readPhoto(photo);
    let _b1 = await new Promise((resolve) => {
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
      _c = this.#scaleCanvas(_c, .5);
      _b1 = await new Promise((resolve) => {
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
      _final_c = this.#scaleCanvas(_old_c, Math.sqrt(_ratio) * 0.99); // we're targeting within 1%
      _b1 = await new Promise((resolve) => {
        _final_c.toBlob(resolve, imageType, qualityArgument);
        // console.log(`(generating blob of requested type ${imageType})`);
      });
      // workingDots();
      // console.log(`... fine-tuning to W ${_final_c.width} x H ${_final_c.height} (size ${_b1.size})`);
      _ratio *= (maxSize / _b1.size);
    } while (((_b1.size > maxSize) || ((Math.abs(_b1.size - maxSize) / maxSize) > 0.02)) && (--_maxIteration > 0));// it's ok within 2%

    // workingDots();
    // console.log(`... ok looks like we're good now ... final size is ${_b1.size} (which is ${((_b1.size * 100) / maxSize).toFixed(2)}% of cap)`);

    // document.getElementById('the-original-image').width = _final_c.width;  // a bit of a hack
    return _b1;
  }

  /**
   * scaleCanvas
   */
  #scaleCanvas(canvas, scale) {
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;
    // console.log(`#### scaledCanvas target W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
    scaledCanvas
      .getContext('2d')
      .drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    // console.log(`#### scaledCanvas actual W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
    return scaledCanvas;
  }

  /**
   * generateImageHash
   */
  async #generateImageHash(image) {
    try {
      const digest = await crypto.subtle.digest('SHA-512', image);
      const _id = digest.slice(0, 32);
      const _key = digest.slice(32);
      return {
        id: encodeURIComponent(arrayBufferToBase64(_id)),
        key: encodeURIComponent(arrayBufferToBase64(_key))
      };
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  /**
   * readPhoto
   */
  async #readPhoto(photo) {
    const canvas = document.createElement('canvas');
    const img = document.createElement('img');

    // create img element from File object
    img.src = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(photo);
    });
    await new Promise((resolve) => {
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
  }
}

/**
 * Takes a message object and turns it into a payload to be
 * used by SB protocol
 */
class Payload { // eslint-disable-line no-unused-vars
  /**
   * wrap
   */
  wrap(contents, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const msg = {encrypted_contents: await SB_Crypto.encrypt(JSON.stringify(contents), key, 'string')};
        resolve(JSON.stringify(msg));
      } catch (e) {
        console.error(e);
        reject(new Error('Unable to encrypt payload.'));
      }
    });
  }

  /**
   * unwrap
   */
  async unwrap(payload, key) {
    try {
      const msg = await SB_Crypto.decrypt(key, payload.encrypted_contents);
      if (msg.error) {
        return {error: msg.error};
      }
      return msg;
    } catch (e) {
      return {error: e.message};
    }
  }
}


/**
 * mtg: Protocol code that we wrap our WebSocket in
 * I will be updating this to send messages and remove
 * the wait to send messages only when ack received
 * The benefit is reduced latency in communication protocol
 */
class WS_Protocol { // eslint-disable-line no-unused-vars
  currentWebSocket;
  _id;
  events = new MessageBus();
  options = {
    url: '', onOpen: null, onMessage: null, onClose: null, onError: null, timeout: 30000
  };

  constructor(options) {
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
      } catch (e) {
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

  send = (message) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.currentWebSocket.readyState === 1) {
          const hash = await _crypto.subtle
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
      } catch (e) {
        console.error(e);
      }
    });
  };

  /**
   * onError
   */
  async onError() {
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
  async onClose() {
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
  async onMessage() {
    this.currentWebSocket.addEventListener('message', async (event) => {
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
  async onOpen() {
    this.currentWebSocket.addEventListener('open', async (event) => {
      if (typeof this.options.onOpen === 'function') {
        this.options.onOpen(event);
      }
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
  _id;
  url;
  identity;
  owner;
  admin;
  verifiedGuest;
  metaData = {};
  #keys;
  #api = ChannelApi;
  #socket = ChannelSocket;

  constructor(https, wss, identity, channel_id = null) {
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
      this.#api = new ChannelApi(this.url, this, this.identity);
      this.#socket = new ChannelSocket(this.wss, this, this.identity);
      this.#socket.onJoin = async (message) => {
        if (message?.ready) {
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
    return this.#keys;
  }

  /**
   * Return API
   */
  get api() {
    return this.#api;
  }

  /**
   * Return socket
   */
  get socket() {
    return this.#socket;
  }

  loadKeys = (keys) => {
    return new Promise(async (resolve, reject) => {
      if (keys.ownerKey === null) {
        reject(new Error('Channel does not exist'));
      }
      let _exportable_owner_pubKey = jsonParseWrapper(keys.ownerKey || JSON.stringify({}), 'L1460');
      if (_exportable_owner_pubKey.hasOwnProperty('key')) {
        _exportable_owner_pubKey = typeof _exportable_owner_pubKey.key === 'object' ? _exportable_owner_pubKey.key : jsonParseWrapper(_exportable_owner_pubKey.key, 'L1463');
      }
      try {
        _exportable_owner_pubKey.key_ops = [];
      } catch (error) {
        reject(error);
      }
      const _exportable_room_signKey = jsonParseWrapper(keys.signKey, 'L1470');
      const _exportable_encryption_key = jsonParseWrapper(keys.encryptionKey, 'L1471');
      let _exportable_verifiedGuest_pubKey = jsonParseWrapper(keys.guestKey || null, 'L1472');
      const _exportable_pubKey = this.identity.exportable_pubKey;
      const _privateKey = this.identity.privateKey;
      let isVerifiedGuest = false;
      const _owner_pubKey = await SB_Crypto.importKey('jwk', _exportable_owner_pubKey, 'ECDH', false, []);
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
          _exportable_verifiedGuest_pubKey = {..._exportable_pubKey};
        }
        if (SB_Crypto.areKeysSame(_exportable_verifiedGuest_pubKey, _exportable_pubKey)) {
          isVerifiedGuest = true;
        }
      }

      const _encryption_key = await SB_Crypto.importKey('jwk', _exportable_encryption_key, 'AES', false, ['encrypt', 'decrypt']);

      const _room_privateSignKey = await SB_Crypto.importKey('jwk', _exportable_room_signKey, 'ECDH', true, ['deriveKey']);
      const _exportable_room_signPubKey = SB_Crypto.extractPubKey(_exportable_room_signKey);

      const _room_signPubKey = await SB_Crypto.importKey('jwk', _exportable_room_signPubKey, 'ECDH', true, []);
      const _personal_signKey = await SB_Crypto.deriveKey(_privateKey, _room_signPubKey, 'HMAC', false, ['sign', 'verify']);
      let _shared_key = null;
      if (!isOwner) {
        _shared_key = await SB_Crypto.deriveKey(_privateKey, _owner_pubKey, 'AES', false, ['encrypt', 'decrypt']);
      }

      let _locked_key = null, _exportable_locked_key;
      // if (process.browser) {
      _exportable_locked_key = localStorage.getItem(this._id + '_lockedKey');
      // } else {
      //   _exportable_locked_key = await localStorage.getItem(this._id + '_lockedKey');
      // }
      if (_exportable_locked_key !== null) {
        _locked_key = await SB_Crypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key, 'L1517'), 'AES', false, ['encrypt', 'decrypt']);
      } else if (keys.locked_key) {
        const _string_locked_key = (await SB_Crypto.decrypt(isOwner ? await SB_Crypto.deriveKey(keys.privateKey, await SB_Crypto.importKey('jwk', keys.exportable_pubKey, 'ECDH', true, []), 'AES', false, ['decrypt']) : _shared_key, jsonParseWrapper(keys.locked_key, 'L1519'), 'string')).plaintext;
        _exportable_locked_key = jsonParseWrapper(_string_locked_key, 'L1520');
        _locked_key = await SB_Crypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key, 'L1521'), 'AES', false, ['encrypt', 'decrypt']);
      }

      this.#keys = {
        shared_key: _shared_key,
        exportable_owner_pubKey: _exportable_owner_pubKey,
        exportable_verifiedGuest_pubKey: _exportable_verifiedGuest_pubKey,
        personal_signKey: _personal_signKey,
        room_privateSignKey: _room_privateSignKey,
        encryptionKey: _encryption_key,
        locked_key: _locked_key,
        exportable_locked_key: _exportable_locked_key
      };
      this.owner = isOwner;
      this.admin = isAdmin;
      this.verifiedGuest = isVerifiedGuest;
      resolve(true);
    });
  };
}

/**
 * Channel Socket
 * @class
 * @constructor
 * @public
 */
class ChannelSocket {
  socket;
  url;
  init;
  channelId;
  #channel;
  #identity;
  #payload;
  #queue = [];
  ready = false;
  onOpen;
  onJoin;
  onClose;
  onError;
  onMessage;
  onSystemInfo;

  constructor(wsUrl, channel, identity) {
    this.channelId = channel._id;
    this.url = wsUrl;
    this.#channel = channel;
    this.#identity = identity;
    this.#payload = new Payload();
    this.open();
  }

  /**
   * setKeys
   */
  setKeys(_keys) {
    this.#channel.loadKeys(_keys);
  }

  /**
   * open
   */
  open() {
    const options = {
      url: this.url + '/api/room/' + this.channelId + '/websocket',
      onOpen: async (event) => {
        console.info('websocket opened');
        this.init = {name: JSON.stringify(this.#identity.exportable_pubKey)};
        await this.socket.send(JSON.stringify(this.init));
        if (typeof this.onOpen === 'function') {
          this.onOpen(event);
        }
      },
      onMessage: async (event) => {
        if (event?.ready) {
          if (typeof this.onJoin === 'function') {
            this.onJoin(event);
            if (typeof this.onSystemInfo === 'function') {
              this.onSystemInfo(event);
            }
          }
        } else if (event?.system) {
          if (typeof this.onSystemInfo === 'function') {
            this.onSystemInfo(event);
          }
        } else {
          if (typeof this.onMessage === 'function') {
            this.onMessage(await this.receive(event));
          }
        }
      },
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
    if (this.#queue.length > 0) {
      this.#queue.forEach((message) => {
        this.send(message);
      });
    }
  }

  /**
   * Send message on channel socket
   */
  async send(message) {
    if (this.ready) {
      let payload;

      if (message instanceof SBMessage) {
        payload = await this.#payload.wrap(
          message,
          this.#channel.keys.encryptionKey
        );
      } else {
        payload = await this.#payload.wrap(
          await new SBMessage(message, this.#channel.keys.personal_signKey, this.#identity.exportable_pubKey),
          this.#channel.keys.encryptionKey
        );
      }
      this.socket.send(payload);
    } else {
      this.#queue.push(message);
    }
  }

  /**
   * Send SB object (file) on channel socket
   */
  async sendSbObject(file) {
    if (this.ready) {
      const payload = await this.#payload.wrap(
        file,
        this.#channel.keys.encryptionKey
      );
      this.socket.send(payload);
    } else {
      this.#queue.push(message);
    }
  }

  /**
   * Receive message on channel socket
   */
  async receive(message) {
    try {
      const id = Object.keys(message)[0];
      let unwrapped;
      if (message[id].hasOwnProperty('encrypted_contents')) {
        try {
          unwrapped = await SB_Crypto.decrypt(this.#channel.keys.encryptionKey, message[id].encrypted_contents, 'string');
        } catch (e) {
          console.warn(e);
          unwrapped = await SB_Crypto.decrypt(this.#channel.keys.locked_key, message[id].encrypted_contents, 'string');
        }
      } else {
        unwrapped = message;
      }
      unwrapped = jsonParseWrapper(unwrapped, 'L1702');
      unwrapped._id = id;
      localStorage.setItem(this.#channel._id + '_lastSeenMessage', id.slice(this.#channel._id.length));
      return JSON.stringify(unwrapped);
    } catch (e) {
      console.error('ERROR: receive() failed to process message: ', e);
      return null;
    }
  }
}

/**
 * Storage API
 * @class
 * @constructor
 * @public
 */
class StorageApi {
  server;
  #channel;
  #identity;

  constructor(server, channel, identity) {
    this.server = server + '/api/v1';
    this.#channel = channel;
    this.#identity = identity;
  }

  /**
   * saveFile
   */
  async saveFile(file) {
    if (file instanceof File) {
      const sbFile = await new SBFile(file, this.#channel.keys.personal_signKey, this.#identity.exportable_pubKey);
      const metaData = jsonParseWrapper(sbFile.imageMetaData, 'L1732');
      const fullStorePromise = this.storeImage(sbFile.data.fullImage, metaData.imageId, metaData.imageKey, 'f');
      const previewStorePromise = this.storeImage(sbFile.data.previewImage, metaData.previewId, metaData.previewKey, 'p');
      Promise.all([fullStorePromise, previewStorePromise]).then(async (results) => {
        results.forEach(async (controlData) => {
          this.#channel.socket.sendSbObject({...controlData, control: true});
        });
        this.#channel.socket.sendSbObject(sbFile);
      });
    } else {
      throw new Error('Must be an instance of File accepted');
    }
  }

  /**
   * getFileKey
   */
  async #getFileKey(fileHash, _salt) {
    const keyMaterial = await SB_Crypto.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey']);

    // TODO - Support deriving from PBKDF2 in deriveKey function
    const key = await _crypto.subtle.deriveKey({
      'name': 'PBKDF2',
      'salt': _salt,
      'iterations': 100000, // small is fine, we want it snappy
      'hash': 'SHA-256'
    }, keyMaterial, {'name': 'AES-GCM', 'length': 256}, true, ['encrypt', 'decrypt']);
    // return key;
    return key;
  }

  /**
   * storeRequest
   */
  storeRequest(fileId) {
    return new Promise(async (resolve, reject) => {
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
    return new Promise(async (resolve, reject) => {
      fetch(this.server + '/storeData?type=' + type + '&key=' + encodeURIComponent(fileId), {
        method: 'POST', body: assemblePayload({
          iv: encrypt_data.iv,
          salt: encrypt_data.salt,
          image: data.content,
          storageToken: (new TextEncoder()).encode(storageToken),
          vid: _crypto.getRandomValues(new Uint8Array(48))
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
    return new Promise(async (resolve, reject) => {
      const storeReqResp = await this.storeRequest(image_id);
      const encrypt_data = extractPayload(storeReqResp);
      const key = await this.#getFileKey(keyData, encrypt_data.salt);
      const data = await SB_Crypto.encrypt(image, key, 'arrayBuffer', encrypt_data.iv);
      const storageTokenReq = await this.#channel.api.storageRequest(data.content.byteLength);
      if (storageTokenReq.hasOwnProperty('error')) {
        return {error: storageTokenReq.error};
      }
      const storageToken = JSON.stringify(storageTokenReq);
      const resp_json = await this.storeData(type, image_id, encrypt_data, storageToken, data);
      if (resp_json.hasOwnProperty('error')) {
        reject(new Error(resp_json.error));
      }
      resolve({verificationToken: resp_json.verification_token, id: resp_json.image_id, type: type});
    });
  }

  /**
   * fetchData
   */
  fetchData(msgId, verificationToken) {
    return new Promise(async (resolve, reject) => {
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
   * unpadData
   */
  #unpadData(data_buffer) {
    const _size = new Uint32Array(data_buffer.slice(-4))[0];
    return data_buffer.slice(0, _size);
  }

  /**
   * retrieveData
   */
  async retrieveData(msgId, messages, controlMessages) {
    const imageMetaData = messages.find((msg) => msg._id === msgId).imageMetaData;
    const image_id = imageMetaData.previewId;
    const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.hasOwnProperty('id') && ctrl_msg.id.startsWith(image_id));
    if (!control_msg) {
      return {'error': 'Failed to fetch data - missing control message for that image'};
    }
    const imageFetch = await this.fetchData(control_msg.id, control_msg.verificationToken);
    const data = extractPayload(imageFetch);
    const iv = data.iv;
    const salt = data.salt;
    const image_key = await this.#getFileKey(imageMetaData.previewKey, salt);
    const encrypted_image = data.image;
    const padded_img = await SB_Crypto.decrypt(image_key, {content: encrypted_image, iv: iv}, 'arrayBuffer');
    const img = this.#unpadData(padded_img);

    if (img.error) {
      console.error('(Image error: ' + img.error + ')');
      throw new Error('Failed to fetch data - authentication or formatting error');
    }
    return {'url': 'data:image/jpeg;base64,' + arrayBufferToBase64(img)};
  }

  /**
   * retrieveDataFromMessage
   */
  async retrieveDataFromMessage(message, controlMessages) {
    const imageMetaData = typeof message.imageMetaData === 'string' ? jsonParseWrapper(message.imageMetaData, 'L1893') : message.imageMetaData;
    const image_id = imageMetaData.previewId;
    const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.hasOwnProperty('id') && ctrl_msg.id === image_id);
    if (!control_msg) {
      return {'error': 'Failed to fetch data - missing control message for that image'};
    }
    const imageFetch = await this.fetchData(control_msg.id, control_msg.verificationToken);
    const data = extractPayload(imageFetch);
    const iv = data.iv;
    const salt = data.salt;
    const image_key = await this.#getFileKey(imageMetaData.previewKey, salt);
    const encrypted_image = data.image;
    const padded_img = await SB_Crypto.decrypt(image_key, {content: encrypted_image, iv: iv}, 'arrayBuffer');
    const img = this.#unpadData(padded_img);

    if (img.error) {
      console.error('(Image error: ' + img.error + ')');
      throw new Error('Failed to fetch data - authentication or formatting error');
    }
    return {'url': 'data:image/jpeg;base64,' + arrayBufferToBase64(img)};
  }

  /* Unused Currently
  migrateStorage() {

  }

  fetchDataMigration() {

  }
   */
}

/**
 * Channel API
 * @class
 * @constructor
 * @public
 */
class ChannelApi {
  server;
  #identity;
  #channel;
  #channelApi;
  #channelServer;
  #payload;

  constructor(server, channel, identity) {
    this.server = server;
    this.#channel = channel;
    this.#payload = new Payload();
    this.#channelApi = server + '/api/';
    this.#channelServer = server + '/api/room/';
    this.#identity = identity;
  }

  /**
   * getLastMessageTimes
   */
  getLastMessageTimes() {
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelApi + '/getLastMessageTimes', {
        method: 'POST', body: JSON.stringify([this.#channel._id])
      }).then((response) => {
        if (!response.ok) {
          reject(new Error('Network response was not OK'));
        }
        return response.json();
      }).then((message_times) => {
        resolve(message_times[this.#channel._id]);
      }).catch((e) => {
        reject(e);
      });
    });
  }

  /**
   * getOldMessages
   */
  getOldMessages(currentMessagesLength) {
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/oldMessages?currentMessagesLength=' + currentMessagesLength, {
        method: 'GET',
      }).then((response) => {
        if (!response.ok) {
          reject(new Error('Network response was not OK'));
        }
        return response.json();
      }).then(async (_encrypted_messages) => {
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
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/updateRoomCapacity?capacity=' + capacity, {
        method: 'GET', credentials: 'include'
      }).then((response) => {
        if (!response.ok) {
          reject(new Error('Network response was not OK'));
        }
        return response.json();
      }).then(async (data) => {
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
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/getRoomCapacity', {
        method: 'GET', credentials: 'include'
      }).then((response) => {
        if (!response.ok) {
          reject(new Error('Network response was not OK'));
        }
        return response.json();
      }).then(async (data) => {
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
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/getJoinRequests', {
        method: 'GET', credentials: 'include'
      })
        .then((response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then(async (data) => {
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
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/roomLocked', {
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
    console.log(motd);
    return new Promise(async (resolve, reject) => {
      //if (this.#channel.owner) {
      fetch(this.#channelServer + this.#channel._id + '/motd', {
        method: 'POST', body: JSON.stringify({motd: motd}), headers: {
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
    });
  }

  /**
   * getAdminData
   */
  getAdminData() {
    return new Promise(async (resolve, reject) => {
      //if (this.#channel.owner) {
      const token_data = new Date().getTime().toString();
      const token_sign = await SB_Crypto.sign(this.#identity.personal_signKey, token_data);
      fetch(this.#channelServer + this.#channel._id + '/getAdminData', {
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
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/downloadData', {
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

  uploadChannel(channelData: ChannelData) {
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/uploadRoom', {
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
    });
  }

  authorize(ownerPublicKey: Dictionary, serverSecret: string) {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/authorizeRoom', {
        method: 'POST', body: {roomId: this.#channel._id, SERVER_SECRET: serverSecret, ownerKey: ownerPublicKey}
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

  postPubKey(_exportable_pubKey: Dictionary) {
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/postPubKey?type=guestKey', {
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

  storageRequest(byteLength: number) {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/storageRequest?size=' + byteLength, {
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
    return new Promise(async (resolve, reject) => {
      if (this.#channel.keys.locked_key == null && this.#channel.channel_admin) {
        const _locked_key: CryptoKey = await _crypto.subtle.generateKey({
          name: 'AES-GCM', length: 256
        }, true, ['encrypt', 'decrypt']);
        const _exportable_locked_key: CryptoKey = await _crypto.subtle.exportKey('jwk', _locked_key);
        fetch(this.#channelServer + this.#channel._id + '/lockRoom', {
          method: 'GET', credentials: 'include'
        })
          .then((response) => {
            if (!response.ok) {
              reject(new Error('Network response was not OK'));
            }
            return response.json();
          })
          .then(async (data) => {
            if (data.locked) {
              await this.acceptVisitor(JSON.stringify(this.#identity.exportable_pubKey));
            }
            resolve({locked: data.locked, lockedKey: _exportable_locked_key});
          }).catch((error) => {
          reject(error);
        });
      }
    });
  }

  acceptVisitor(pubKey: Dictionary) {
    return new Promise(async (resolve, reject) => {
      const shared_key: CryptoKey = await SB_Crypto.deriveKey(this.#identity.keys.privateKey, await SB_Crypto.importKey('jwk', jsonParseWrapper(pubKey, 'L2276'), 'ECDH', false, []), 'AES', false, ['encrypt', 'decrypt']);
      const _encrypted_locked_key: Dictionary = await SB_Crypto.encrypt(JSON.stringify(this.#channel.keys.exportable_locked_key), shared_key, 'string');
      fetch(this.#channelServer + this.#channel._id + '/acceptVisitor', {
        method: 'POST',
        body: JSON.stringify({pubKey: pubKey, lockedKey: JSON.stringify(_encrypted_locked_key)}),
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
    });
  }

  ownerKeyRotation() {
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/ownerKeyRotation', {
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
  /*
  matt: These methods have no implementation in the current webclient so I have skipped them for the time being
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

   */
}

/**
 * KV
 * @class
 * @constructor
 * @public
 */
class KV {
  db: IndexedKV | FileSystemDB;
  events = new EventEmitter();

  constructor(options) {
    // if (!process.browser) {
    //   this.db = new FileSystemDB(options);
    // } else {
    if (!window.indexedDB) {
      throw new Error('Your browser doesn\'t support a stable version of IndexedDB.');
    }
    this.db = new IndexedKV(options);
    // }
  }

  openCursor(match: string, callback: FunctionConstructor) {
    return this.db.openCursor(match, callback);
  }

  // Set item will insert or replace
  setItem(key: string, value:StorableDataType) {
    return this.db.setItem(key, value);
  }

  //Add item but not replace
  add(key: string, value: StorableDataType) {
    return this.db.add(key, value);
  }

  getItem(key: string) {
    return this.db.getItem(key);
  }

  removeItem(key: string) {
    return this.db.removeItem(key);
  }
}

/**
 * FileSystemDB
 *
 * @class
 * @constructor
 * @public
 */
class FileSystemDB {
  path: string;
  options: FileSystemDBOptions = {
    db: 'MyDB', table: 'default', onReady: null
  };

  constructor(options) {
    this.options = Object.assign(this.options, options);
    this.#useDatabase();
  }

  openCursor = (match: string, callback: FunctionConstructor) => {
    return new Promise((resolve, reject) => {
      try {
        _fs.readdir(this.path, (err, files) => {
          if (err) {
            reject(err);
          }
          files.forEach(async (f) => {
            const regex = new RegExp(`^${match}`);
            if (f.match(regex)) {
              callback(await this.getItem(f));
            }
          });
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  #useDatabase = () => {
    this.path = _path.join(process.env.PWD, 'FileSystemDB', this.options.db, this.options.table);
    if (!_fs.existsSync(this.path)) {
      _fs.mkdirSync(this.path, {recursive: true});
      console.info('Created directory for FileSystemDB');
    }
  };

  #serialize(value: StorableDataType) {
    return new Promise(async (resolve, reject) => {
      try {
        const storable: Dictionary = {
          dataType: typeof value
        };
        switch (storable.dataType) {
          case 'string' || 'number' || 'bigint' || 'boolean' || 'symbol':
            storable.value = value;
            break;
          case 'object':
            storable.constructor = value.constructor.name;
            storable.value = this.#serializeConstructor(value, storable.constructor);
        }
        resolve(JSON.stringify(storable));
      } catch (e) {
        reject(e);
      }
    });
  }

  #serializeConstructor(value: ArrayBufferLike | object | Array<unknown> | Blob, constructor) {
    return new Promise(async (resolve, reject) => {
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
      } catch (e) {
        reject(e);
      }
    });
  }

  #unserialize(value: StorableDataType) {
    return new Promise(async (resolve, reject) => {
      try {
        const readable: Dictionary = jsonParseWrapper(value, 'L2478');
        switch (readable.dataType) {
          case 'string' || 'number' || 'bigint' || 'boolean' || 'symbol':
            break;
          case 'object':
            readable.value = this.#unserializeConstructor(value, readable.constructor);
        }
        resolve(readable.value);
      } catch (e) {
        reject(e);
      }
    });
  }

  #unserializeConstructor(value: object, constructor: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let data: Uint8Array;
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
      } catch (e) {
        reject(e);
      }
    });
  }

  #serializeKey(key: string) {
    return (key.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, ''));
  }

  // Set item will insert or replace
  setItem = (key: string, value: StorableDataType) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.#serialize(value);
        _fs.writeFileSync(this.path + _path.sep + this.#serializeKey(key), data);
      } catch (e) {
        reject(e);
      }
    });
  };

  //Add item but not replace
  add = (key: string, value: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data: string = await this.#serialize(value);
        _fs.writeFileSync(this.path + _path.sep + this.#serializeKey(key), data, 'wx');
        resolve(true);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  };

  getItem = (key: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const file = this.path + _path.sep + this.#serializeKey(key);
        if (_fs.existsSync(file)) {
          const data: string = _fs.readFileSync(file);
          resolve(this.#unserialize(data));
        } else {
          resolve(null);
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  removeItem = (key: string) => {
    return new Promise((resolve, reject) => {
      try {
        _fs.unlinkSync(this.path + _path.sep + this.#serializeKey(key));
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  };
}


/**
 * Augments IndexedDB to be used as a KV to easily
 * replace localStorage for larger and more complex datasets
 *
 * @class
 * @constructor
 * @public
 */
class IndexedKV {
  db: IDBDatabase;
  events = new MessageBus();
  options: IndexedKVOptions = {
    db: 'MyDB', table: 'default', onReady: null
  };

  constructor(options: IndexedKVOptions) {
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
    const indexedDB = window.indexedDB;
    // }

    const openReq: IDBOpenDBRequestEventMap = indexedDB.open(this.options.db);

    openReq.onerror = (event: IDBVersionChangeEvent) => {
      console.error(event);
    };

    openReq.onsuccess = (event: IDBVersionChangeEvent) => {
      this.db = event.target.result;
      this.events.publish('ready');
    };

    indexedDB.onerror = (event: Event) => {
      console.error('Database error: ' + event.target.errorCode);
    };

    openReq.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      this.db = event.target.result;
      this.db.createObjectStore(this.options.table, {keyPath: 'key'});
      this.#useDatabase();
      this.events.publish('ready');
    };
  }

  openCursor(match: string, callback: function) {
    return new Promise((resolve, reject) => {
      const objectStore: IDBObjectStore = this.db.transaction([this.options.table], 'readonly').objectStore(this.options.table);
      const request: IDBRequest = objectStore.openCursor(null, 'next');
      request.onsuccess = (event: Event) => {
        resolve(event.target.result);
        const cursor: IDBCursorWithValue = event.target.result;
        if (cursor) {
          const regex = new RegExp(`^${match}`);
          if (cursor.key.match(regex)) {
            callback(cursor.value.value);
          }
          cursor.continue();
        } else {
          resolve(true);
        }
      };
      request.onerror = (event: Event) =>{
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
  setItem(key: string, value: StorableDataType) {
    return new Promise((resolve, reject) => {
      const objectStore: IDBObjectStore = this.db.transaction([this.options.table], 'readwrite').objectStore(this.options.table);
      const request: IDBRequest = objectStore.get(key);
      request.onerror = (event: Event) => {
        reject(event);
      };
      request.onsuccess = (event: Event) => {
        const data = event?.target?.result;

        if (data?.value) {
          data.value = value;
          const requestUpdate: IDBRequest = objectStore.put(data);
          requestUpdate.onerror = (event: Event) => {
            reject(event);
          };
          requestUpdate.onsuccess = (event: Event) => {
            const data = event.target.result;
            resolve(data.value);
          };
        } else {
          const requestAdd: IDBRequest = objectStore.add({key: key, value: value});
          requestAdd.onsuccess = (event: Event) => {
            resolve(event.target.result);
          };

          requestAdd.onerror = (event: Event) => {
            reject(event);
          };
        }
      };
    });
  }

  //Add item but not replace
  add(key: string, value: StorableDataType) {
    return new Promise((resolve, reject) => {
      const objectStore: IDBObjectStore = this.db.transaction([this.options.table], 'readwrite').objectStore(this.options.table);
      const request: IDBRequest = objectStore.get(key);
      request.onerror = (event) => {
        reject(event);
      };
      request.onsuccess = (event) => {
        const data = event?.target?.result;

        if (data?.value) {
          resolve(data.value);
        } else {
          const requestAdd: IDBRequest = objectStore.add({key: key, value: value});
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

  getItem(key: string) {
    return new Promise((resolve, reject) => {
      const objectStore: IDBObjectStore = this.db.transaction([this.options.table]).objectStore(this.options.table);
      const request: IDBRequest = objectStore.get(key);

      request.onerror = (event: Event) => {
        reject(event);
      };

      request.onsuccess = (event: Event) => {
        const data = event?.target?.result;
        if (data?.value) {
          resolve(data.value);
        } else {
          resolve(null);
        }
      };
    });
  }

  removeItem(key: string) {
    return new Promise((resolve, reject) => {
      const request: IDBRequest = this.db.transaction([this.options.table], 'readwrite')
        .objectStore(this.options.table)
        .delete(key);
      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (event: Event) => {
        reject(event);
      };
    });
  }
}

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
        this._id = arrayBufferToBase64(await _crypto.subtle
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
  MessageBus: MessageBus;
  // PSM: i think these two are on a per-channel object basis?
  #channel: Channel;
  #storage: StorageApi;
  #identity: Identity;
  #queue: Queue;
  options: SnackabraOptions = {
    channel_server: null, channel_ws: null, storage_server: null
  };

  /**
   */
  constructor(args: SnackabraOptions) {
    _sb_assert(args, 'Snackabra(args) - missing args');
    try {
      this.options = Object.assign(this.options, {
        channel_server: args.channel_server,
        channel_ws: args.channel_ws,
        storage_server: args.storage_server
      });
    } catch (e) {
      _sb_exception('Snackabra.constructor()', e);
    }
  }

  setIdentity(keys: SnackabraKeys) {
    return new Promise(async (resolve, reject) => {
      try {
        this.#identity = await new Identity(keys);
        resolve(this.#identity);
      } catch (e) {
        reject(e);
      }
    });
  }

  createIdentity() {
    return new Promise(async (resolve, reject) => {
      try {
        this.#identity = await new Identity();
        resolve(this.#identity);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Connects to :term:`Channel Name` on this SB config.
   * Returns a (promise to a) channel object
   */
  connect(channel_id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const _self = this;
        if (!_self.#identity.exportable_pubKey) {
          // TODO: does it?
          reject(new Error('setIdentity must be called before connecting'));
        }
        _sb_resolve(channel_id).then((channel_id: string) => {
          const c: Promise<Channel> = new Channel(_self.options.channel_server, _self.options.channel_ws, _self.#identity, channel_id);
          c.then((c) => {
            _self.#channel = c;
            _self.#storage = new StorageApi(_self.options.storage_server, _self.#channel, _self.#identity);
            resolve(_self);
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Creates a channel. Currently uses trivial authentication.
   * Returns the :term:`Channel Name`.
   * (TODO: token-based approval of storage spend)
   */
  create(serverSecret: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const ownerKeyPair: CryptoKey = await _crypto.subtle.generateKey({
          name: 'ECDH',
          namedCurve: 'P-384'
        }, true, ['deriveKey']);
        const exportable_privateKey: CryptoKey = await _crypto.subtle.exportKey('jwk', ownerKeyPair.privateKey);
        const exportable_pubKey: CryptoKey = await _crypto.subtle.exportKey('jwk', ownerKeyPair.publicKey);
        const channelId: string = await this.#generateRoomId(exportable_pubKey.x, exportable_pubKey.y);
        const encryptionKey: CryptoKey = await _crypto.subtle.generateKey({
          name: 'AES-GCM',
          length: 256
        }, true, ['encrypt', 'decrypt']);
        const exportable_encryptionKey: CryptoKey = await _crypto.subtle.exportKey('jwk', encryptionKey);
        const signKeyPair: CryptoKey = await _crypto.subtle.generateKey({
          name: 'ECDH', namedCurve: 'P-384'
        }, true, ['deriveKey']);
        const exportable_signKey: CryptoKey = await _crypto.subtle.exportKey('jwk', signKeyPair.privateKey);
        const channelData: ChannelData = {
          roomId: channelId,
          ownerKey: JSON.stringify(exportable_pubKey),
          encryptionKey: JSON.stringify(exportable_encryptionKey),
          signKey: JSON.stringify(exportable_signKey),
          SERVER_SECRET: serverSecret
        };
        const data: Uint8Array = new TextEncoder().encode(JSON.stringify(channelData));
        let resp: Promise | Dictionary = await fetch(this.options.channel_server + '/api/room/' + channelId + '/uploadRoom', {
          method: 'POST',
          body: data
        });
        resp = await resp.json();
        if (resp.hasOwnProperty('success')) {
          await this.connect(channelId);
          localStorage.setItem(channelId, JSON.stringify(exportable_privateKey));
          resolve(channelId);
        } else {
          reject(new Error(JSON.stringify(resp)));
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  #generateRoomId(x: string, y: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const xBytes = base64ToArrayBuffer(decodeB64Url(x));
        const yBytes = base64ToArrayBuffer(decodeB64Url(y));
        const channelBytes = _appendBuffer(xBytes, yBytes);
        const channelBytesHash = await _crypto.subtle.digest('SHA-384', channelBytes);
        resolve(encodeB64Url(arrayBufferToBase64(channelBytesHash)));
      } catch (e) {
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
    return SB_Crypto;
  }

  get identity() {
    return this.#identity;
  }

  sendMessage(message: string | Dictionary) {
    this.channel.socket.send(message);
  }

  sendFile(file: File) {
    this.storage.saveFile(file);
  }
}

export {
  Snackabra,
  SBMessage,
  SBFile,
  SB_libraryVersion,
  ab2str,
  str2ab,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  getRandomValues
};
