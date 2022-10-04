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

  Long Term Todo:
  * eventually defined the protocol, potentially registering with:
    https://www.iana.org/assignments/websocket/websocket.xml#subprotocol-name

*/

/*
  BELOW HERE is what eventually becomes final code ..
*/


/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */

/* Distributed under GPL-v03, see 'LICENSE' file for details */



/**
 * Interfaces
 */

interface SnackabraOptions {
  channel_server: string,
  channel_ws: string,
  storage_server: string,
}

interface SnackabraKeys {
  exportable_pubKey: JsonWebKey | Promise<JsonWebKey | null>
  exportable_privateKey: JsonWebKey | Promise<JsonWebKey | null>
  privateKey: CryptoKey | Promise<CryptoKey | null>,
}

interface IndexedKVOptions {
  db: string,
  table: string,
  onReady: CallableFunction,
}

interface WSProtocolOptions {
  url: string,
  onOpen?: null | CallableFunction,
  onMessage?: null | CallableFunction,
  onClose?: null | CallableFunction,
  onError?: null | CallableFunction,
  timeout?: number
}

type StorableDataType = string | number | bigint | boolean | symbol | object

interface Dictionary {
  [index: string]: any;
}

interface DictDict {
  [index: string]: DictDict;
}

interface ChannelData {
  roomId?: string;
  channelId?: string;
  ownerKey: string;
  encryptionKey: string;
  signKey: string;
  SERVER_SECRET: string;
}

interface ChannelKeys {
  exportable_owner_pubKey: CryptoKey;
  exportable_verifiedGuest_pubKey: CryptoKey;
  personal_signKey: CryptoKey;
  room_privateSignKey: CryptoKey;
  encryptionKey: CryptoKey;
  locked_key: CryptoKey;
  shared_key: CryptoKey;
  exportable_locked_key: Dictionary;
}

/*
  format is a single string:

  dZbuNAeDnuMOLPYcfExi4RIUVPljFZUZLE3tUo3zl1-avzxmm9nBhtRPVOwu6kK4
  011000001101110010110011101001000001101001
*/
const msgIdRegex = /^([A-Za-z0-9+/_\-=]{64})*([01]{42})$/;

interface ImageMetaData {
  imageId?: string,
  previewId?: string,
  imageKey?: string,
  previewKey?: string,
}

interface ChannelMessage2 {
  type?: 'invalid' | 'ready',
  keys?: {
    ownerKey: Dictionary,
    encryptionKey: Dictionary,
    signKey: Dictionary,
  },
  _id?: string,
  id?: string,
  timestamp?: number,
  timestampPrefix?: string, // '0'/'1' - 42 of them
  channelID?: string, // base64 - 64 chars (512 bits)
  control?: boolean,
  encrypted_contents?: string,
  image?: string,
  imageMetaData?: ImageMetaData
  motd?: string,
  ready?: boolean,
  roomLocked?: boolean,
  sender_pubKey?: JsonWebKey,
  system?: boolean,
  verficationToken?: string,
}

interface ChannelAckMessage {
  type: 'ack',
  _id: string,
}

interface ChannelSystemMessage {
  type: 'system',
  _id: string,
  systemMessage: string,
}


/* **************** New System **************** */

interface ChannelRoomKeys {
  type: 'roomKeys',
  encryptionKey: JsonWebKey,
  guestKey: JsonWebKey,
  ownerKey: JsonWebKey,
  signKey: JsonWebKey
}

interface ChannelEncryptedMessage {
  type: 'channelMssage',
  // base64 - 64 chars (512 bits), e.g:
  // 'wDUMRbcfFhdmByuwMhFyR46MRlcZh-6gKRUhSPkWEQLSRUPE8_jqixV3VQevTDBy'
  channelID: string,
  // fourty-two (42) 0s and 1s as string, e.g.:
  // '011000001110001011010110101010000100000110'
  timestampPrefix: string,
  encrypted_contents: {
    content: string,
    iv: string,
  }
}

interface ChannelEncryptedMessageArray {
  type: 'channelMessageArray',
  messages: ChannelEncryptedMessageArray[]
}

export type ChannelMessageV2 = ChannelRoomKeys | ChannelEncryptedMessage | ChannelEncryptedMessageArray


/* **************** New System **************** */




interface ChannelMessage1 {
  // currently we can't do a regex match here, and i can't figure
  // out a more clever way of collapsing this.  TODO maybe we should
  // change the message format
  [key: string]: ChannelMessage2,
  message: { [prop: string]: any },
}

export type ChannelMessage = ChannelMessage1 | ChannelMessage2 | ChannelAckMessage

// function dictToMessage(d:  Dictionary | undefined): ChannelMessage {
//   let r: ChannelMessage = {type: 'invalid'} // default
//   if (typeof d == 'undefined') return r
//   try {
//     console.log("dictionary:")
//     console.log(d)
//     console.log("first key:")
//     console.log(Object.keys(d)[0])
//     let m1 = msgIdRegex.exec(Object.keys(d)[0])
//     if (m1) {
//       console.log("regex hit:")
//       console.log(m1[1])
//       console.log(m1[2])
//     }
//     let m2 = msgIdRegex.exec("AeDnuMOLPYcfExi4RIUVPljFZUZLE3tUo3zl1-avzxmm9nBhtRPVOwu6kK401010101")
//     if (!m2) console.log("correctly did not match");
//     console.log(d[0])
//     console.log("json:")
//     console.log(JSON.stringify(d))
//   } catch (e) {
//     // any issues
//     console.info("dictToMessageId() failed to decode message:")
//     console.info(d)
//     console.info("Error:")
//     console.info(e)
//   }
//   return r
// }


/* zen Master: "um" */
export function SB_libraryVersion() {
  return ('THIS IS NEITHER BROWSER NOR NODE THIS IS SPARTA!')
}

/**
 * SB simple events (mesage bus) class
 */
export class MessageBus {
  bus: Dictionary = {}

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
  subscribe(event: string, handler: CallableFunction) {
    this.#select(event).push(handler);
  }

