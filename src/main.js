/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */

/* Distributed under GPL-v03, see 'LICENSE' file for details */


export function SB_libraryVersion() {
  if (process.browser)
    return 'This is the BROWSER version of the library';
  else
    return 'This is the NODE.JS version of the library';
}


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
  console.log(m);
  throw new Error(m);
}

// Parts of this code is based on 'base64.ts':
// raw.githubusercontent.com/dankogai/js-base64/main/base64.mjs which
// was distributed under BSD 3-Clause; we believe our use of the code
// here under GPL v3 is compatible with that license.

const _fromCC = String.fromCharCode.bind(String);

// ****************************************************************
// implement SB flavor of 'btoa'
// ****************************************************************

const _U8Afrom = (it, fn = (x) => x) => new Uint8Array(Array.prototype.slice.call(it, 0).map(fn));

/** Standardized 'btoa()'-like function, e.g., takes a binary string
 ('b') and returns a Base64 encoded version ('a' used to be short
 for 'ascii').

 @param {buffer} Uint8Array buffer
 @return {string} base64 string
 */
export function arrayBufferToBase64(buffer) {
  const u8a = new Uint8Array(buffer);
  if (process.browser) {
    // we could use window.btoa but chose not to
    let u32, c0, c1, c2, asc = '';
    const maxargs = 0x1000;
    const strs = [];
    for (let i = 0, l = u8a.length; i < l; i += maxargs)
      strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
    const bin = strs.join('');
    const pad = bin.length % 3;
    for (let i = 0; i < bin.length;) {
      if ((c0 = bin.charCodeAt(i++)) > 255 ||
        (c1 = bin.charCodeAt(i++)) > 255 ||
        (c2 = bin.charCodeAt(i++)) > 255)
        throw new Error('Invalid Character');
      u32 = (c0 << 16) | (c1 << 8) | c2;
      asc += b64chs[u32 >> 18 & 63] +
        b64chs[u32 >> 12 & 63] +
        b64chs[u32 >> 6 & 63] +
        b64chs[u32 & 63];
    }
    return pad ? asc.slice(0, pad - 3) + '==='.substring(pad) : asc;
  } else {
    // nodejs, so has Buffer, just use that
    return Buffer.from(u8a).toString('base64');
  }
}

// ****************************************************************
// implement SB flavor of 'atob'
// ****************************************************************

const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const b64chs = Array.prototype.slice.call(b64ch);
const b64tab = ((a) => {
  const tab = {};
  a.forEach((c, i) => tab[c] = i);
  return tab;
})(b64chs);

/** Standardized 'atob()' function, e.g. takes the a Base64 encoded
 input and decodes it. Note: always returns Uint8Array.

 @param {string} base64 string
 @return {Uint8Array} returns decoded result
 */
export function base64ToArrayBuffer(asc) {
  asc = asc.replace(/\s+/g, ''); // collapse any whitespace
  asc += '=='.slice(2 - (asc.length & 3)); // make it tolerant of padding
  if (!_assertBase64(asc))
    throw new Error('Invalid Character');
  if (process.browser) {
    // we could use window.atob but chose not to
    let u24, bin = '', r1, r2;
    for (let i = 0; i < asc.length;) {
      u24 = b64tab[asc.charAt(i++)] << 18
        | b64tab[asc.charAt(i++)] << 12
        | (r1 = b64tab[asc.charAt(i++)]) << 6
        | (r2 = b64tab[asc.charAt(i++)]);
      bin += r1 === 64 ? _fromCC(u24 >> 16 & 255)
        : r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255)
          : _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
    }
    return str2ab(bin);
  } else {
    return _U8Afrom(Buffer.from(asc, 'base64'));
  }
}

/* ****************************************************************
 *  These are wrappers to handle both browser and node targets
 *  with the same code. The 'process.browser' value is replaced
 *  by rollup and this whole library is then tree-shaken so
 *  that only either the node-specific or browser-specific code
 *  is retained, into 'index.mjs' and 'browser.mjs' respectively.
 * ****************************************************************/

let _crypto = null;
if (process.browser)
  _crypto = crypto;
else
  _crypto = await import('crypto');

export function getRandomValues(buffer) {
  return _crypto.getRandomValues(buffer);
}

