/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */

/* Distributed under GPL-v03, see 'LICENSE' file for details */

function SB_libraryVersion() {
  return 'This is the NODE.JS version of the library';
}

/* SB simple events (mesage bus) class */
class MessageBus {
  constructor(args) {
    this.args = args;
    this.bus = {};
  }

  /* for possible future use with cleaner identifiers */
  * #uniqueID() {
    let i = 0;
    while (true) {
      i += 1;
      yield i;
    }
  }

  /* safely returns handler for any event */
  #select(event) {
    return this.bus[event] || (this.bus[event] = []);
  }

  /* 'event' is a string, special case '*' means everything
     (in which case the handler is also given the message) */
  subscribe(event, handler) {
    this.#select(event).push(handler);
  }

  unsubscribe(event, handler) {
    let i = -1;
    if (this.bus[event]) {
      if ((i = this.bus[event].findLastIndex((e) => e == handler)) != -1) {
        this.bus[event].splice(i, 1);
      }
    } else {
      console.info(`fyi: asked to remove a handler but it's not there`);
    }
  }

  publish(event, ...args) {
    for (const handler of this.#select('*')) {
      handler(event, ...args);
    }
    for (const handler of this.#select(event)) {
      handler(...args);
    }
  }
}


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  console.error(m);
  throw new Error(m);
}

// Parts of this code is based on 'base64.ts':
// raw.githubusercontent.com/dankogai/js-base64/main/base64.mjs which
// was distributed under BSD 3-Clause; we believe our use of the code
// here under GPL v3 is compatible with that license.

String.fromCharCode.bind(String);

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
function arrayBufferToBase64(buffer) {
  const u8a = new Uint8Array(buffer);
  {
    // nodejs, so has Buffer, just use that
    return Buffer.from(u8a).toString('base64');
  }
}

// ****************************************************************
// implement SB flavor of 'atob'
// ****************************************************************

const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const b64chs = Array.prototype.slice.call(b64ch);
((a) => {
  const tab = {};
  a.forEach((c, i) => tab[c] = i);
  return tab;
})(b64chs);

/** Standardized 'atob()' function, e.g. takes the a Base64 encoded
 input and decodes it. Note: always returns Uint8Array.

 @param {string} base64 string
 @return {Uint8Array} returns decoded result
 */
function base64ToArrayBuffer(asc) {
  asc = asc.replace(/\s+/g, ''); // collapse any whitespace
  asc += '=='.slice(2 - (asc.length & 3)); // make it tolerant of padding
  if (!_assertBase64(asc)) throw new Error('Invalid Character');
  {
    return _U8Afrom(Buffer.from(asc, 'base64'));
  }
}

function _appendBuffer(buffer1, buffer2) {
  try {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
  } catch (e) {
    console.error(e);
    return {};
  }
}
/* ****************************************************************
 *  These are wrappers to handle both browser and node targets
 *  with the same code. The 'false' value is replaced
 *  by rollup and this whole library is then tree-shaken so
 *  that only either the node-specific or browser-specific code
 *  is retained, into 'index.mjs' and 'browser.mjs' respectively.
 * ****************************************************************/

let _crypto, _fs, _path, _ws;
{
  _fs = await import('fs');
  _path = await import('path');
  _crypto = await import('crypto');
  // using https://www.npmjs.com/package/ws as a shim for node not having native WS until we build our own
  const node_ws = await import('ws');
  _ws = node_ws.default;
}

function getRandomValues(buffer) {
  return _crypto.getRandomValues(buffer);
}

/**
 Returns 'true' if (and only if) object is of type 'Uint8Array'.
 Works same on browsers and nodejs.
 */
function _assertUint8Array(obj) {
  if (typeof obj === 'object') if (Object.prototype.toString.call(obj) === '[object Uint8Array]') return true;
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
  if (z) return (z[0] === base64); else return false;
}

/** Standardized 'str2ab()' function, string to array buffer.
 This assumes on byte per character.
 @param {string} string
 @return {Uint8Array} buffer
 */