  /**
   * Unsubscribe
   */
  unsubscribe(event: string, handler: CallableFunction) {
    let i = -1;
    if (this.bus[event]) {
      if ((i = this.bus[event].findLastIndex((e: unknown) => e == handler)) != -1) {
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
  publish(event: string, ...args: unknown[]) {
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
export function _sb_assert(val: unknown, msg: string) {
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
export function getRandomValues(buffer: Uint8Array) {
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
export function _assertBase64(base64: string) {
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


const bs2dv = (bs: BufferSource) => bs instanceof ArrayBuffer
  ? new DataView(bs)
  : new DataView(bs.buffer, bs.byteOffset, bs.byteLength)

/**
 * Standardized 'btoa()'-like function, e.g., takes a binary string
 * ('b') and returns a Base64 encoded version ('a' used to be short
 * for 'ascii').
 *
 * @param {bufferSource} ArrayBuffer buffer
 * @return {string} base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array | null): string {
  if (buffer == null) {
    _sb_exception('L509', 'arrayBufferToBase64() -> null paramater')
    return ''
  } else {
    // const view = bs2dv(bufferSource)
    // const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    console.log(buffer)
    // const view = new DataView(buffer)
    const view = bs2dv(buffer)
    const len = view.byteLength;
    const extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
    const len2 = len - extraBytes;
    const parts = new Array(
      Math.floor(len2 / MAX_CHUNK_LENGTH) + Math.sign(extraBytes)
    );
    // const lookup = urlLookup;
    const lookup = b64lookup; // regular atob() doesn't like url friendly
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

export function _appendBuffer(buffer1: Uint8Array | ArrayBuffer, buffer2: Uint8Array | ArrayBuffer): ArrayBuffer {
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
export function importPublicKey(pem?: string) {
  if (typeof pem == 'undefined') pem = defaultPublicKeyPEM;
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
export function simpleRandomString(n: number, code: string): string {
  if (code == 'base32mi') {
    // yeah, of course we need to add base64 etc
    const z = crypto.getRandomValues(new Uint8Array(n));
    let r = '';
    for (let i = 0; i < n; i++) r += base32mi[z[i] & 31];
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
export function packageEncryptDict(dict: Dictionary, publicKeyPEM: string, callback: CallableFunction) {
  const clearDataArrayBufferView = str2ab(JSON.stringify(dict));
  const aesAlgorithmKeyGen = { name: 'AES-GCM', length: 256 };
  const aesAlgorithmEncrypt = { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(16)) };
  if (!publicKeyPEM) publicKeyPEM = defaultPublicKeyPEM;
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
export function partition(str: string, n: number) {
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
export function jsonParseWrapper(str: string, loc: string) {
  // psm: you can't have a return type in TS if the function
  //      might throw an exception
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
      let s2 = '';
      let s3 = '';
      let str2: string | undefined = str
      while (str2 != (s3 = s2, s2 = str2, str2 = str2?.match(/^(['"])(.*)\1$/m)?.[2]))
        return JSON.parse(`'${s3}'`);
    } catch {
      // let's try one more thing
      try {
        return JSON.parse(str.slice(1, -1));
      } catch {
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
export function extractPayloadV1(payload: ArrayBuffer) {
  try {
    const metadataSize = new Uint32Array(payload.slice(0, 4))[0];
    const decoder = new TextDecoder();
    const metadata: Dictionary = jsonParseWrapper(decoder.decode(payload.slice(4, 4 + metadataSize)), 'L476');
    let startIndex = 4 + metadataSize;
    const data: Dictionary = {};
    for (const key in metadata) {
      if (data.key) {
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
export function assemblePayload(data: Dictionary) {
  try {
    const metadata: Dictionary = {};
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
    const metadataBuffer: ArrayBuffer = encoder.encode(JSON.stringify(metadata));
    const metadataSize = new Uint32Array([metadataBuffer.byteLength]);
    // psm: changed to Uint8 .. hope that doesn't break things?
    let payload = _appendBuffer(new Uint8Array(metadataSize.buffer), new Uint8Array(metadataBuffer));
    for (const key in data) {
      if (data.key) {
        payload = _appendBuffer(new Uint8Array(payload), data[key]);
      }
    }
    return payload;
  } catch (e) {
    console.error(e);
    return {};
  }
}

/**
 * Extract payload - this decodes from our binary (wire) format
 * to a JS object. This provides a binary encoding of any JSON,
 * and it allows some elements of the JSON to be raw (binary).
 */
export function extractPayload(payload: ArrayBuffer): Dictionary {
  try {
    // number of bytes of meta data (encoded as a 32-bit Uint)
    const metadataSize = new Uint32Array(payload.slice(0, 4))[0];
    console.info('METADATASIZE: ', metadataSize);
    const decoder = new TextDecoder();
    // extracts the string of meta data and parses
    console.info('METADATASTRING: ', decoder.decode(payload.slice(4, 4 + metadataSize)));
    const _metadata: Dictionary = jsonParseWrapper(decoder.decode(payload.slice(4, 4 + metadataSize)), 'L533');
    console.info('METADATA EXTRACTED', JSON.stringify(_metadata));
    // calculate start of actual contents
    const startIndex: number = 4 + metadataSize;
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
        const data: Dictionary = [];
        for (let i = 1; i < Object.keys(_metadata).length; i++) {
          const _index = i.toString();
          if (_metadata._index) {
            const propertyStartIndex: number = _metadata[_index]['start'];
            // start (in bytes) of contents
            console.info(propertyStartIndex);
            const size: number = _metadata[_index]['size'];
            // where to put it
            const entry: Dictionary = _metadata[_index]
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
  } catch (e) {
    throw new Error('extractPayload() exception (' + e + ')');
  }
}

/**
 * Encode into b64 URL
 */
export function encodeB64Url(input: string) {
  return input.replaceAll('+', '-').replaceAll('/', '_');
}

/**
 * Decode b64 URL
 */
export function decodeB64Url(input: string) {
  input = input.replaceAll('-', '+').replaceAll('_', '/');

  // Pad out with standard base64 required padding characters
  const pad: number = input.length % 4;
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
  extractPubKey(privateKey: JsonWebKey): JsonWebKey | null {
    try {
      const pubKey: JsonWebKey = { ...privateKey };
      delete pubKey.d;
      delete pubKey.dp;
      delete pubKey.dq;
      delete pubKey.q;
      delete pubKey.qi;
      // pubKey.key_ops = [];
      return pubKey;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * Generates standard ``ECDH`` keys using ``P-384``.
   */
  generateKeys() {
    return new Promise<CryptoKeyPair>(async (resolve, reject) => {
      try {
        resolve(await crypto.subtle.generateKey({
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
  importKey(format: KeyFormat, key: BufferSource | JsonWebKey, type: 'ECDH' | 'AES' | 'PBKDF2', extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey> {
    const keyAlgorithms = {
      ECDH: { name: 'ECDH', namedCurve: 'P-384' },
      AES: { name: 'AES-GCM' },
      PBKDF2: 'PBKDF2'
    }
    if (format === 'jwk') {
      return (window.crypto.subtle.importKey('jwk', key as JsonWebKey, keyAlgorithms[type], extractable, keyUsages))
    } else {
      return (window.crypto.subtle.importKey(format, key as BufferSource, keyAlgorithms[type], extractable, keyUsages))
    }
  }

  /**
   * Derive key.
   */
  deriveKey(privateKey: CryptoKey, publicKey: CryptoKey, type: string, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey> {
    return new Promise(async (resolve, reject) => {
      const keyAlgorithms: Dictionary = {
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
        },
          privateKey,
          keyAlgorithms[type],
          extractable,
          keyUsages));
      } catch (e) {
        console.error(e, privateKey, publicKey, type, extractable, keyUsages);
        reject(e);
      }
    });
  }

  /**
   * Get file key
   */
  getFileKey(fileHash: string, _salt: ArrayBuffer) {
    return new Promise(async (resolve, reject) => {
      try {
        const keyMaterial: CryptoKey = await this.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey']);

        // @psm TODO - Support deriving from PBKDF2 in deriveKey function
        const key = await crypto.subtle.deriveKey({
          'name': 'PBKDF2', // salt: crypto.getRandomValues(new Uint8Array(16)),
          'salt': _salt,
          'iterations': 100000, // small is fine, we want it snappy
          'hash': 'SHA-256'
        }, keyMaterial, { 'name': 'AES-GCM', 'length': 256 }, true, ['encrypt', 'decrypt']);
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
  encrypt(contents: BufferSource, secret_key: CryptoKey, outputType = 'string', _iv: ArrayBuffer | null = null): Promise<Dictionary> {
    return new Promise(async (resolve, reject) => {
      try {
        if (contents === null) {
          reject(new Error('no contents'));
        }
        const iv: ArrayBuffer = _iv === null ? crypto.getRandomValues(new Uint8Array(12)) : _iv;
        const algorithm: AesGcmParams = {
          name: 'AES-GCM',
          iv: iv
        };
        const key: CryptoKey = secret_key;
        let data: BufferSource = contents;
        const encoder = new TextEncoder();
        if (typeof contents === 'string') {
          data = encoder.encode(contents);
        }
        let encrypted: ArrayBuffer;
        encrypted = await crypto.subtle.encrypt(algorithm, key, data);
        console.log(encrypted)
        resolve((outputType === 'string') ? {
          content: encodeURIComponent(arrayBufferToBase64(encrypted)), iv: encodeURIComponent(arrayBufferToBase64(iv))
        } : { content: encrypted, iv: iv });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  /**
   * Decrypt
   */
  decrypt(secretKey: CryptoKey, contents: Dictionary, outputType = 'string'): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const ciphertext: BufferSource = typeof contents.content === 'string' ? base64ToArrayBuffer(decodeURIComponent(contents.content)) : contents.content;
        const iv: ArrayBuffer = typeof contents.iv === 'string' ? base64ToArrayBuffer(decodeURIComponent(contents.iv)) : contents.iv;
        const decrypted: ArrayBuffer = await crypto.subtle.decrypt({
          name: 'AES-GCM', iv: iv
        }, secretKey, ciphertext);
        resolve(new TextDecoder().decode(decrypted));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Sign
   */
  sign(secretKey: CryptoKey, contents: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(contents);
        let sign;
        try {
          sign = await crypto.subtle.sign('HMAC', secretKey, encoded);
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
  verify(secretKey: CryptoKey, sign: string, contents: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const _sign = base64ToArrayBuffer(decodeURIComponent(sign));
        const encoder = new TextEncoder();
        const encoded = encoder.encode(contents);
        try {
          const verified = await crypto.subtle.verify('HMAC', secretKey, _sign, encoded);
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
  areKeysSame(key1: Dictionary, key2: Dictionary): boolean {
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
  resolve_exportable_pubKey: (arg0: JsonWebKey | null) => void = (() => { throw new Error('uninit prom called'); })
  resolve_exportable_privateKey: (arg0: JsonWebKey | null) => void = (() => { throw new Error('uninit prom called'); })
  resolve_privateKey: (arg0: CryptoKey | null) => void = (() => { throw new Error('uninit prom called'); })

  exportable_pubKey = new Promise<JsonWebKey | null>((resolve) => this.resolve_exportable_pubKey = resolve)
  exportable_privateKey = new Promise<JsonWebKey | null>((resolve) => this.resolve_exportable_privateKey = resolve)
  privateKey = new Promise<CryptoKey | null>((resolve) => this.resolve_privateKey = resolve)

  /**
   * Mint keys
   */
  mintKeys() {
    return new Promise(async (resolve, reject) => {
      try {
        SB_Crypto.generateKeys().then((keyPair: CryptoKeyPair) => {
          crypto.subtle.exportKey('jwk', keyPair.publicKey).then((k: JsonWebKey) => this.resolve_exportable_pubKey(k))
          crypto.subtle.exportKey('jwk', keyPair.privateKey).then((k: JsonWebKey) => this.resolve_exportable_privateKey(k))
          this.resolve_privateKey(keyPair.privateKey)
          Promise.all([this.resolve_exportable_pubKey, this.resolve_privateKey]).then(() => resolve(true))
        })
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Mount keys
   */
  mountKeys(key: JsonWebKey) {
    return new Promise(async (resolve, reject) => {
      try {
        this.resolve_exportable_privateKey(key)
        this.resolve_exportable_pubKey(SB_Crypto.extractPubKey(key))
        SB_Crypto.importKey('jwk', key, 'ECDH', true, ['deriveKey']).then((k) => {
          this.resolve_privateKey(k)
          resolve(true)
        })
      } catch (e) {
        reject(e);
      }
    });
  }

  get _id() {
    return JSON.stringify(this.exportable_pubKey);
  }
}


interface SBMessageContents {
  sender_pubKey?: JsonWebKey,
  encrypted: boolean,
  body: string,
  sign: string,
  image: string,
  image_sign?: string,
  imageMetadata_sign?: string,
  imageMetaData?: ImageMetaData,
}

/**
 * SBMessage
 * @class
 * @constructor
 * @public
 */
class SBMessage {
  ready
  signKey: CryptoKey
  contents: SBMessageContents = { encrypted: false, body: '', sign: '', image: '', imageMetaData: {} }
  constructor(channel: Channel, body: string) {
    console.log("creating SBMessage on channel:")
    console.log(channel)
    this.contents.body = body;
    this.contents.sender_pubKey = channel.keys.exportable_pubKey // need to get this from SB object
    this.signKey = channel.keys.personal_signKey
    this.ready = new Promise<SBMessage>((resolve) => {
      const sign = SB_Crypto.sign(this.signKey, body);
      const image_sign = SB_Crypto.sign(this.signKey, this.contents.image);
      const imageMetadata_sign = SB_Crypto.sign(this.signKey, JSON.stringify(this.contents.imageMetaData))
      Promise.all([sign, image_sign, imageMetadata_sign]).then((values) => {
        this.contents.sign = values[0]
        this.contents.image_sign = values[1]
        this.contents.imageMetadata_sign = values[2]
        resolve(this)
      })
    })
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
  contents: string = ''
  senderPubKey: CryptoKey;
  sign: Promise<string>;
  data: Dictionary = {
    previewImage: '',
    fullImage: ''
  };
  // psm: this should all be done in a class manner, no?
  //      e.g. SBFileImage inherits from SBFile?
  image = '';
  image_sign: string = '';
  imageMetaData: ImageMetaData = {}
  imageMetadata_sign: string = '';

  // file is an instance of File
  constructor(file: File, signKey: CryptoKey, key: CryptoKey) {
    this.senderPubKey = key;
    // psm: again, why are we signing empty contents?
    this.sign = SB_Crypto.sign(signKey, this.contents);
    if (file.type.match(/^image/i)) {
      this.#asImage(file, signKey)
    } else {
      throw new Error('Unsupported file type: ' + file.type);
    }
  }

  /**
   * asImage
   */
  #asImage(image: File, signKey: CryptoKey) {
    // psm: this should all be replaced by SBImage
    throw new Error('#asImage() needs carryover from SBImage etc')

    // this.data.previewImage = this.#padImage(await (await this.#restrictPhoto(image, 4096, 'image/jpeg', 0.92)).arrayBuffer());
    // const previewHash: Dictionary = await this.#generateImageHash(this.data.previewImage);
    // this.data.fullImage = image.byteLength > 15728640 ? this.#padImage(await (await this.#restrictPhoto(image, 15360, 'image/jpeg', 0.92)).arrayBuffer()) : this.#padImage(image);
    // const fullHash: Dictionary = await this.#generateImageHash(this.data.fullImage);
    // // psm: not sure what this does next, but the new SBImage class should do all this for you
    // // @ts-ignore
    // this.image = await this.#getFileData(await this.#restrictPhoto(image, 15, 'image/jpeg', 0.92), 'url');
    // this.image_sign = await SB_Crypto.sign(signKey, this.image);
    // this.imageMetaData = JSON.stringify({
    //   imageId: fullHash.id,
    //   previewId: previewHash.id,
    //   imageKey: fullHash.key,
    //   previewKey: previewHash.key
    // });
    // this.imageMetadata_sign = await SB_Crypto.sign(signKey, this.imageMetaData)
  }

  /**
   * getFileData
   */
  #getFileData(file: File, outputType: string | ArrayBuffer) {
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
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /**
   * padImage
   */
  #padImage(image_buffer: ArrayBuffer) {
    let _sizes: Array<number> = [128, 256, 512, 1024, 2048, 4096]; // in KB
    _sizes = _sizes.map((size) => size * 1024);
    const image_size: number = image_buffer.byteLength;
    // console.log('BEFORE PADDING: ', image_size)
    let _target: number | null = 0
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
    const _padding_array: Array<number> = [128];
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
    let final_data: ArrayBuffer = _appendBuffer(image_buffer, _padding);
    final_data = _appendBuffer(final_data, new Uint32Array([image_size]).buffer);
    // console.log('AFTER PADDING: ', final_data.byteLength)
    return final_data;
  }

  /**
   * restrictPhoto
   */
  async #restrictPhoto(photo: ArrayBuffer,
    maxSize: number, // in KB
    imageType: 'image/jpeg',
    qualityArgument: number): Promise<Blob | null> {
    // latest and greatest JS version is in:
    // 384-snackabra-webclient/src/utils/ImageProcessor.js
    throw new Error('restrictPhoto() needs TS version')
    return null;
  }

  /**
   * scaleCanvas
   */
  #scaleCanvas(canvas: HTMLCanvasElement, scale: number) {
    // latest and greatest JS version is in:
    // 384-snackabra-webclient/src/utils/ImageProcessor.js
    throw new Error('scaleCanvas() needs TS version')

    const scaledCanvas: HTMLCanvasElement = document.createElement('canvas');
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;
    // console.log(`#### scaledCanvas target W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
    scaledCanvas!
      .getContext('2d')!
      .drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    // console.log(`#### scaledCanvas actual W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
    return scaledCanvas;
  }

  /**
   * generateImageHash
   */
  async #generateImageHash(image: ArrayBuffer): Promise<{ id: string, key: string } | {}> {
    // latest and greatest JS version is in:
    // 384-snackabra-webclient/src/utils/ImageProcessor.js
    throw new Error('generateImageHash() needs TS version')
  }

  /**
   * readPhoto
   */
  async #readPhoto(photo: ImageData) {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const img: HTMLImageElement = document.createElement('img');

    // create img element from File object
    img.src = await new Promise((resolve) => {
      const reader = new FileReader();
      // TODO: the entire readPhoto stuff is replaced by SBImage
      // @ts-ignore
      reader.onload = (e) => resolve(e.target?.result);
      // TODO: ditto
      // @ts-ignore
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
    canvas.width = img.width
    canvas.height = img.height
    canvas!.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas
  }
}

class SBWebSocket {
  ready
  #closed = false
  #url: string
  #websocket: WebSocket
  #timeout = 30000
  onMessage: CallableFunction
  constructor(url: string, onMessage: CallableFunction) {
    this.#url = url
    this.onMessage = onMessage
    this.#websocket = new WebSocket(url) // this one will be discarded
    this.ready = this.#readyPromise(url)
  }
  #ack: Dictionary = []
  #processMessage(m: any) {
    // receives the message, can be of any type
    console.log("got raw message:")
    console.log(m)
    const data = jsonParseWrapper(m, 'L1489')
    console.log("... unwrapped:")
    console.log(data)
    if (data.ack) {
      const r = this.#ack[data._id]
      if (r) {
        delete this.#ack[data._id]
        r() // resolve
      }
    } else if (data.nack) {
      console.error('Nack received')
      this.#closed = true
      this.#websocket.close()
    } else if (typeof this.onMessage === 'function') {
      if (this.onMessage(data)) this.onMessage(data)
    } else {
      _sb_exception('SBWebSocket', 'received message but there is no hander')
    }
  }
  #readyPromise(url: string) {
    return new Promise<SBWebSocket>((resolve, reject) => {
      try {
        if (this.#websocket) this.#websocket.close() // keep clean
        const ws = this.#websocket = new WebSocket(url)
        ws.addEventListener('open', () => { this.#closed = false; resolve(this) })
        ws.addEventListener('message', (e: MessageEvent) => this.#processMessage(e.data))
        ws.addEventListener('close', (e: CloseEvent) => {
          this.#closed = true
          if (!e.wasClean) {
            console.log('sbWebSocket() was closed (and NOT cleanly): ', e.reason)
          } else {
            console.log('sbWebSocket() was closed (cleanly): ', e.reason)
          }
          reject('wbSocket() closed before it was opened (?)')
        })
        ws.addEventListener('error', (e) => {
          this.#closed = true
          console.log('sbWebSocket() error: ', e)
          reject('sbWebSocket creation error (see log)')
        })
      } catch (e) {
        this.#closed = true
        console.log(e)
        reject('failed to create sbWebSocket, see log')
      }
    })
  }
  send(m: string) {
    // for future inspiration here are more thoughts on making this more iron clad:
    // https://stackoverflow.com/questions/29881957/websocket-connection-timeout
    return new Promise((resolve, reject) => {
      if (this.#closed) this.ready = this.#readyPromise(this.#url)
      this.ready.then(() => {
        switch (this.#websocket.readyState) {
          case 1: // OPEN
            this.ready.then(() => {
              crypto.subtle.digest('SHA-256', new TextEncoder().encode(m)).then((hash) => {
                const _id = arrayBufferToBase64(hash)
                const ackPayload = { timestamp: Date.now(), type: 'ack', _id: _id }
                this.#ack[_id] = resolve
                this.#websocket.send(m);
                // TODO: update protocol so server acks on message
                this.#websocket.send(JSON.stringify(ackPayload));
                setTimeout(() => {
                  if (this.#ack[_id]) {
                    delete this.#ack[_id]
                    const error = `Websocket request timed out after ${this.#timeout}ms (${_id})`
                    console.error(error)
                    reject(new Error(error))
                  } else {
                    // normal behavior
                  }
                }, this.#timeout)
              })
            })
            break
          case 3: // CLOSED
          case 0: // CONNECTING
          case 2: // CLOSING
            const errMsg = 'socket not OPEN - either CLOSED or in the state of CONNECTING/CLOSING'
            _sb_exception('sbWebSocket', 'socket not OPEN - either CLOSED or in the state of CONNECTING/CLOSING')
        }
      })
    })
  }
}

// /**
//  * mtg: Protocol code that we wrap our WebSocket in
//  * I will be updating this to send messages and remove
//  * the wait to send messages only when ack received
//  * The benefit is reduced latency in communication protocol
//  */
// class WS_Protocol {
//   currentWebSocket!: WebSocket;
//   _id!: string;
//   events = new MessageBus();
//   #options: WSProtocolOptions = {
//     url: '', onOpen: null, onMessage: null, onClose: null, onError: null, timeout: 30000
//   };

//   constructor(options: WSProtocolOptions) {
//     if (!options.url) {
//       throw new Error('URL must be set');
//     }
//     this.#options = Object.assign(this.options, options);
//     this.join();
//   }

//   /**
//    * WS_Protocol
//    * Get options
//    */
//   get options() {
//     return this.#options;
//   }

//   /**
//    * WS_Protocol
//    * join
//    */
//   join(): Promise<boolean> {
//     return new Promise((resolve, reject) => {
//       try {
//         this.currentWebSocket = new WebSocket(this.options.url);
//         this.onError();
//         this.onClose();
//         this.onOpen();
//         this.onMessage();
//         resolve(true);
//       } catch (e) {
//         console.error(e);
//         reject(e);
//       }
//     });
//   }

//   /**
//    * WS_Protocol
//    * close
//    */
//   close() {
//     this.currentWebSocket.close();
//   }

//   send = (message: string): Promise<boolean> => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         if (this.currentWebSocket.readyState === 1) {
//           const hash = await crypto.subtle
//             .digest('SHA-256', new TextEncoder().encode(message));
//           const ackPayload = {
//             timestamp: Date.now(), type: 'ack', _id: arrayBufferToBase64(hash)
//           };
//           this.currentWebSocket.send(message);
// 	  // TODO: update protocol so server acks on message
//           this.currentWebSocket.send(JSON.stringify(ackPayload));

//           const timeout = setTimeout(() => {
//             const error = `Websocket request timed out after ${this.options.timeout}ms`;
//             console.error(error, 'ws_ack_' + ackPayload._id);
//             reject(new Error(error));
//           }, this.options.timeout);

//           const ackResponse = () => {
//             clearTimeout(timeout);
//             this.events.unsubscribe('ws_ack_' + ackPayload._id, ackResponse);
//             resolve(true);
//           };

//           this.events.subscribe('ws_ack_' + ackPayload._id, ackResponse);
//         }
//       } catch (e) {
//         console.error(e);
//       }
//     });
//   };

//   /**
//    * WS_Protocol
//    * onError
//    */
//   onError() {
//     this.currentWebSocket.addEventListener('error', (event) => {
//       console.error('WebSocket error, reconnecting:', event);
//       if (typeof this.options.onError === 'function') {
//         this.options.onError(event);
//       }
//     });
//   }

//   /**
//    * WS_Protocol
//    * onClose
//    */
//   onClose() {
//     this.currentWebSocket.addEventListener('close', (event) => {
//       console.info('Websocket closed', event);
//       if (typeof this.options.onClose === 'function') {
//         this.options.onClose(event);
//       }
//     });
//   }

//   /**
//    * WS_Protocol
//    * onMessage
//    */
//   onMessage() {
//     this.currentWebSocket.addEventListener('message', (event) => {
//       const data = jsonParseWrapper(event.data, 'L1342');
//       // console.log(data)

//       dispatchMessage(data)

//       if (data.ack) {
//         this.events.publish('ws_ack_' + data._id);
//         return;
//       }
//       if (data.nack) {
//         console.error('Nack received');
//         this.close();
//         return;
//       }
//       if (typeof this.options.onMessage === 'function') {
//         this.options.onMessage(data);
//       }
//     });
//   }

//   /**
//    * WS_Protocol
//    * readyState
//    */
//   get readyState() {
//     return this.currentWebSocket.readyState;
//   }

//   /**
//    * WS_Protocol
//    * onOpen
//    */
//   onOpen() {
//     this.currentWebSocket.addEventListener('open', (event) => {
//       if (typeof this.options.onOpen === 'function') {
//         this.options.onOpen(event);
//       }
//     });
//   }
// }

/**
 * Channel
 *
 * @class
 * @constructor
 * @public
 */
class Channel {
  // url: string;
  // wss: string;
  ready
  sbServer: Snackabra
  channel_id
  defaultIdentity?: Identity

  owner: boolean = false;
  admin: boolean = false;
  verifiedGuest: boolean = false;
  metaData: Dictionary = {};
  #keys!: Dictionary;
  #api!: ChannelApi;
  #socket!: ChannelSocket;

  storage?: StorageApi // TODO: in principle should be optional?

  // constructor(https: string, wss: string, identity: Identity) {
  //   this.url = https;
  //   this.wss = wss;
  //   this.identity = identity;
  // }

  /*
   * Channel()
   * Join a channel, returns channel object
   *
   * @param {Snackabra} which server to join
   * @param {Identity} your identity on this channel
   * @param {string} channel_id (the :term:`Channel Name`)
   */
  constructor(sbServer: Snackabra, channel_id: string, identity: Identity) {
    this.sbServer = sbServer
    this.defaultIdentity = identity
    _sb_assert(channel_id != null, 'channel_id cannot be null') // TODO: this can be done with types
    this.channel_id = channel_id

    this.#api = new ChannelApi(this.sbServer, this, this.identity)
    this.#socket = new ChannelSocket(this.sbServer, this, this.identity)
    this.#socket.onJoin = (message: Dictionary) => {
      if (message?.ready) {

        console.log(message);
        this.metaData = message;
        this.loadKeys(message.keys).then(() => {
          this.socket.isReady();
          // resolve(this);
        });
      }
    }

    // we're ready when the ChannelSocket is ready, but note that the ready function can change
    this.ready = (() => { return this.#socket.ready; })
  }


  // /**
  //  * Channel.join()
  //  */
  // join(channel_id: string): Promise<Channel> {
  // }

  /**
   * Channel.keys()
   *
   * Return keys
   */
  get keys() {
    return this.#keys;
  }

  /**
   * Channel.api()
   */
  get api() {
    return this.#api;
  }

  /**
   * Channel.socket()
   */
  get socket() {
    return this.#socket;
  }

  /**
   * Channel.loadKeys()
   */
  loadKeys(keys: Dictionary) {
    return new Promise(async (resolve, reject) => {
      if (keys.ownerKey === null) {
        reject(new Error('Channel does not exist'));
      }
      let _exportable_owner_pubKey: Dictionary = jsonParseWrapper(keys.ownerKey || JSON.stringify({}), 'L1460');
      if (_exportable_owner_pubKey.key) {
        _exportable_owner_pubKey = typeof _exportable_owner_pubKey.key === 'object' ? _exportable_owner_pubKey.key : jsonParseWrapper(_exportable_owner_pubKey.key, 'L1463');
      }
      try {
        _exportable_owner_pubKey.key_ops = [];
      } catch (error) {
        reject(error);
      }
      const _exportable_room_signKey: JsonWebKey = jsonParseWrapper(keys.signKey, 'L1470');
      const _exportable_encryption_key: JsonWebKey = jsonParseWrapper(keys.encryptionKey, 'L1471');
      let _exportable_verifiedGuest_pubKey: JsonWebKey = jsonParseWrapper(keys.guestKey || null, 'L1472');
      const _exportable_pubKey: JsonWebKey = await this.identity.exportable_pubKey.then();
      const _privateKey: CryptoKey = await this.identity.privateKey.then();
      let isVerifiedGuest = false;
      const _owner_pubKey = await SB_Crypto.importKey('jwk', _exportable_owner_pubKey, 'ECDH', false, []);
      const isOwner = SB_Crypto.areKeysSame(_exportable_pubKey, _exportable_owner_pubKey);
      // @psm TODO .. hardcoded i don't know what this does ...
      // if (process.browser) {
      //const isAdmin: boolean = (document.cookie.split('; ').find((row: string) => row.startsWith('token_' +
      // this._id)) !== undefined) || (this.url !== 'https://s_socket.privacy.app' && isOwner);

      // TODO: this is hardcoded, and needs different solution
      // if (<?>) {
      //   const isAdmin: boolean = (this.url !== 'https://s_socket.privacy.app' && isOwner);
      // } else {
      //   isAdmin = (process.env.REACT_APP_ROOM_SERVER !== 's_socket.privacy.app' && isOwner);
      // }
      const isAdmin: boolean = false


      if (!isOwner && !isAdmin) {
        if (_exportable_verifiedGuest_pubKey === null) {
          this.api.postPubKey(_exportable_pubKey);
          _exportable_verifiedGuest_pubKey = { ..._exportable_pubKey };
        }
        if (SB_Crypto.areKeysSame(_exportable_verifiedGuest_pubKey, _exportable_pubKey)) {
          isVerifiedGuest = true;
        }
      }

      const _encryption_key: CryptoKey = await SB_Crypto.importKey('jwk', _exportable_encryption_key, 'AES', false, ['encrypt', 'decrypt']);

      const _room_privateSignKey: CryptoKey = await SB_Crypto.importKey('jwk', _exportable_room_signKey, 'ECDH', true, ['deriveKey']);
      const _exportable_room_signPubKey: JsonWebKey | null = SB_Crypto.extractPubKey(_exportable_room_signKey);

      const _room_signPubKey: CryptoKey = await SB_Crypto.importKey('jwk', _exportable_room_signPubKey!, 'ECDH', true, []);
      const _personal_signKey: CryptoKey = await SB_Crypto.deriveKey(_privateKey, _room_signPubKey, 'HMAC', false, ['sign', 'verify']);
      let _shared_key: CryptoKey | null;

      if (!isOwner) {
        _shared_key = await SB_Crypto.deriveKey(_privateKey, _owner_pubKey, 'AES', false, ['encrypt', 'decrypt']);
      }

      let _locked_key
      // if (process.browser) {
      let _exportable_locked_key: string | null = await _localStorage.getItem(this.channel_id + '_lockedKey');
      // } else {
      //   _exportable_locked_key = await _localStorage.getItem(this._id + '_lockedKey');
      // }
      if (_exportable_locked_key !== null) {
        _locked_key: CryptoKey = await SB_Crypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key, 'L1517'), 'AES', false, ['encrypt', 'decrypt']);
      } else if (keys.locked_key) {
        const _string_locked_key: string = await SB_Crypto.decrypt(isOwner ? await SB_Crypto.deriveKey(keys.privateKey, await SB_Crypto.importKey('jwk', keys.exportable_pubKey, 'ECDH', true, []), 'AES', false, ['decrypt']) : _shared_key!, jsonParseWrapper(keys.locked_key, 'L1519'), 'string');
        _exportable_locked_key = jsonParseWrapper(_string_locked_key, 'L1520');
        _locked_key = await SB_Crypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key!, 'L1521'), 'AES', false, ['encrypt', 'decrypt']);
      }

      this.#keys = {
        shared_key: _shared_key!,
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

/** Class managing connections */
class ChannelSocket {
  ready
  // socket!: WS_Protocol;
  sbWebSocket: SBWebSocket
  #url: string;
  init!: Dictionary;
  channelId: string;
  #channel: Channel;
  #identity: Identity;
  // #payload: Payload;
  #queue: Array<SBMessage> = [];
  // ready = false;
  onOpen!: CallableFunction;
  onJoin!: CallableFunction;
  onClose!: CallableFunction;
  onError!: CallableFunction;
  onMessage!: CallableFunction;
  onSystemInfo!: CallableFunction;
  // channelCryptoKey: CryptoKey

  constructor(sbServer: Snackabra, channel: Channel, identity: Identity) {
    this.channelId = channel._id;
    // this.url = sbServer.SnackabraOptions.channel_ws
    this.#channel = channel
    this.#identity = identity
    // this.#payload = new Payload();
    // this.open()
    this.#url = sbServer.options.channel_server + '/api/room/' + this.channelId + '/websocket',
      this.sbWebSocket = new SBWebSocket(this.#url, this.receive)
    // we're ready when the socket is ready, but note that the ready function can change
    this.ready = (() => { return this.sbWebSocket.ready; })
  }

  // /**
  //  * setKeys
  //  */
  // setKeys(_keys: Dictionary) {
  //   this.#channel.loadKeys(_keys);
  // }

  #wrap(sbMessage: SBMessage): Promise<string> {
    contents.ready.then(() => {
      // TODO - in progress
      SB_Crypto.encrypt(str2ab(JSON.stringify(sbMessage.contents)), key, 'string').then((c) => {
        const msg = { encrypted_contents: c }
      })
    })
    // return new Promise(async (resolve, reject) => {
    //   try {
    //     const msg = {encrypted_contents: await SB_Crypto.encrypt(str2ab(JSON.stringify(contents)), key, 'string')};
    //     resolve(JSON.stringify(msg));
    //   } catch (e) {
    //     console.error(e);
    //     reject(new Error('Unable to encrypt payload.'));
    //   }
    // });
  }

  async unwrap(payload: Dictionary, key: CryptoKey) {
    try {
      const msg = await SB_Crypto.decrypt(key, payload.encrypted_contents);
      // psm: i think this throws in case of error
      // if (msg['error']) {
      //   return {error: msg['error']};
      // }
      return msg;
    } catch (e) {
      return { error: `Error: ${e}` };
    }
  }


  /**
   * ChannelSocket.open()
   *
   */
  open() {
    const options: WSProtocolOptions = {
      url: this.url + '/api/room/' + this.channelId + '/websocket',
      onOpen: async (event: WebSocketEventMap) => {
        console.info('websocket opened');
        this.init = { name: JSON.stringify(this.#identity.exportable_pubKey) };
        await this.socket.send(JSON.stringify(this.init));
        if (typeof this.onOpen === 'function') {
          this.onOpen(event);
        }
      },
      onMessage: async (event: ChannelMessage) => {
        console.log("****** start: onMessage() *****")
        console.log(event)
        console.log("****** end: onMessage() *****")
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
      onClose: (event: WebSocketEventMap) => {
        if (typeof this.onClose === 'function') {
          this.onClose(event);
        }
      },
      onError: (event: WebSocketEventMap) => {
        if (typeof this.onError === 'function') {
          this.onError(event);
        }
      }
    };
    this.socket = new WS_Protocol(options);
  }

  /**
   * ChannelSocket.close()
   */
  close() {
    this.socket.close();
  }

  /**
   * ChannelSocket.isReady()
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
   * ChannelSocket.send()
   *
   * @param {SBMessage} the message object to send
   */
  async send(message: SBMessage) {

    // message.ready.then(() => {
    //   if (this.ready) {
    // 	let payload;
    // 	this.#payload.wrap(
    //       message,
    //       this.#channel.keys.encryptionKey
    // 	).then((payload) => { this.socket.send(payload) });
    //   } else {
    // 	this.#queue.push(message);
    //   }
    // });
  }

  /**
   * ChannelSocket.sendSbObject()
   *
   * Send SB object (file) on channel socket
   */
  async sendSbObject(file: SBMessage) {
    if (this.ready) {
      this.#payload.wrap(
        file,
        this.#channel.keys.encryptionKey
      ).then((payload) => this.socket.send(payload));
    } else {
      this.#queue.push(file);
    }
  }

  /**
   * ChannelSocket.receive()
   *
   * Receive message on channel socket
   * psm: updating using new cool types
   * (it will arrive mostly unwrapped)
   */
  async receive(message: ChannelMessage) {
    // 'id' will be first message
    const id = Object.keys(message)[0];
    let unwrapped: string
    if (message.encrypted_contents) {
      try {
        unwrapped = await SB_Crypto.decrypt(this.#channel.keys.encryptionKey,
          message[id].encrypted_contents, 'string');
      } catch (e) {
        console.warn(e);
        unwrapped = await SB_Crypto.decrypt(this.#channel.keys.locked_key,
          message[id].encrypted_contents, 'string');
      }
    } else {
      unwrapped = jsonParseWrapper(unwrapped, 'L1702');
      // psm: TODO, i don't know what messages are really supposed to look like in all cases
      unwrapped._id = id;
      _localStorage.setItem(this.#channel._id + '_lastSeenMessage', id.slice(this.#channel._id.length));
      if (message._id) _localStorage.setItem(this.#channel._id + '_lastSeenMessage', message._id)
      return JSON.stringify(unwrapped);
      return message
    }
  }

} // end of class ChannelSocket


/**
 * Storage API
 * @class
 * @constructor
 * @public
 */
class StorageApi {
  server!: string;
  #channel!: Channel;
  #identity!: Identity;

  constructor(server: string, channel: Channel, identity: Identity) {
    this.server = server + '/api/v1';
    this.#channel = channel;
    this.#identity = identity;
  }

  /**
   * StorageApi.saveFile()
   */
  async saveFile(file: File) {
    if (file instanceof File) {
      // psm: need to clean up these types
      const sbFile = await new SBFile(file, this.#channel.keys.personal_signKey, this.#identity.exportable_pubKey!);
      // const metaData: Dictionary = jsonParseWrapper(sbFile.imageMetaData, 'L1732');
      const metaData: ImageMetaData = sbFile.imageMetaData
      const fullStorePromise = this.storeImage(sbFile.data.fullImage, metaData.imageId!, metaData.imageKey!, 'f');
      const previewStorePromise = this.storeImage(sbFile.data.previewImage, metaData.previewId!, metaData.previewKey!, 'p');
      Promise.all([fullStorePromise, previewStorePromise]).then((results) => {
        results.forEach((controlData: Dictionary) => {
          this.#channel.socket.sendSbObject({ ...controlData, control: true });
        });
        // psm: need to generalize classes ... sbFile and sbImage descent from sbMessage?
        this.#channel.socket.sendSbObject(sbFile);
      });
    } else {
      throw new Error('Must be an instance of File accepted');
    }
  }

  /**
   * StorageApi().getFileKey
   */
  async #getFileKey(fileHash: string, _salt: Uint8Array) {
    const keyMaterial = await SB_Crypto.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey']);

    // @psm TODO - Support deriving from PBKDF2 in deriveKey function
    const key: CryptoKey = await crypto.subtle.deriveKey({
      'name': 'PBKDF2',
      'salt': _salt,
      'iterations': 100000, // small is fine, we want it snappy
      'hash': 'SHA-256'
    }, keyMaterial, { 'name': 'AES-GCM', 'length': 256 }, true, ['encrypt', 'decrypt']);
    // return key;
    return key;
  }

  /**
   * StorageApi().storeRequest
   */
  storeRequest(fileId: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      fetch(this.server + '/storeRequest?name=' + fileId)
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.arrayBuffer();
        })
        .then((data: ArrayBuffer) => {
          resolve(data);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  /**
   * StorageApi().storeData()
   */
  storeData(type: string, fileId: string, encrypt_data: Dictionary, storageToken: string, data: Dictionary): Promise<Dictionary> {
    return new Promise((resolve, reject) => {
      fetch(this.server + '/storeData?type=' + type + '&key=' + encodeURIComponent(fileId), {
        // psm: need to clean up these types
        method: 'POST', body: assemblePayload({
          iv: encrypt_data.iv,
          salt: encrypt_data.salt,
          image: data.content,
          storageToken: (new TextEncoder()).encode(storageToken),
          vid: crypto.getRandomValues(new Uint8Array(48))
        })
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data) => {
          resolve(data);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  /**
   * StorageApi().storeImage()
   */
  storeImage(image: string | ArrayBuffer, image_id: string, keyData: string, type: string) {
    // latest and greatest JS version is in:
    // 384-snackabra-webclient/src/utils/ImageProcessor.js
    throw new Error('Storage() needs TS version')
  }

  /**
   * StorageApi().fetchData()
   */
  fetchData(msgId: string, verificationToken: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      fetch(this.server + '/fetchData?id=' + encodeURIComponent(msgId) + '&verification_token=' + verificationToken, {
        method: 'GET'
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.arrayBuffer();
        })
        .then((data: ArrayBuffer) => {
          resolve(data);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  /**
   * StorageApi().unpadData()
   */
  #unpadData(data_buffer: ArrayBuffer): ArrayBuffer {
    const _size = new Uint32Array(data_buffer.slice(-4))[0];
    return data_buffer.slice(0, _size);
  }

  /**
   * StorageApi().retrieveData()
   * retrieves an object from storage
   */
  async retrieveData(msgId: string,
    messages: Array<ChannelMessage>,
    controlMessages: Array<ChannelMessage>): Promise<Dictionary> {
    console.log("... need to code up retrieveData() with new typing ..")
    console.log(msgId)
    console.log(messages)
    console.log(controlMessages)
    console.error("... need to code up retrieveData() with new typing ..")

    const imageMetaData: ImageMetaData = messages.find((msg) => msg._id === msgId)?.imageMetaData as ImageMetaData
    const image_id: string = imageMetaData!.previewId!;
    // const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.id && ctrl_msg.id.startsWith(image_id));
    const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.id && ctrl_msg.id == image_id)!
    if (!control_msg) {
      return { 'error': 'Failed to fetch data - missing control message for that image' };
    }
    // const imageFetch = await this.fetchData(control_msg.id, control_msg.verificationToken);
    const imageFetch = await this.fetchData(control_msg.id, control_msg.verificationToken);
    // extracts from binary format
    const data = extractPayload(imageFetch);
    const iv: number = data.iv;
    const salt: Uint8Array = data.salt;
    const image_key: CryptoKey = await this.#getFileKey(imageMetaData.previewKey, salt);
    const encrypted_image: string = data.image;
    const padded_img: ArrayBuffer = str2ab(await SB_Crypto.decrypt(image_key, { content: encrypted_image, iv: iv }, 'arrayBuffer'));
    const img: ArrayBuffer = this.#unpadData(padded_img);
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
  async retrieveDataFromMessage(message: Dictionary, controlMessages: Array<Dictionary>) {
    const imageMetaData: ImageMetaData = typeof message.imageMetaData === 'string' ? jsonParseWrapper(message.imageMetaData, 'L1893') : message.imageMetaData;
    const image_id: string = imageMetaData.previewId;
    const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.id && ctrl_msg.id === image_id);
    if (!control_msg) {
      return { 'error': 'Failed to fetch data - missing control message for that image' };
    }
    const imageFetch: ArrayBuffer = await this.fetchData(control_msg.id, control_msg.verificationToken);
    const data: Dictionary = extractPayload(imageFetch);
    const iv: number = data.iv;
    const salt: Uint8Array = data.salt;
    const image_key: CryptoKey = await this.#getFileKey(imageMetaData.previewKey, salt);
    const encrypted_image: string = data.image;
    const padded_img: ArrayBuffer = str2ab(await SB_Crypto.decrypt(image_key, {
      content: encrypted_image,
      iv: iv
    }, 'arrayBuffer'));
    const img: ArrayBuffer = this.#unpadData(padded_img);

    // if (img.error) {
    //   console.error('(Image error: ' + img.error + ')');
    //   throw new Error('Failed to fetch data - authentication or formatting error');
    // }

    return { 'url': 'data:image/jpeg;base64,' + arrayBufferToBase64(img) };
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
  server: string;
  #identity: Identity;
  #channel: Channel;
  #channelApi: string;
  #channelServer: string;
  #payload: Payload;

  constructor(sbServer: Snackabra, channel: Channel, identity: Identity) {
    this.#sbServer = sbServer
    this.#server = this.sbServer.SnackabraOptions.channel_server
    this.#channel = channel
    // this.#payload = new Payload()
    this.#channelApi = this.#server + '/api/'
    this.#channelServer = this.#server + '/api/room/'
    this.#identity = identity
  }

  /**
   * getLastMessageTimes
   */
  getLastMessageTimes() {
    return new Promise((resolve, reject) => {
      fetch(this.#channelApi + '/getLastMessageTimes', {
        method: 'POST', body: JSON.stringify([this.#channel._id])
      }).then((response: Response) => {
        if (!response.ok) {
          reject(new Error('Network response was not OK'));
        }
        return response.json();
      }).then((message_times) => {
        resolve(message_times[this.#channel._id]);
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }

  /**
   * getOldMessages
   */
  getOldMessages(currentMessagesLength: number) {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/oldMessages?currentMessagesLength=' + currentMessagesLength, {
        method: 'GET',
      }).then((response: Response) => {
        if (!response.ok) {
          reject(new Error('Network response was not OK'));
        }
        return response.json();
      }).then((_encrypted_messages) => {
        resolve(_encrypted_messages);
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }

  /**
   * updateCapacity
   */
  updateCapacity(capacity: number) {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/updateRoomCapacity?capacity=' + capacity, {
        method: 'GET', credentials: 'include'
      }).then((response: Response) => {
        if (!response.ok) {
          reject(new Error('Network response was not OK'));
        }
        return response.json();
      }).then((data) => {
        resolve(data);
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }

  /**
   * getCapacity
   */
  getCapacity() {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/getRoomCapacity', {
        method: 'GET', credentials: 'include'
      }).then((response: Response) => {
        if (!response.ok) {
          reject(new Error('Network response was not OK'));
        }
        return response.json();
      }).then((data: Dictionary) => {
        resolve(data.capacity);
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }

  /**
   * getJoinRequests
   */
  getJoinRequests() {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/getJoinRequests', {
        method: 'GET', credentials: 'include'
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          if (data.error) {
            reject(new Error(data.error));
          }
          resolve(data);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  /**
   * isLocked
   */
  isLocked() {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/roomLocked', {
        method: 'GET', credentials: 'include'
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          resolve(data.locked);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  /**
   * Set message of the day
   */
  setMOTD(motd: string) {
    return new Promise((resolve, reject) => {
      //if (this.#channel.owner) {
      fetch(this.#channelServer + this.#channel._id + '/motd', {
        method: 'POST', body: JSON.stringify({ motd: motd }), headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          resolve(data);
        }).catch((error: Error) => {
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
      const token_data: string = new Date().getTime().toString();
      const token_sign: string = await SB_Crypto.sign(this.#channel.keys.personal_signKey, token_data);
      fetch(this.#channelServer + this.#channel._id + '/getAdminData', {
        method: 'GET', credentials: 'include', headers: {
          'authorization': token_data + '.' + token_sign, 'Content-Type': 'application/json'
        }
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          if (data.error) {
            reject(new Error(data.error));
          }
          resolve(data);
        }).catch((error: Error) => {
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
      fetch(this.#channelServer + this.#channel._id + '/downloadData', {
        method: 'GET', credentials: 'include', headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          resolve(data);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  uploadChannel(channelData: ChannelData) {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/uploadRoom', {
        method: 'POST', body: JSON.stringify(channelData), headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          resolve(data);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  authorize(ownerPublicKey: Dictionary, serverSecret: string) {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/authorizeRoom', {
        method: 'POST',
        body: JSON.stringify({ roomId: this.#channel._id, SERVER_SECRET: serverSecret, ownerKey: ownerPublicKey })
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          resolve(data);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  postPubKey(_exportable_pubKey: Dictionary) {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/postPubKey?type=guestKey', {
        method: 'POST',
        body: JSON.stringify(_exportable_pubKey),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          resolve(data);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  storageRequest(byteLength: number): Promise<Dictionary> {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/storageRequest?size=' + byteLength, {
        method: 'GET', credentials: 'include', headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          resolve(data);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  lock() {
    return new Promise(async (resolve, reject) => {
      if (this.#channel.keys.locked_key == null && this.#channel.admin) {
        const _locked_key: CryptoKey = await crypto.subtle.generateKey({
          name: 'AES-GCM', length: 256
        }, true, ['encrypt', 'decrypt']);
        const _exportable_locked_key: Dictionary = await crypto.subtle.exportKey('jwk', _locked_key);
        fetch(this.#channelServer + this.#channel._id + '/lockRoom', {
          method: 'GET', credentials: 'include'
        })
          .then((response: Response) => {
            if (!response.ok) {
              reject(new Error('Network response was not OK'));
            }
            return response.json();
          })
          .then(async (data: Dictionary) => {
            if (data.locked) {
              await this.acceptVisitor(JSON.stringify(this.#identity.exportable_pubKey));
            }
            resolve({ locked: data.locked, lockedKey: _exportable_locked_key });
          }).catch((error: Error) => {
            reject(error);
          });
      }
    });
  }

  acceptVisitor(pubKey: string) {
    return new Promise(async (resolve, reject) => {
      // psm: need some "!"
      const shared_key: CryptoKey = await SB_Crypto.deriveKey(await this.#identity.privateKey, await SB_Crypto.importKey('jwk', jsonParseWrapper(pubKey, 'L2276'), 'ECDH', false, []), 'AES', false, ['encrypt', 'decrypt']);
      const _encrypted_locked_key: Dictionary = await SB_Crypto.encrypt(str2ab(JSON.stringify(this.#channel.keys.exportable_locked_key)), shared_key, 'string')
      fetch(this.#channelServer + this.#channel._id + '/acceptVisitor', {
        method: 'POST',
        body: JSON.stringify({ pubKey: pubKey, lockedKey: JSON.stringify(_encrypted_locked_key) }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          resolve(data);
        }).catch((error: Error) => {
          reject(error);
        });
    });
  }

  ownerKeyRotation() {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel._id + '/ownerKeyRotation', {
        method: 'GET', credentials: 'include', headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(new Error('Network response was not OK'));
          }
          return response.json();
        })
        .then((data: Dictionary) => {
          resolve(data);
        }).catch((error: Error) => {
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
 * Augments IndexedDB to be used as a KV to easily
 * replace _localStorage for larger and more complex datasets
 *
 * @class
 * @constructor
 * @public
 */
class IndexedKV {
  db!: IDBDatabase;
  events = new MessageBus();
  options: IndexedKVOptions = {
    db: 'MyDB', table: 'default', onReady: () => {
      return;
    },
  };

  // psm: override doesn't seem to be used
  constructor(/* options: IndexedKVOptions */) {
    // psm: hm?
    this.options = Object.assign(this.options, this.options);
    if (typeof this.options.onReady === 'function') {
      this.events.subscribe(`ready`, (e: Error) => {
        this.options.onReady(e);
      });
    }
    // if (!process.browser) {
    //   this.indexedDB = global.indexedDB;
    // } else {
    // }

    const openReq = indexedDB.open(this.options.db);

    openReq.onerror = (event: Dictionary) => {
      console.error(event);
    };

    openReq.onsuccess = (event: Dictionary) => {
      this.db = event.target.result;
      this.events.publish('ready');
    };

    openReq.onerror = (event: Dictionary) => {
      console.error('Database error: ' + event.target.errorCode);
    };

    openReq.onupgradeneeded = (event: Dictionary) => {
      this.db = event.target.result;
      this.db.createObjectStore(this.options.table, { keyPath: 'key' });
      this.#useDatabase();
      this.events.publish('ready');
    };
  }

  openCursor(match: string, callback: CallableFunction) {
    return new Promise((resolve, reject) => {
      const objectStore = this.db.transaction([this.options.table], 'readonly').objectStore(this.options.table);
      const request = objectStore.openCursor(null, 'next');
      request.onsuccess = (event: Dictionary) => {
        resolve(event.target.result);
        const cursor = event.target.result;
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
      request.onerror = (event: Dictionary) => {
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
      const objectStore = this.db.transaction([this.options.table], 'readwrite').objectStore(this.options.table);
      const request = objectStore.get(key);
      request.onerror = (event: Dictionary) => {
        reject(event);
      };
      request.onsuccess = (event: Dictionary) => {
        const data = event?.target?.result;

        if (data?.value) {
          data.value = value;
          const requestUpdate = objectStore.put(data);
          requestUpdate.onerror = (event: Dictionary) => {
            reject(event);
          };
          requestUpdate.onsuccess = (event: Dictionary) => {
            const data = event.target.result;
            resolve(data.value);
          };
        } else {
          const requestAdd = objectStore.add({ key: key, value: value });
          requestAdd.onsuccess = (event: Dictionary) => {
            resolve(event.target.result);
          };

          requestAdd.onerror = (event: Dictionary) => {
            reject(event);
          };
        }
      };
    });
  }

  //Add item but not replace
  add(key: string, value: StorableDataType) {
    return new Promise((resolve, reject) => {
      const objectStore = this.db.transaction([this.options.table], 'readwrite').objectStore(this.options.table);
      const request = objectStore.get(key);
      request.onerror = (event: Dictionary) => {
        reject(event);
      };
      request.onsuccess = (event: Dictionary) => {
        const data = event?.target?.result;

        if (data?.value) {
          resolve(data.value);
        } else {
          const requestAdd = objectStore.add({ key: key, value: value });
          requestAdd.onsuccess = (event: Dictionary) => {
            resolve(event.target.result);
          };

          requestAdd.onerror = (event: Dictionary) => {
            reject(event);
          };
        }
      };
    });
  }

  getItem(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const objectStore = this.db.transaction([this.options.table]).objectStore(this.options.table);
      const request = objectStore.get(key);

      request.onerror = (event: Event) => {
        reject(event);
      };

      request.onsuccess = (event: Dictionary) => {
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
      const request = this.db.transaction([this.options.table], 'readwrite')
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

class Snackabra {
  #listOfChannels: Channel[] = []
  storageApi: StorageApi
  // #storage = new StorageApi();
  // #identity = new Identity();
  options: SnackabraOptions = {
    channel_server: '',
    channel_ws: '',
    storage_server: ''
  };

  /**
   * Constructor expects an object with the names of the matching servers, for example
   * (this shows the miniflare local dev config):
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
   */
  constructor(args: SnackabraOptions) {
    this.storageApi = new StorageApi()
    _sb_assert(args, 'Snackabra(args) - missing args');
    try {
      this.options = {
        channel_server: args.channel_server,
        channel_ws: args.channel_ws,
        storage_server: args.storage_server
      };
    } catch (e) {
      _sb_exception('Snackabra.constructor()', `${e}`);
    }
  }

  // psm: this is no longer global
  // /** Snackabra.setIdentity()
  //     @param {JsonWebKey} sets public key (identity) you're joining channel with
  //  */
  // setIdentity(keys: JsonWebKey) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       await this.#identity.mountKeys(keys);
  //       resolve(this.#identity);
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // }

  // /** Snackabra.createIdentity
  //     Creates a random (new) identity
  //  */
  // createIdentity() {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       this.#identity = await new Identity();
  //       resolve(this.#identity);
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // }


  /**
   * Snackabra.connect()
   * Connects to :term:`Channel Name` on this SB config.
   * Returns a (promise to the) channel object
   * @param {string} channel name
   * @param {Identity} default identity for all messages
   */
  connect(channel_id: string, identity: Identity): Promise<Channel> {
    return new Promise<Channel>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      // psm: changing to make this on a per-message basis
      // if (!_self.#identity.exportable_pubKey) {
      //   reject(new Error('setIdentity() must be called before connecting'));
      // }

      const c = new Channel(this, channel_id, identity)
      this.#listOfChannels.push(c)
      resolve(c)

      // const c = new Channel(this.options.channel_server, _self.options.channel_ws, _self.#identity);
      // c.join(channel_id).then((_c: Channel) => {
      //   _self.#storage = new StorageApi();
      //   _c.storage = _self.#storage
      //   _self.#channel = _c;
      //   _self.#storage.init(_self.options.storage_server, _self.#channel, _self.#identity)
      //   // resolve(_self);
      //   resolve(_self.#channel);
    })
  }

  /**
   * Creates a channel. Currently uses trivial authentication.
   * Returns the :term:`Channel Name`.
   * (TODO: token-based approval of storage spend)
   */
  create(serverSecret: string) {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const ownerKeyPair: CryptoKeyPair = await crypto.subtle.generateKey({
          name: 'ECDH',
          namedCurve: 'P-384'
        }, true, ['deriveKey']);
        const exportable_privateKey: Dictionary = await crypto.subtle.exportKey('jwk', ownerKeyPair.privateKey);
        const exportable_pubKey: Dictionary = await crypto.subtle.exportKey('jwk', ownerKeyPair.publicKey);
        const channelId: string = await this.#generateRoomId(exportable_pubKey.x, exportable_pubKey.y);
        const encryptionKey: CryptoKey = await crypto.subtle.generateKey({
          name: 'AES-GCM',
          length: 256
        }, true, ['encrypt', 'decrypt']);
        const exportable_encryptionKey: Dictionary = await crypto.subtle.exportKey('jwk', encryptionKey);
        const signKeyPair: CryptoKeyPair = await crypto.subtle.generateKey({
          name: 'ECDH', namedCurve: 'P-384'
        }, true, ['deriveKey']);
        const exportable_signKey: Dictionary = await crypto.subtle.exportKey('jwk', signKeyPair.privateKey);
        const channelData: ChannelData = {
          roomId: channelId,
          ownerKey: JSON.stringify(exportable_pubKey),
          encryptionKey: JSON.stringify(exportable_encryptionKey),
          signKey: JSON.stringify(exportable_signKey),
          SERVER_SECRET: serverSecret
        };
        const data: Uint8Array = new TextEncoder().encode(JSON.stringify(channelData));
        let resp: Dictionary = await fetch(this.options.channel_server + '/api/room/' + channelId + '/uploadRoom', {
          method: 'POST',
          body: data
        });
        resp = await resp.json();
        if (resp.success) {
          await this.connect(channelId);
          _localStorage.setItem(channelId, JSON.stringify(exportable_privateKey));
          resolve(channelId);
        } else {
          reject(new Error(JSON.stringify(resp)));
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  #generateRoomId(x: string, y: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const xBytes = base64ToArrayBuffer(decodeB64Url(x));
        const yBytes = base64ToArrayBuffer(decodeB64Url(y));
        const channelBytes = _appendBuffer(xBytes, yBytes);
        const channelBytesHash = await crypto.subtle.digest('SHA-384', channelBytes);
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

  sendMessage(message: SBMessage) {
    this.channel.socket.send(message);
  }

  sendFile(file: File) {
    this.storage.saveFile(file);
  }
}

// export {
//   Snackabra,
//   SBMessage,
//   SBFile,
//   SB_libraryVersion,
//   ab2str,
//   str2ab,
//   base64ToArrayBuffer,
//   arrayBufferToBase64,
//   getRandomValues
// };

export {
  Channel,
  Snackabra,
  SBMessage,
  SBFile,
};