/**
 Returns 'true' if (and only if) object is of type 'Uint8Array'.
 Works same on browsers and nodejs.
 */
function _assertUint8Array(obj) {
  if (typeof obj === 'object')
    if (Object.prototype.toString.call(obj) === '[object Uint8Array]')
      return true;
  return false;
}

const b64_regex = new RegExp('^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$');

/**
 Returns 'true' if (and only if) string is well-formed base64.
 Works same on browsers and nodejs.
 */
function _assertBase64(base64) {
  /* webpack 4 doesn't support optional chaining, requires webpack 5;
     since wp 5 is pretty recent (2020-10-10), we'll avoid using
     optional chaining in this library for a while */
  // return (b64_regex.exec(base64)?.[0] === base64);
  const z = b64_regex.exec(base64);
  if (z)
    return (z[0] === base64);
  else
    return false;
}

/** Standardized 'str2ab()' function, string to array buffer.
 This assumes on byte per character.
 @param {string} string
 @return {Uint8Array} buffer
 */
export function str2ab(string) {
  const length = string.length;
  const buffer = new Uint8Array(length);
  for (let i = 0; i < length; i++)
    buffer[i] = string.charCodeAt(i);
  return buffer;
}

/** Standardized 'ab2str()' function, array buffer to string.
 This assumes one byte per character.
 @param {string} string
 @return {Uint8Array} buffer
 */