function str2ab(string) {
  const length = string.length;
  const buffer = new Uint8Array(length);
  for (let i = 0; i < length; i++) buffer[i] = string.charCodeAt(i);
  return buffer;
}

/** Standardized 'ab2str()' function, array buffer to string.
 This assumes one byte per character.
 @param {string} string
 @return {Uint8Array} buffer
 */
function ab2str(buffer) {
  if (!_assertUint8Array(buffer)) _sb_exception('ab2str()', 'parameter is not a Uint8Array buffer'); // this will throw
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

function extractPayloadV1(payload) {
  try {
    const metadataSize = new Uint32Array(payload.slice(0, 4))[0];
    const decoder = new TextDecoder();
    const metadata = JSON.parse(decoder.decode(payload.slice(4, 4 + metadataSize)));
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

function extractPayload(payload) {
  try {
    const metadataSize = new Uint32Array(payload.slice(0, 4))[0];
    const decoder = new TextDecoder();
    console.info('METADATASIZE: ', metadataSize);
    console.info('METADATASTRING: ', decoder.decode(payload.slice(4, 4 + metadataSize)));
    const _metadata = JSON.parse(decoder.decode(payload.slice(4, 4 + metadataSize)));
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

function encodeB64Url(input) {
  return input.replaceAll('+', '-').replaceAll('/', '_');
}

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
      console.error(e);
      return {};
    }
  }

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
      this.image_sign = await SB_Crypto.sign(signKey, null);
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

  #asImage(image, signKey) {
    return new Promise(async (resolve) => {
      this.data.previewImage = this.#padImage(await (await this.#restrictPhoto(image, 4096, 'image/jpeg', 0.92)).arrayBuffer());
      const previewHash = await this.#generateImageHash(this.data.previewImage);
      this.data.fullImage = image.size > 15728640 ? this.#padImage(await (await this.#restrictPhoto(image, 15360, 'image/jpeg', 0.92)).arrayBuffer()) : this.#padImage(await image.arrayBuffer());
      const fullHash = await this.#generateImageHash(this.data.fullImage);
      this.image = await this.#getFileData(await this.#restrictPhoto(image, 15, 'image/jpeg', 0.92), 'url');
      this.image_sign = await SB_Crypto.sign(signKey, null);
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

// Takes a message object and turns it into a payload to be used by SB protocol
class Payload { // eslint-disable-line no-unused-vars
  wrap(contents, key) {
    console.log(contents, key);
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


// mtg: Protocol code that we wrap our WebSocket in
// I will be updating this to send messages and remove the wait to send messages only when ack received
// The benefit is reduced latency in communication protocol
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

  get options() {
    return this.options;
  }

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

  async onError() {
    this.currentWebSocket.addEventListener('error', (event) => {
      console.error('WebSocket error, reconnecting:', event);
      if (typeof this.options.onError === 'function') {
        this.options.onError(event);
      }
    });
  }

  async onClose() {
    this.currentWebSocket.addEventListener('close', (event) => {
      console.info('Websocket closed', event);
      if (typeof this.options.onClose === 'function') {
        this.options.onClose(event);
      }
    });
  }

  async onMessage() {
    this.currentWebSocket.addEventListener('message', async (event) => {
      const data = JSON.parse(event.data);
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

  get readyState() {
    return this.currentWebSocket.readyState;
  }

  async onOpen() {
    this.currentWebSocket.addEventListener('open', async (event) => {
      if (typeof this.options.onOpen === 'function') {
        this.options.onOpen(event);
      }
    });
  }
}

class Channel {
  _id;
  url;
  identity;
  owner;
  admin;
  verifiedGuest;
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
          this.loadKeys(message.keys).then(() => {
            this.socket.isReady();
            resolve(this);
          });
        }
      };
    });
  }

  get keys() {
    return this.#keys;
  }

  get api() {
    return this.#api;
  }

  get socket() {
    return this.#socket;
  }

  loadKeys = (keys) => {
    return new Promise(async (resolve, reject) => {
      if (keys.ownerKey === null) {
        reject(new Error('Channel does not exist'));
      }
      let _exportable_owner_pubKey = JSON.parse(keys.ownerKey || JSON.stringify({}));
      if (_exportable_owner_pubKey.hasOwnProperty('key')) {
        _exportable_owner_pubKey = typeof _exportable_owner_pubKey.key === 'object' ? _exportable_owner_pubKey.key : JSON.parse(_exportable_owner_pubKey.key);
      }
      try {
        _exportable_owner_pubKey.key_ops = [];
      } catch (error) {
        reject(error);
      }
      const _exportable_room_signKey = JSON.parse(keys.signKey);
      const _exportable_encryption_key = JSON.parse(keys.encryptionKey);
      let _exportable_verifiedGuest_pubKey = JSON.parse(keys.guestKey || null);
      const _exportable_pubKey = this.identity.exportable_pubKey;
      const _privateKey = this.identity.privateKey;
      let isVerifiedGuest = false;
      const _owner_pubKey = await SB_Crypto.importKey('jwk', _exportable_owner_pubKey, 'ECDH', false, []);
      if (_owner_pubKey.error) {
        console.error(_owner_pubKey.error);
      }
      const isOwner = SB_Crypto.areKeysSame(_exportable_pubKey, _exportable_owner_pubKey);
      let isAdmin;
      {
        isAdmin = (process.env.REACT_APP_ROOM_SERVER !== 's_socket.privacy.app' && isOwner);
      }

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
      {
        _exportable_locked_key = await localStorage.getItem(this._id + '_lockedKey');
      }
      if (_exportable_locked_key !== null) {
        _locked_key = await SB_Crypto.importKey('jwk', JSON.parse(_exportable_locked_key), 'AES', false, ['encrypt', 'decrypt']);
      } else if (keys.locked_key) {
        const _string_locked_key = (await SB_Crypto.decrypt(isOwner ? await SB_Crypto.deriveKey(keys.privateKey, await SB_Crypto.importKey('jwk', keys.exportable_pubKey, 'ECDH', true, []), 'AES', false, ['decrypt']) : _shared_key, JSON.parse(keys.locked_key), 'string')).plaintext;
        _exportable_locked_key = JSON.parse(_string_locked_key);
        _locked_key = await SB_Crypto.importKey('jwk', JSON.parse(_exportable_locked_key), 'AES', false, ['encrypt', 'decrypt']);
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

// A SB Socket
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

  setKeys(_keys) {
    this.#channel.loadKeys(_keys);
  }

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
      onMessage: (event) => {
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
          this.recieve(event);
          if (typeof this.onMessage === 'function') {
            this.onMessage(this.recieve(event));
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

  close() {
    this.socket.close();
  }

  isReady() {
    console.info('SB Socket ready');
    this.ready = true;
    if (this.#queue.length > 0) {
      this.#queue.forEach((message) => {
        this.send(message);
      });
    }
  }

  async send(message) {
    if (this.ready) {
      const payload = await this.#payload.wrap(
        await new SBMessage(message, this.#channel.keys.personal_signKey, this.#identity.exportable_pubKey),
        this.#channel.keys.encryptionKey
      );
      this.socket.send(payload);
    } else {
      this.#queue.push(message);
    }
  }

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

  async recieve(message) {
    console.log('Received: ', message);
    const id = Object.keys(message)[0];
    let unwrapped;
    console.log(message[id].hasOwnProperty('encrypted_contents'));
    if (message[id].hasOwnProperty('encrypted_contents')) {
      try {
        unwrapped = await SB_Crypto.decrypt(this.#channel.keys.encryptionKey, message[id].encrypted_contents);
      } catch (e) {
        unwrapped = await SB_Crypto.decrypt(this.#channel.keys.locked_key, message[id].encrypted_contents);
      }
    } else {
      unwrapped = message[id];
    }
    localStorage.setItem(this.#channel._id + '_lastSeenMessage', id.slice(this.#channel._id.length));
    console.log(unwrapped);
    return unwrapped;
  }
}

class StorageApi {
  server;
  #channel;
  #identity;

  constructor(server, channel, identity) {
    this.server = server + '/api/v1';
    this.#channel = channel;
    this.#identity = identity;
  }

  async saveFile(file) {
    if (file instanceof File) {
      const sbFile = await new SBFile(file, this.#channel.keys.personal_signKey, this.#identity.exportable_pubKey);
      const metaData = JSON.parse(sbFile.imageMetaData);
      const fullStorePromise = this.storeImage(sbFile.data.fullImage, metaData.imageId, metaData.imageKey, 'f');
      const previewStorePromise = this.storeImage(sbFile.data.previewImage, metaData.previewId, metaData.previewKey, 'p');
      Promise.all([fullStorePromise, previewStorePromise]).then(async (results) => {
        this.#channel.socket.sendSbObject(sbFile);
        results.forEach(async (controlData) => {
          this.#channel.socket.sendSbObject({...controlData, control: true});
        });
      });
    } else {
      throw new Error('Must be an instance of File accepted');
    }
  }

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

  #unpadData(data_buffer) {
    const _size = new Uint32Array(data_buffer.slice(-4))[0];
    return data_buffer.slice(0, _size);
  }

  async retrieveData(msgId, messages, controlMessages) {
    const imageMetaData = messages.find((msg) => msg._id === msgId).imageMetaData;
    const image_id = imageMetaData.previewId;
    const control_msg = controlMessages.find((msg) => msg.hasOwnProperty('id') && msg.id.startsWith(image_id));
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
    const img = this.#unpadData(padded_img.plaintext);

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

  create(serverSecret) {
    return new Promise(async (resolve, reject) => {
      try {
        const ownerKeyPair = await _crypto.subtle.generateKey({
          name: 'ECDH', namedCurve: 'P-384'
        }, true, ['deriveKey']);
        const exportable_privateKey = await _crypto.subtle.exportKey('jwk', ownerKeyPair.privateKey);
        const exportable_pubKey = await _crypto.subtle.exportKey('jwk', ownerKeyPair.publicKey);
        const channelId = await this.#generateRoomId(exportable_pubKey.x, exportable_pubKey.y);
        const encryptionKey = await _crypto.subtle.generateKey({
          name: 'AES-GCM', length: 256
        }, true, ['encrypt', 'decrypt']);
        const exportable_encryptionKey = await _crypto.subtle.exportKey('jwk', encryptionKey);
        const signKeyPair = await _crypto.subtle.generateKey({
          name: 'ECDH', namedCurve: 'P-384'
        }, true, ['deriveKey']);
        const exportable_signKey = await _crypto.subtle.exportKey('jwk', signKeyPair.privateKey);
        const channelData = {
          roomId: channelId,
          ownerKey: JSON.stringify(exportable_pubKey),
          encryptionKey: JSON.stringify(exportable_encryptionKey),
          signKey: JSON.stringify(exportable_signKey),
          SERVER_SECRET: serverSecret
        };
        this.#channel._id = channelId;

        const data = new TextEncoder().encode(JSON.stringify(channelData));
        const resp = await this.uploadChannel(data);
        if (resp.hasOwnProperty('success')) {
          const keys = {
            ownerKey: channelData.ownerKey,
            encryptionKey: channelData.encryptionKey,
            signKey: channelData.signKey
          };
          this.#channel._id = channelId;
          localStorage.setItem(this.#channel._id, JSON.stringify(exportable_privateKey));
          resolve(channelId);
        } else {
          reject(new Error(JSON.stringify(resp)));
        }
      } catch (e) {
        reject(e);
      }
    });
  }

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

  setMOTD(motd) {
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
      //  reject(new Error('Must be channel owner to get admin data'));
      //}
    });
  }

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

  uploadChannel(channelData) {
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

  authorize(ownerPublicKey, serverSecret) {
    return new Promise(async (resolve, reject) => {
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

  postPubKey(_exportable_pubKey) {
    return new Promise(async (resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/postPubKey?type=guestKey', {
        method: 'POST', body: JSON.stringify(_exportable_pubKey), headers: {
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
    return new Promise(async (resolve, reject) => {
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
        const _locked_key = await _crypto.subtle.generateKey({
          name: 'AES-GCM', length: 256
        }, true, ['encrypt', 'decrypt']);
        const _exportable_locked_key = await _crypto.subtle.exportKey('jwk', _locked_key);
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

  acceptVisitor(pubKey) {
    return new Promise(async (resolve, reject) => {
      const shared_key = await SB_Crypto.deriveKey(this.#identity.keys.privateKey, await SB_Crypto.importKey('jwk', JSON.parse(pubKey), 'ECDH', false, []), 'AES', false, ['encrypt', 'decrypt']);
      const _encrypted_locked_key = await SB_Crypto.encrypt(JSON.stringify(this.#channel.keys.exportable_locked_key), shared_key, 'string');
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

  #generateRoomId(x, y) {
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
}

class KV {
  db;
  events = new EventEmitter();

  constructor(options) {
    {
      this.db = new FileSystemDB(options);
    }
  }

  openCursor(match, callback) {
    return this.db.openCursor(match, callback);
  }

  // Set item will insert or replace
  setItem(key, value) {
    return this.db.setItem(key, value);
  };

  //Add item but not replace
  add(key, value) {
    return this.db.add(key, value);
  };

  getItem(key) {
    return this.db.getItem(key);
  };

  removeItem(key) {
    return this.db.removeItem(key);
  };
}

class FileSystemDB {
  path;
  options = {
    db: 'MyDB', table: 'default', onReady: null
  };

  constructor(options) {
    this.options = Object.assign(this.options, options);
    this.#useDatabase();
  }

  openCursor = (match, callback) => {
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

  #serialize(value) {
    return new Promise(async (resolve, reject) => {
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
            storable.value = this.#serializeConstructor(value, storable.constructor);
        }
        resolve(JSON.stringify(storable));
      } catch (e) {
        reject(e);
      }
    });
  }

  #serializeConstructor(value, constructor) {
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

  #unserialize(value) {
    return new Promise(async (resolve, reject) => {
      try {
        const readable = JSON.parse(value);
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

  #unserializeConstructor(value, constructor) {
    return new Promise(async (resolve, reject) => {
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
      } catch (e) {
        reject(e);
      }
    });
  }

  #serializeKey(key) {
    return (key.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, ''));
  }

  // Set item will insert or replace
  setItem = (key, value) => {
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
  add = (key, value) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.#serialize(value);
        _fs.writeFileSync(this.path + _path.sep + this.#serializeKey(key), data, 'wx');
        resolve(true);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  };

  getItem = (key) => {
    return new Promise(async (resolve, reject) => {
      try {
        const file = this.path + _path.sep + this.#serializeKey(key);
        if (_fs.existsSync(file)) {
          const data = _fs.readFileSync(file);
          resolve(this.#unserialize(data));
        } else {
          resolve(null);
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  removeItem = (key) => {
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

{
  global.localStorage = new KV({db: 'localStorage', table: 'items'});
}

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

// Manages all the
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

class Snackabra {
  MessageBus = MessageBus;
  #channel = Channel;
  #storage = StorageApi;
  #identity = Identity;
  #queue = Queue;
  options = {
    channel_server: null, channel_ws: null, storage_server: null
  };

  constructor(args) {
    this.options = Object.assign(this.options, {
      channel_server: args.channel_server,
      channel_ws: args.channel_ws,
      storage_server: args.storage_server
    });
  }

  setIdentity(keys) {
    return new Promise(async (resolve, reject) => {
      try {
        this.#identity = await new Identity(keys);
        resolve(this.#identity);
      } catch (e) {
        reject(e);
      }
    });
  }

  connect(channel_id) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.#identity.exportable_pubKey) {
          reject(new Error('setIdentity must be called before connecting'));
        }
        this.#queue = new Queue({processor: true});
        this.#channel = await new Channel(this.options.channel_server, this.options.channel_ws, this.#identity, channel_id);
        this.#storage = new StorageApi(this.options.storage_server, this.#channel, this.#identity);
        resolve(this);
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

  sendMessage(message) {
    this.channel.socket.send(message);
  }

  sendFile(file) {
    this.storage.saveFile(file);
  }
}

export { MessageBus, SB_libraryVersion, Snackabra, ab2str, arrayBufferToBase64, base64ToArrayBuffer, getRandomValues, str2ab };