export function ab2str(buffer) {
  if (!_assertUint8Array(buffer))
    _sb_exception('ab2str()', 'parameter is not a Uint8Array buffer'); // this will throw
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

/* ****************************************************************
 *  TODO functions - look for duplicates
 * ****************************************************************/

/* TODO
export function verifyCookie(request, env) {
  // room.mjs uses without env, storage with env
}
*/

// the publicKeyPEM paramater below needs to look like this:
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

/** Import a PEM encoded RSA public key, to use for RSA-OAEP
 encryption.  Takes a string containing the PEM encoded key, and
 returns a Promise that will resolve to a CryptoKey representing
 the public key.

 @param {PEM} RSA public key, string, PEM format
 @return {cryptoKey} RSA-OAEP key
 */
export function importPublicKey(pem) {
  if (!pem)
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
  const binaryDer = base64ToArrayBuffer(pemContents);
  return _crypto.subtle.importKey('spki', binaryDer, {name: 'RSA-OAEP', hash: 'SHA-256'}, true, ['encrypt']);
}

/** Returns random number
 @return {int} integer 0..255
 */
export function simpleRand256() {
  return _crypto.getRandomValues(new Uint8Array(1))[0];
}


const base32mi = '0123456789abcdefyhEjkLmNHpFrRTUW';

/** Returns a random string in requested encoding
 @param {n} number of characters
 @param {code} encoding, supported types: 'base32mi'
 @return {string} random string

 'base32mi': '0123456789abcdefyhEjkLmNHpFrRTUW'
 */
export function simpleRandomString(n, code) {
  if (code == 'base32mi') {
    // yeah of course we need to add base64 etc
    const z = _crypto.getRandomValues(new Uint8Array(n));
    let r = '';
    for (let i = 0; i < n; i++)
      r += base32mi[z[i] & 31];
    return r;
  }
  _sb_exception('simpleRandomString', 'code ' + code + ' not supported');
}

/** Disambiguates strings that are known to be 'base32mi' type
 @param {s} string
 @return {string} cleaned up string

 'base32mi': '0123456789abcdefyhEjkLmNHpFrRTUW'

 This is the base32mi disambiguation table:

 [OoQD] -> '0'
 [lIiJ] -> '1'
 [Zz] -> '2'
 [A] -> '4'
 [Ss] -> '5'
 [G] -> '6'
 [t] -> '7'
 [B] -> '8'
 [gq] -> '9'
 [C] -> 'c'
 [Y] -> 'y'
 [KxX] -> 'k'
 [M] -> 'm'
 [n] -> 'N'
 [P] -> 'p'
 [uvV] -> 'U'
 [w] -> 'W'

 Another way to think of it is that this, becomes this ('.' means no change):

 0123456789abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ
 ................9.1..1.N0.9.57UUk.248c0EF6.11kLm.0p0.5..Uky2

 */
export function cleanBase32mi(s) {
  // this of course is not the most efficient
  return s.replace(/[OoQD]/g, '0').replace(/[lIiJ]/g, '1').replace(/[Zz]/g, '2').replace(/[A]/g, '4').replace(/[Ss]/g, '5').replace(/[G]/g, '6').replace(/[t]/g, '7').replace(/[B]/g, '8').replace(/[gq]/g, '9').replace(/[C]/g, 'c').replace(/[Y]/g, 'y').replace(/[KxX]/g, 'k').replace(/[M]/g, 'm').replace(/[n]/g, 'N').replace(/[P]/g, 'p').replace(/[uvV]/g, 'U').replace(/[w]/g, 'w');
}


/** Takes an arbitrary dict object, a public key in PEM
 format, and a callback function: generates a random AES key,
 wraps that in (RSA) key, and when all done will call the
 callback function with the results

 @param {dict} dictionary (payload)
 @param {publicKeyPEM} public key (PEM format)
 @param {callback} callback function, called with results
 */
export function packageEncryptDict(dict, publicKeyPEM, callback) {
  const clearDataArrayBufferView = str2ab(JSON.stringify(dict));
  const aesAlgorithmKeyGen = {name: 'AES-GCM', length: 256};
  const aesAlgorithmEncrypt = {name: 'AES-GCM', iv: _crypto.getRandomValues(new Uint8Array(16))};
  if (!publicKeyPEM)
    publicKeyPEM = defaultPublicKeyPEM;
  // Create a key generator to produce a one-time-use AES key to encrypt some data
  _crypto.subtle.generateKey(aesAlgorithmKeyGen, true, ['encrypt']).then(
    (aesKey) => {
      // we are exporting the symmetric AES key so we can encrypt it using pub key
      _crypto.subtle.exportKey('raw', aesKey).then((theKey) => {
        // console.log('raw key is:');
        // console.log(theKey);
        // console.log('arrayBufferToBase64 of raw AES key is:');
        // console.log(arrayBufferToBase64(theKey));
        // console.log('raw AES key itself: ');
        // console.log(theKey);
        const rsaAlgorithmEncrypt = {name: 'RSA-OAEP'};
        importPublicKey(publicKeyPEM).then((publicKey) => {
          return _crypto.subtle.encrypt(rsaAlgorithmEncrypt, publicKey, theKey);
        }).then(
          (buf) => {
            const encryptedAesKey = arrayBufferToBase64(buf);
            // console.log('rsa ciphertext of our aes key in base 64 encoding is: ');
            // console.log(encryptedAesKey);
            return encryptedAesKey;
          }).then(
          (encAesKey) => {
            // console.log('IV is:');
            // console.log(arrayBufferToBase64(aesAlgorithmEncrypt.iv));
            return Promise.all([_crypto.subtle.encrypt(aesAlgorithmEncrypt, aesKey, clearDataArrayBufferView), encAesKey]);
          }).then(
          (arr) => {
            // arr[0] is the encrypted dict in raw format, arr[1] is the aes key encrypted with rsa public key
            const encryptedData = arrayBufferToBase64(arr[0]);
            // console.log('this is the encryptedApplication, or arrayBufferToBase64(arr[0])');
            // console.log(arr[0]);
            // console.log(encryptedData);
            const postableEncryptedAesKey = arr[1];
            // console.log(postableEncryptedAesKey);
            const theContent = encodeURIComponent(encryptedData);
            const data = {
              enc_aes_key: encodeURIComponent(postableEncryptedAesKey),
              iv: encodeURIComponent(arrayBufferToBase64(aesAlgorithmEncrypt.iv)),
              content: theContent
            };
            if (callback) {
              callback(data);
            } else {
              console.log('(No Callback) Resulting data:');
              console.log(data);
            }
          });
      });
    }
  );
} // packageEncrypt()


// A class that contains all the SB specific crypto functions


class Crypto {
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
      console.log(e);
      return {};
    }
  }

  generateKeys() {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(await _crypto.subtle.generateKey(
          {
            name: 'ECDH',
            namedCurve: 'P-384'
          },
          true,
          ['deriveKey']
        ));
      } catch (e) {
        reject(e);
      }
    });
  }

  importKey(format, key, type, extractable, keyUsages) {
    return new Promise(async (resolve, reject) => {
      const keyAlgorithms = {
        ECDH: {
          name: 'ECDH',
          namedCurve: 'P-384'
        },
        AES: {
          name: 'AES-GCM'
        },
        PBKDF2: 'PBKDF2'
      };
      try {
        const response = await _crypto.subtle.importKey(
          format,
          key,
          keyAlgorithms[type],
          extractable,
          keyUsages
        );
        resolve(response);
      } catch (e) {
        console.log(format, key, type, extractable, keyUsages);
        reject(e);
      }
    });
  }

  deriveKey(privateKey, publicKey, type, extractable, keyUsages) {
    return new Promise(async (resolve, reject) => {
      const keyAlgorithms = {
        AES: {
          name: 'AES-GCM',
          length: 256
        },
        HMAC: {
          name: 'HMAC',
          hash: 'SHA-256',
          length: 256
        }
      };
      try {
        resolve(await _crypto.subtle.deriveKey(
          {
            name: 'ECDH',
            public: publicKey
          },
          privateKey,
          keyAlgorithms[type],
          extractable,
          keyUsages
        ));
      } catch (e) {
        console.log(privateKey, publicKey, type, extractable, keyUsages);
        reject(e);
      }
    });
  }

  getFileKey(fileHash, _salt) {
    return new Promise(async (resolve, reject) => {
      try {
        const keyMaterial = await this.importKey('raw', utils.base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey']);

        // TODO - Support deriving from PBKDF2 in deriveKey function
        const key = await _crypto.subtle.deriveKey(
          {
            'name': 'PBKDF2',
            // salt: _crypto.getRandomValues(new Uint8Array(16)),
            'salt': _salt,
            'iterations': 100000, // small is fine, we want it snappy
            'hash': 'SHA-256'
          },
          keyMaterial,
          {'name': 'AES-GCM', 'length': 256},
          true,
          ['encrypt', 'decrypt']
        );
        // return key;
        resolve(key);
      } catch (e) {
        reject(e);
      }
    });
  }

  encrypt(contents, secret_key = null, outputType = 'string', _iv = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (contents === null) {
          reject(new Error('no contents'));
        }
        const iv = _iv === null ? _crypto.getRandomValues(new Uint8Array(12)) : _iv;
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
        try {
          encrypted = await _crypto.subtle.encrypt(algorithm, key, data);
        } catch (e) {
          reject(e);
        }
        resolve((outputType === 'string') ? {
          content: encodeURIComponent(utils.arrayBufferToBase64(encrypted)),
          iv: encodeURIComponent(utils.arrayBufferToBase64(iv))
        } : {content: encrypted, iv: iv});
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }

  decrypt(secretKey, contents, outputType = 'string') {
    return new Promise(async (resolve, reject) => {
      try {
        const ciphertext = typeof contents.content === 'string' ? utils.base64ToArrayBuffer(decodeURIComponent(contents.content)) : contents.content;
        const iv = typeof contents.iv === 'string' ? utils.base64ToArrayBuffer(decodeURIComponent(contents.iv)) : contents.iv;
        const decrypted = await _crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: iv
          },
          secretKey,
          ciphertext
        );
        if (outputType === 'string') {
          resolve(new TextDecoder().decode(decrypted));
        }
        resolve(decrypted);
      } catch (e) {
        reject(e);
      }
    });
  }

  sign(secretKey, contents) {
    return new Promise(async (resolve, reject) => {
      try {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(contents);
        let sign;
        try {
          sign = await _crypto.subtle.sign(
            'HMAC',
            secretKey,
            encoded
          );
          resolve(encodeURIComponent(utils.arrayBufferToBase64(sign)));
        } catch (error) {
          reject(error);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  verify(secretKey, sign, contents) {
    return new Promise(async (resolve, reject) => {
      try {
        const _sign = utils.base64ToArrayBuffer(decodeURIComponent(sign));
        const encoder = new TextEncoder();
        const encoded = encoder.encode(contents);
        try {
          const verified = await _crypto.subtle.verify(
            'HMAC',
            secretKey,
            _sign,
            encoded
          );
          resolve(verified);
        } catch (e) {
          reject(e);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  areKeysSame(key1, key2) {
    if (key1 != null && key2 != null && typeof key1 === 'object' && typeof key2 === 'object') {
      return key1['x'] === key2['x'] && key1['y'] === key2['y'];
    }
    return false;
  }
}

const SB_Crypto = new Crypto();

// Identity aka a key for use in SB
class Identity {
  exportable_pubKey;
  exportable_privateKey;
  privateKey;

  constructor(existingKey) {
    return new Promise(async (resolve, reject) => {
      try {
        if (existingKey) {
          await this.#mountKeys(existingKey);
        } else {
          await this.#mintKeys();
        }
        resolve(this);
      } catch (e) {
        reject(e);
      }
    });
  }

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

// Takes a message object and turns it into a payload to be used by SB
class Payload {
  #crypto = new Crypto();

  async wrap(contents, key) {
    try {
      return {encrypted_contents: await this.#crypto.encrypt(JSON.stringify(contents), key, 'string')};
    } catch (e) {
      console.error(e);
      return {error: 'Unable to encrypt payload.'};
    }
  }

  async unwrap(payload, key) {
    try {
      let msg = await this.#crypto.decrypt(key, payload.encrypted_contents);
      if (msg.error) {
        return {error: msg.error};
      }
      return msg;
    } catch (e) {
      return {error: e.message};
    }
  }

}


// Protocol code that we wrap our WebSocket in
class WS_Protocol {
  currentWebSocket;
  _id;
  events = new events.EventEmitter();
  queue = [];
  options = {
    url: '',
    onOpen: null,
    onMessage: null,
    onClose: null,
    onError: null,
    timeout: 30000
  };


  constructor(options) {
    if (!options.url) {
      throw new Error('URL must be set');
    }
    this.options = Object.assign(this.options, options);
    this.join();
  }

  get options() {
    return this.options;
  }

  join() {
    return new Promise((resolve, reject) => {
      try {
        this.currentWebSocket = new WebSocket(this.options.url);
        this.error();
        this.close();
        this.open();
        this.message();
        resolve();
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });

  }

  send = (message) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.currentWebSocket.readyState === 1) {
          const hash = await _crypto.subtle
            .digest('SHA-256', new TextEncoder().encode(message));
          const ackPayload = {
            timestamp: Date.now(),
            type: 'ack',
            _id: arrayBufferToBase64(hash)
          };
          this.currentWebSocket.send(JSON.stringify(ackPayload));

          const ackResponse = () => {
            this.currentWebSocket.send(message);
            clearTimeout(timeout);
            this.events.removeListener('ws_ack_' + ackPayload._id, ackResponse);
            resolve();
          };

          this.events.on('ws_ack_' + ackPayload._id, ackResponse);
          let timeout = setTimeout(() => {
            console.error(`Websocket request timed out after ${this.options.timeout}ms`);
            this.events.removeListener('ws_ack_' + ackPayload._id, ackResponse);
            reject();
          }, this.options.timeout);


        } else {
          this.queue.push(message);
        }
      } catch (e) {
        console.error(e);
      }

    });

  };

  async error() {
    this.currentWebSocket.addEventListener('error', event => {
      console.log('WebSocket error, reconnecting:', event);
      if (typeof this.options.onError === 'function') {
        this.options.onError(event);
      }
    });
  }

  async close() {
    this.currentWebSocket.addEventListener('close', event => {
      console.info('Websocket closed', event);
      if (typeof this.options.onClose === 'function') {
        this.options.onClose(event);
      }

    });
  }

  async message() {
    this.currentWebSocket.addEventListener('message', async event => {
      let data = JSON.parse(event.data);

      if (data.ack) {
        this.events.emit('ws_ack_' + data._id);
        return;
      }
      if (data.nack) {
        console.log('Nack received');
        this.close();
        return;
      }
      if (typeof this.options.onMessage === 'function') {
        this.options.onMessage(event);
      }
    });
  }

  get readyState() {
    return this.currentWebSocket.readyState;
  }

  async open() {
    this.currentWebSocket.addEventListener('open', async (event) => {
      if (this.queue.length > 0) {
        for (let i in this.queue) {
          this.send(JSON.stringify(this.queue[i]));
        }
      }
      this.queue = [];
      if (typeof this.options.onOpen === 'function') {
        this.options.onOpen(event);
      }
    });
  }

}

// A SB Socket
class Socket {
  _id;
  connection;
  url;
  events;
  init;
  #keys;
  #queue = Queue;
  #crypto = Crypto;
  #payload = ChannelPayload;

  constructor(crypto, queue, wsUrl) {
    this.#crypto = crypto;
    this.#queue = queue;
    this.#payload = new ChannelPayload();
    this.url = wsUrl;
    return this;
  }

  setKeys(_keys) {
    this.#keys = _keys;
  }

  open(socketId, user) {
    console.log(socketId, user);
    const socketEvents = new events.EventEmitter();
    const options = {
      url: this.url + socketId + '/websocket',
      onOpen: async (event) => {
        this.init = {name: JSON.stringify(user.exportable_pubKey)};
        await socket.send(JSON.stringify(this.init));
        socketEvents.emit('open', event);
      },
      onMessage: event => {
        socketEvents.emit('message', event);
      },
      onClose: event => {
        socketEvents.emit('close', event);
      },
      onError: event => {
        socketEvents.emit('error', event);
      },
      timeout: 500
    };
    const socket = new ManagedWS(options);
    this.events = socketEvents;
    this._id = socketId;
    this.connection = socket;
  }

  send(message) {
    try {
      this.#queue.add({ws: {_id: this._id, url: this.url, init: this.init}, message: message}, 'wsCallback');
    } catch (e) {
      console.error(e);
    }

  }

  async sendCipher(message) {
    try {
      const payload = await this.#payload.wrap(message, this.#keys.encryptionKey);
      console.log(payload);
      this.#queue.add({ws: {_id: this._id, url: this.url, init: this.init}, message: payload}, 'wsCallback');
    } catch (e) {
      console.error(e);
    }
  }

}

// Augments IndexedDB to be used as a KV to easily replace localStorage for larger and more complex datasets
class IndexedKV {
  indexedDB;
  db;
  events = new events.EventEmitter();
  options = {
    db: 'MyDB',
    table: 'default',
    onReady: null
  };

  constructor(options) {
    this.options = Object.assign(this.options, options);
    if (typeof this.options.onReady === 'function') {
      this.events.on(`ready`, (e) => {
        this.options.onReady(e);
      });
    }
    if (!window.indexedDB) {
      console.log('Your browser doesn\'t support a stable version of IndexedDB.');
    } else {
      this.indexedDB = window.indexedDB;
    }
    let openReq;

    openReq = this.indexedDB.open(this.options.db);


    openReq.onerror = event => {
      console.error(event);
    };

    openReq.onsuccess = event => {
      this.db = event.target.result;
      this.events.emit('ready');
    };

    this.indexedDB.onerror = event => {

      console.error('Database error: ' + event.target.errorCode);
    };

    openReq.onupgradeneeded = event => {
      this.db = event.target.result;
      this.db.createObjectStore(this.options.table, {keyPath: 'key'});
      this.useDatabase();
      this.events.emit('ready');
    };
  }

  openCursor = (match, callback) => {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.options.table], 'readonly');
      const objectStore = transaction.objectStore(this.options.table);
      const request = objectStore.openCursor(null, 'next');
      request.onsuccess = function(event) {
        resolve(event.target.result);
        const cursor = event.target.result;
        if (cursor) {
          const regex = new RegExp(`^${match}`);
          if (cursor.key.match(regex)) {
            callback(cursor.value.value);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = function(event) {
        reject(event);
      };
    });
  };

  useDatabase = () => {

    this.db.onversionchange = event => {
      this.db.close();
      console.log('A new version of this page is ready. Please reload or close this tab!');
    };

  };

  // Set item will insert or replace
  setItem = (key, value) => {
    return new Promise((resolve, reject) => {
      const objectStore = this.db.transaction([this.options.table], 'readwrite').objectStore(this.options.table);
      const request = objectStore.get(key);
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        const data = event?.target?.result;

        if (data?.value) {
          data.value = value;
          const requestUpdate = objectStore.put(data);
          requestUpdate.onerror = event => {
            reject(event);
          };
          requestUpdate.onsuccess = event => {
            const data = event.target.result;
            resolve(data.value);
          };
        } else {

          const requestAdd = objectStore.add({key: key, value: value});
          requestAdd.onsuccess = event => {
            resolve(event.target.result);

          };

          requestAdd.onerror = event => {
            reject(event);
          };
        }

      };
    });

  };

  //Add item but not replace
  add = (key, value) => {
    return new Promise((resolve, reject) => {
      const objectStore = this.db.transaction([this.options.table], 'readwrite').objectStore(this.options.table);
      const request = objectStore.get(key);
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        const data = event?.target?.result;

        if (data?.value) {
          resolve(data.value);
        } else {

          const requestAdd = objectStore.add({key: key, value: value});
          requestAdd.onsuccess = event => {
            resolve(event.target.result);

          };

          requestAdd.onerror = event => {
            reject(event);
          };
        }

      };
    });
  };

  getItem = (key) => {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.options.table]);
      const objectStore = transaction.objectStore(this.options.table);
      const request = objectStore.get(key);

      request.onerror = event => {
        reject(event);
      };

      request.onsuccess = (event) => {
        const data = event?.target?.result;
        if (data?.value) {
          resolve(data.value);
        } else {
          resolve(null);
        }

      };
    });
  };

  removeItem = (key) => {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction([this.options.table], 'readwrite')
        .objectStore(this.options.table)
        .delete(key);
      request.onsuccess = event => {
        resolve();
      };

      request.onerror = event => {
        reject(event);
      };
    });
  };

}

class QueuedItem {
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

// Manages all the
class Queue {
  cacheDb;
  wsOptions;
  currentWS;
  onOffline;
  lastProcessed = Date.now();
  events = new events.EventEmitter();
  options = {
    name: 'queue_default',
    processor: false
  };
  _memoryQueue = [];
  ready = false;
  #crypto = new Crypto();

  // Needs to run from the
  constructor(options) {
    this.options = Object.assign(this.options, options);
    this.cacheDb = new IndexedKV({db: 'offline_queue', table: 'items', onReady: this.init});
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
        console.log(options);
        this.wsOptions = {
          url: options.url + options._id + '/websocket',
          onOpen: async (event) => {
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
    console.log(socket);
    socket.send(JSON.stringify(message)).then(async () => {
      await this.remove(_id);
      this.setLastProcessed();
    }).catch(() => {
      console.log('Your client is offline, your message will be sent when you reconnect');
      if (typeof this.onOffline === 'function') {
        this.events.emit('offline');
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
          console.log(this.currentWS);
          if (this.currentWS.readyState !== 1) {
            return;
          }
          this.wsSend(_id, message, this.currentWS);
        }
      } catch (e) {
        console.log(e);
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

class SB {
  SB_libraryVersion = SB_libraryVersion;
  ab2str = ab2str;
  str2ab = str2ab;
  base64ToArrayBuffer = base64ToArrayBuffer;
  arrayBufferToBase64 = arrayBufferToBase64;
  getRandomValues = getRandomValues;
  #channel = {
    api: ChannelApi,
    socket: ChannelWS
  };
  #storage;
  #crypto;
  #user;
  #payload;
  #queue;
  options = {
    channel_server: null,
    channel_ws: null,
    storage_server: null
  };

  constructor(options) {

    this.options = Object.assign(this.options, options);
    this.crypto = new Crypto();
    this.#queue = new Queue({processor: true});
    this.channel = {
      api: new ChannelApi(this.crypto, this.options.channel_server),
      socket: new ChannelWS(this.crypto, this.#queue, this.options.channel_ws)
    };
    this.storage = new StorageServer(this.crypto, this.options.storage_server);
    this.payload = new ChannelPayload(this.crypto);

  }

  loadUser(keys) {
    return new Promise(async (resolve, reject) => {
      try {
        this.user = await new Identity(keys);
        resolve(this.user);
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
    return this.#crypto;
  }

  get user() {
    return this.#use;
  }
}

const Snackabra = {
  SB_libraryVersion: SB_libraryVersion,
  ab2str: ab2str,
  str2ab: str2ab,
  base64ToArrayBuffer: base64ToArrayBuffer,
  arrayBufferToBase64: arrayBufferToBase64,
  getRandomValues: getRandomValues
};

export default Snackabra;


if (process.browser)
  window.Snackabra = Snackabra;
