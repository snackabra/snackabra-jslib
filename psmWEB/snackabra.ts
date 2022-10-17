/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */

/* Distributed under GPL-v03, see 'LICENSE' file for details */


/*
  current tsc command-line settings:
  tsc -t es2022 --pretty false --strict ./snackabra.ts

  TODO list:
  * cut code (some still relevant) in
  
  * latest (fast) code for image loading etc is in the JS client:
    384-snackabra-webclient/src/utils/ImageProcessor.js
    384-snackabra-webclient/src/utils/ImageWorker.js
    that JS code needs to carry over, below the "most modified"
    parts of that code will throw an error

  Long Term Todo:
  * eventually defined the protocol, potentially registering with:
    https://www.iana.org/assignments/websocket/websocket.xml#subprotocol-name

*/

/**
 * Interfaces
 */

interface SnackabraOptions {
  channel_server: string,
  channel_ws: string,
  storage_server: string,
}


interface IndexedKVOptions {
  db: string,
  table: string,
  onReady: CallableFunction,
}

interface WSProtocolOptions {
  version?: number,
  url: string, // not the user (client) url, but where the socket is
  websocket: WebSocket,
  onOpen?: null | CallableFunction,
  ready: boolean,
  // onMessage?: null | CallableFunction,
  onClose?: null | CallableFunction,
  onError?: null | CallableFunction,
  timeout?: number,
  closed: boolean,
  init?: { name: string },
  // identity?: Identity,
  // keys?: ChannelKeys,
  // motd?: string,
  // locked?: boolean,
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
    guestKey?: Dictionary,
    signKey: Dictionary,
  },
  _id?: string,
  id?: string,
  timestamp?: number,
  timestampPrefix?: string, // '0'/'1' - 42 of them
  channelID?: string, // base64 - 64 chars (512 bits)
  control?: boolean,
  encrypted_contents?: EncryptedContents,
  image?: string,
  imageMetaData?: ImageMetaData
  motd?: string,
  ready?: boolean,
  roomLocked?: boolean,
  sender_pubKey?: JsonWebKey,
  system?: boolean,
  verificationToken?: string,
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



/*
 * { "ready": true,
 *    "keys": {
 *            "ownerKey": "{\"crv\":\"P-384\",\"ext\":true,\"key_ops\":[],\"kty\":\"EC\",
 *                        \"x\":\"9s17B4i0Cuf_w9XN_uAq2DFePOr6S3sMFMA95KjLN8akBUWEhPAcuMEMwNUlrrkN\",
 *                        \"y\":\"6dAtcyMbtsO5ufKvlhxRsvjTmkABGlTYG1BrEjTpwrAgtmn6k25GR7akklz9klBr\"}",
 *            "guestKey": "{\"crv\":\"P-384\",\"ext\":true,\"key_ops\":[],\"kty\":\"EC\",
 *                         \"x\":\"Lx0eJcbNuyEfHDobWaZqgy9UO7ppxVIsEpEtvbzkAlIjySh9lY2AvgnACREO6QXD\",
 *                         \"y\":\"zEHPgpsl4jge_Q-K6ekuzi2bQOybnaPT1MozCFQJnXEePBX8emkHriOiwl6P8BAS\"}",
 *            "encryptionKey": "{\"alg\":\"A256GCM\",\"ext\":true,
 *                             \"k\":\"F0sQTTLXDhuvvmgGQLzMoeHPD-SJlFyhfOD-cqejEOU\",
 *                             \"key_ops\":[\"encrypt\",\"decrypt\"],\"kty\":\"oct\"}",
 *            "signKey": "{\"crv\":\"P-384\",
 *                        \"d\":\"KCJHDZ34XgVFsS9-sU09HFzXZhnGCvnDgJ5a8GTSfjuJQaq-1N2acvchPRhknk8B\",
 *                        \"ext\":true,\"key_ops\":[\"deriveKey\"],\"kty\":\"EC\",
 *                        \"x\":\"rdsyBle0DD1hvp2OE2mINyyI87Cyg7FS3tCQUIeVkfPiNOACtFxi6iP8oeYt-Dge\",
 *                        \"y\":\"qW9VP72uf9rgUU117G7AfTkCMncJbT5scIaIRwBXfqET6FYcq20fwSP7R911J2_t\"}"
 *             },
 * "motd": "",
 * "roomLocked": false}
 */

interface ChannelKeyStrings {
  encryptionKey: string,
  guestKey?: string,
  ownerKey: string,
  signKey: string,
  lockedKey?: string,
}

interface ChannelKeysMessage {
  type: 'channelKeys',
  ready: boolean,
  keys: ChannelKeyStrings,
  motd: string,
  roomLocked: boolean,
}

// TODO: cross-reference with the old 'loadKeys()'
interface ChannelKeys {
  // these come from the channel server;
  ownerKey: CryptoKey,
  guestKey?: CryptoKey,
  encryptionKey: CryptoKey,
  signKey: CryptoKey,
  lockedKey?: CryptoKey,
  // these are derived from the above:
  channelSignKey: CryptoKey,
}

/** Encryptedcontents

    SB standard wrapping encrypted messages.

    Encryption is done with AES-GCM, 16 bytes of salt (iv), The
    ``contents`` are base64 and made web/net safe by running through
    encodeURIComponent. Same thing with the nonce (iv).
 */
export interface EncryptedContents {
  content: string,
  iv: string,
}

interface ChannelEncryptedMessage {
  type: 'channelMessage',

  // base64 - 64 chars (512 bits), e.g:
  // 'wDUMRbcfFhdmByuwMhFyR46MRlcZh-6gKRUhSPkWEQLSRUPE8_jqixV3VQevTDBy'
  channelID?: string,

  // fourty-two (42) 0s and 1s as string, e.g.:
  // '011000001110001011010110101010000100000110'
  timestampPrefix?: string,

  encrypted_contents: EncryptedContents,
}

interface ChannelEncryptedMessageArray {
  type: 'channelMessageArray',
  messages: ChannelEncryptedMessageArray[]
}

// mtg: we shouldn't need the export here because we are using them internally
export type ChannelMessage = ChannelKeysMessage | ChannelEncryptedMessage | ChannelEncryptedMessageArray | void

export type ChannelMessageTypes = 'ack' | 'channelMessage' | 'channelMessageArray' | 'channelKeys'

interface ChannelMessage1 {
  // currently we can't do a regex match here, and i can't figure
  // out a more clever way of collapsing this.  TODO maybe we should
  // change the message format
  [key: string]: ChannelMessage2,

  message: { [prop: string]: any },
}

export type ChannelMessageV1 = ChannelMessage1 | ChannelMessage2 | ChannelAckMessage

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
    // console.log(buffer)
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
 * There are many problems with JSON parsing, adding a wrapper to capture more info.
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
export function assemblePayload(data: Dictionary): BodyInit | null {
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
    return null;
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
  extractPubKey(privateKey: JsonWebKey): JsonWebKey | null {
    try {
      const pubKey: JsonWebKey = { ...privateKey };
      delete pubKey.d;
      delete pubKey.dp;
      delete pubKey.dq;
      delete pubKey.q;
      delete pubKey.qi;
      pubKey.key_ops = [];
      return pubKey;
    } catch (e) {
      console.error(e)
      return null
    }
  }

  /**
   * SBCrypto.generatekeys()
   *
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
   * SBCrypto.importKey()
   *
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
   * SBCrypto.deriveKey()
   *
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
   * SBCrypto.getFileKey()
   *
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
   * SBCrypto.encrypt()
   *
   * Encrypt
   */
  encrypt(contents: BufferSource, secret_key: CryptoKey, outputType = 'string', _iv: ArrayBuffer | null = null): Promise<Dictionary | string> {
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
   * SBCrypto.unwrap
   *
   * Decrypts a wrapped object, returns decrypted contents
   */
  unwrap(k: CryptoKey, o: EncryptedContents, returnType: 'string'): Promise<string>
  unwrap(k: CryptoKey, o: EncryptedContents, returnType: 'arrayBuffer'): Promise<ArrayBuffer>
  unwrap(k: CryptoKey, o: EncryptedContents, returnType: 'string' | 'arrayBuffer') {
    // console.log("SBCrypto.unwrap():"); console.log(k); console.log(o)
    return new Promise(async (resolve, reject) => {
      try {
        const t: BufferSource = base64ToArrayBuffer(decodeURIComponent(o.content))
        const iv: ArrayBuffer = base64ToArrayBuffer(decodeURIComponent(o.iv))
        crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, k, t).then((d) => {
          if (returnType === 'string') {
            resolve(new TextDecoder().decode(d))
          } else if (returnType === 'arrayBuffer') {
            resolve(d)
          }
        })
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * SBCrypto.sign()
   *
   * Sign
   */
  sign(secretKey: CryptoKey, contents: string): Promise<string> {
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
        } catch (error) {
          reject(error);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * SBCrypto.verify()
   *
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
   * SBCrypto.areKeysSame()
   *
   * Compare keys. (TODO: deprecate/ change)
   */
  areKeysSame(key1: Dictionary, key2: Dictionary): boolean {
    if (key1 != null && key2 != null && typeof key1 === 'object' && typeof key2 === 'object') {
      return key1['x'] === key2['x'] && key1['y'] === key2['y'];
    }
    return false;
  }
} /* SBCrypto */

const sbCrypto = new SBCrypto();

/**
 * Identity (key for use in SB)
 * @class
 * @constructor
 * @public
 */
class Identity {
  ready
  #readyFlag: boolean = false
  #exportable_pubKey?: JsonWebKey
  #exportable_privateKey?: JsonWebKey
  #privateKey?: CryptoKey

  /**
   * new Identity()
   * @param key a jwk with which to create identity; if not provided, 
   * it will 'mint' (generate) them randomly
   */
  constructor(key?: JsonWebKey) {
    this.ready = new Promise<Identity>((resolve, reject) => {
      try {
        if (key) {
          this.#exportable_privateKey = key
          const pk = sbCrypto.extractPubKey(key)
          if (pk) this.#exportable_pubKey = pk
          sbCrypto.importKey('jwk', key, 'ECDH', true, ['deriveKey']).then((k) => {
            this.#privateKey = k
            this.#readyFlag = true
            resolve(this)
          })
        } else {
          sbCrypto.generateKeys().then((keyPair: CryptoKeyPair) => {
            this.#privateKey = keyPair.privateKey
            Promise.all([
              crypto.subtle.exportKey('jwk', keyPair.publicKey),
              crypto.subtle.exportKey('jwk', keyPair.privateKey)
            ]).then((v) => {
              this.#exportable_pubKey = v[0]
              this.#exportable_privateKey = v[1]
              this.#readyFlag = true
              resolve(this)
            })
          })
        }
      } catch(e) {
        let errMsg = `failed to create Identity(): ${e}`
        console.error(errMsg)
        // _sb_exception("new Identity()", `failed to create Identity(): ${e}`) // do reject instead
        reject(errMsg)
      }
    })
  }
  get exportable_pubKey() {
    _sb_assert(this.#readyFlag && this.#exportable_pubKey, "Identity.exportable_pubKey: accessed but identity not ready")
    return this.#exportable_pubKey!
  }
  get exportable_privateKey() {
    _sb_assert(this.#readyFlag && this.#exportable_privateKey, "Identity.exportable_privateKey: accessed but identity not ready")
    return this.#exportable_privateKey!
  }
  get privateKey() {
    _sb_assert(this.#readyFlag && this.#privateKey, "Identity.privateKey: accessed but identity not ready")
    return this.#privateKey!
  }
  get _id() {
    return JSON.stringify(this.exportable_pubKey);
  }
}

interface resolveKeyFunction {
  (arg0: ChannelKeys | Promise<ChannelKeys>): void
}

interface SBMessageContents {
  sender_pubKey?: JsonWebKey,
  sender_username?: string,
  encrypted: boolean,
  contents: string,
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
  channel: Channel
  identity?: Identity // if omitted go with channel default
  contents: SBMessageContents

  constructor(channel: Channel, body: string, identity?: Identity) {
    console.log("creating SBMessage on channel:")
    console.log(channel)
    this.channel = channel
    this.contents = { encrypted: false, contents: body, sign: '', image: '', imageMetaData: {} }

    this.ready = new Promise<SBMessage>((resolve, reject) => {
      if (identity) {
        this.identity = identity
      } else if (channel.identity) {
        this.identity = channel.identity
      } else {
        reject("SBMessage needs an identity set (somewhere)")
      }
      this.contents.sender_pubKey = this.identity!.exportable_pubKey,
      console.log("SBMessage: waiting on channel to be ready... ")
      channel.ready.then(() => {
        console.log("SBMessage: ... got keys .. here are keys and sign key ")
        console.log(this.channel.keys)
        console.log(this.channel.keys.signKey)
        if (channel.userName) this.contents.sender_username = channel.userName
        const signKey = this.channel.keys.channelSignKey
        console.log("SBMessage: ... got sign key ... waiting on closure")
        const sign = sbCrypto.sign(signKey, body)
        const image_sign = sbCrypto.sign(signKey!, this.contents.image)
        const imageMetadata_sign = sbCrypto.sign(signKey, JSON.stringify(this.contents.imageMetaData))
        Promise.all([sign, image_sign, imageMetadata_sign]).then((values) => {
          console.log("SBMessage: ... got everything, about to resolve")
          this.contents.sign = values[0]
          this.contents.image_sign = values[1]
          this.contents.imageMetadata_sign = values[2]
          resolve(this)
        })
      })
    })
  }

  /**
   * SBMessage.send()
   *
   * @param {SBMessage} message - the message object to send
   */
  send() {
    console.log("SBMessage.send()")
    console.log(this)
    return new Promise<string>((resolve, reject) => { 
      this.ready.then(() => {
        // message ready
        this.channel.send(this).then((result) => {
          if (result === "success") {
            resolve(result)
          } else {
            reject(result)
          }
        })
      })
    })
    // TODO: i've punted on queue here
  }
}

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
  data: Dictionary = {
    previewImage: '',
    fullImage: ''
  }
  // (now extending SBMessage)
  image = '';
  image_sign: string = '';
  imageMetaData: ImageMetaData = {}
  imageMetadata_sign: string = '';

  // file is an instance of File
  constructor(channel: Channel, file: File, identity?: Identity /* signKey: CryptoKey, key: CryptoKey */) {
    super(channel, '', identity)
    // all is TODO with new image code
    // this.senderPubKey = key;
    // psm: again, why are we signing empty contents?
    // this.sign = sbCrypto.sign(signKey, this.contents);
    // if (file.type.match(/^image/i)) {
    //   this.#asImage(file, signKey)
    // } else {
    //   throw new Error('Unsupported file type: ' + file.type);
    // }
  }
}


/**
 * Channel
 *
 * @class
 * @constructor
 * @public
 */
abstract class Channel {
  abstract ready: Promise<Channel>
  sbServer: Snackabra
  channel_id: string
  motd?: string = ''
  locked?: boolean = false
  owner: boolean = false
  admin: boolean = false
  verifiedGuest: boolean = false
  userName: string = ''

  // channels always have an identity, since you typically cannot
  // query various aspects of channel state without an identity.
  // however if not provided, one will be generated upon a connect
  identity?: Identity

  abstract get keys(): ChannelKeys
  abstract send(m: SBMessage): Promise<string> // "success" or error message
  abstract set onMessage(f: CallableFunction)

  #api!: ChannelApi
  abstract adminData?: Dictionary // TODO: make into getter

  /*
   * Channel()
   * Join a channel, returns channel object.
   * 
   * Currently, you must have an identity when connecting, because every single
   * message is signed by sender. TODO is to look at how to provide a 'listening'
   * mode on channels.
   *
   * @param {Snackabra} which server to join
   * @param {string} channel_id (the :term:`Channel Name`) to find on that server
   * @param {Identity} the identity which you want to present (defaults to server default)
   */
  constructor(sbServer: Snackabra, channel_id: string, identity?: Identity) {
    this.sbServer = sbServer
    if (identity) this.identity = identity
    _sb_assert(channel_id != null, 'channel_id cannot be null') // TODO: this can be done with types
    this.channel_id = channel_id
    this.#api = new ChannelApi(this.sbServer, this, this.identity)
  }

  /**
   * Channel.api()
   */
  get api() {
    return this.#api
  }
} /* Channel */

/**
 *
 * ChannelSocket
 *
 *  Class managing connections
 */
class ChannelSocket extends Channel {
  ready
  #readyFlag: boolean = false
  #ws: WSProtocolOptions
  #keys?: ChannelKeys
  adminData?: Dictionary // TODO: add getter
  // #queue: Array<SBMessage> = [];
  #onMessage: CallableFunction // the user message handler
  #ack: Dictionary = []
  
  /*
     internal to channelsocket: this always gets all messages; certain
     protocol aspects are low-level (independent of 'app') and those
     are handled here. others are never delivered 'raw', for example
     encrypted messages are always decrypted
  */
  #processMessage(m: any) {
    console.log("got raw message:")
    console.log(m)
    const data = jsonParseWrapper(m, 'L1489')
    console.log("... json unwrapped:")
    console.log(data)
    if (data.ack) {
      const r = this.#ack[data._id]
      if (r) {
        delete this.#ack[data._id]
        r() // resolve
      }
    } else if (data.nack) {
      console.error('Nack received')
      this.#ws.closed = true
      // if (this.#websocket) this.#websocket.close()
    } else if (typeof this.#onMessage === 'function') {
      const message = data as ChannelMessage2
      // 'id' will be first property
      console.log("++++++++ ChannelSocket.#processMessage():")
      const id = Object.keys(message)[0];
      console.log("++++++++ #processMessage: note .. 'id' was:")
      console.log(id)
      // TODO: we should regex on Object.entries(message)[0] but we can't quite yet because
      //       some versions of channel server return 'undefined' as channel name
      let unwrapped: string = ''
      console.log("++++++++ #processMessage: ... parsing ...:")
      console.log(message)
      console.log(Object.entries(message))
      try {
        console.log("++++++++ #processMessage: will attempt to decipher ...:")
        if (Object.keys(Object.entries(message)[0][1])[0] === 'encrypted_contents') {
          // TODO: parse out ID and time stamp, regex:
          const encryptedContents = (Object.entries(message)[0][1] as ChannelEncryptedMessage)
          console.log(encryptedContents)
          sbCrypto.unwrap(this.keys.encryptionKey, encryptedContents.encrypted_contents, 'string').then((unwrapped) => {
            console.log("++++++++ #processMessage: unwrapped:")
            console.log(unwrapped)
            this.#onMessage(unwrapped as ChannelMessage2)
          })
        } else {
          // 
          // TODO: other message types (low level) are parsed here ...
          //
          console.log("++++++++ #processMessage: can't decipher message, passing along unchanged:")
          this.#onMessage(message) // 'as string' ?
        }
      } catch (e) {
        console.log(`++++++++ #processMessage: caught exception while decyphering (${e}), passing it along unchanged`)
        this.#onMessage(message) // 'as string' ?
        // console.error(`#processmessage: cannot handle locked channels yet (${e})`)
        // TODO: locked key might never resolve (if we don't have it)
        // unwrapped = await sbCrypto.unwrap(this.keys.lockedKey, message.encrypted_contents, 'string')
      }

      // TODO: re-enable local storage of messages
      // _localStorage.setItem(this.#channel.channel_id + '_lastSeenMessage', id.slice(this.#channel.channel_id.length));
      // if (message._id) _localStorage.setItem(this.#channel.channel_id + '_lastSeenMessage', message._id)
      // return JSON.stringify(unwrapped);
    } else {
      _sb_exception('SBWebSocket', 'received message but there is no handler')
    }
  }

  #readyPromise() {
    const url = this.#ws.url
    let backlog: Array<MessageEvent> = []
    let processingKeys = false
    return new Promise<ChannelSocket>((resolve, reject) => {
      try {
        // if (this.#ws.websocket) this.#ws.websocket.close() // keep clean
        if (this.#ws.websocket.readyState === 3) {
          // it's been closed
          this.#ws.websocket = new WebSocket(url)
        } else if (this.#ws.websocket.readyState === 2) {
          console.log("STRANGE - trying to use a ChannelSocket that is in the process of closing ...")
          this.#ws.websocket = new WebSocket(url)
        }
        this.#ws.websocket.addEventListener('open', () => {
          this.#ws.closed = false
          const id = this.identity!
          const r = id.ready // we know at this point we have an identity
          r.then(() => {
            console.log("++++++++ readyPromise() has identity:")
            console.log(id)
            this.#ws.init = { name: JSON.stringify(id.exportable_pubKey) }
            console.log("++++++++ readyPromise() constructed init:")
            console.log(this.#ws.init)
            this.#ws.websocket.send(JSON.stringify(this.#ws.init))
            // note: not ready until channel responds with keys
          })
        })
        this.#ws.websocket.addEventListener('message', (e: MessageEvent) => {
          // the 'root' administrative messages are processed first before
          // anything else can be processed, when this is done it self-replaces
          console.log("++++++++ readyPromise() received ChannelKeysMessage:")
          console.log(e)
          if (processingKeys) {
            backlog.push(e.data)
            console.log("++++++++ readyPromise() pushing message to backlog:")
            console.log(e)
            return
          }
          processingKeys = true // helps not drop messages
          // const message: ChannelKeysMessage = deserializeMessage(e.data, 'channelKeys')! as ChannelKeysMessage
          const message = JSON.parse(e.data) as ChannelKeysMessage
          console.log(message)
          _sb_assert(message.ready, 'got roomKeys but channel reports it is not ready (?)')
          this.motd = message.motd
          this.locked = message.roomLocked
          Promise.all([
            sbCrypto.importKey('jwk', JSON.parse(message.keys.ownerKey), 'ECDH', false, []),
            sbCrypto.importKey('jwk', JSON.parse(message.keys.encryptionKey), 'AES', false, ['encrypt', 'decrypt']),
            sbCrypto.importKey('jwk', JSON.parse(message.keys.signKey),'ECDH', true, ['deriveKey']),
            sbCrypto.importKey('jwk', sbCrypto.extractPubKey(JSON.parse(message.keys.signKey))!, 'ECDH', true, []),
            this.identity!.privateKey // we know we have id by now
          ]).then((v) => {
            console.log("++++++++ readyPromise() processed first batch of keys")
            const ownerKey = v[0]
            const encryptionKey = v[1]
            const signKey = v[2]
            const publicSignKey = v[3]
            const privateKey = v[4]!
            Promise.all([
              sbCrypto.deriveKey(privateKey, publicSignKey, 'HMAC', false, ['sign', 'verify'])
            ]).then((w) => {
              console.log("++++++++ readyPromise() second phase of key processing")
              const channelSignKey = w[0]
              this.#keys = {
                ownerKey: ownerKey,
                encryptionKey: encryptionKey,
                signKey: signKey,
                channelSignKey: channelSignKey
              }
              // once we have keys we can also query admin info
              const adminData = this.api.getAdminData()
              console.log("++++++++ readyPromise() getting adminData:")
              console.log(adminData)
              this.adminData = adminData
              // this causes queued messages to be processed ahead of ones from new callbacks 
              if (backlog.length > 0) {
                console.log("++++++++ readyPromise() we are queuing up a microtask for message processing")
                queueMicrotask(() => {
                  console.log("++++++++ readyPromise() inside micro task")
                  for (let d in backlog) {
                    console.log("++++++++ pulling this message from the backlog:")
                    console.log(e)
                    this.#processMessage(d)
                  }
                });
              } else {
                console.log("++++++++ readyPromise() there were NO messages queued up")
              }
              // once we've gotten our keys, we substitute the message handler
              console.log("++++++++ readyPromise() changing onMessage to processMessage")
              this.#ws.websocket.addEventListener('message', (e: MessageEvent) => this.#processMessage(e.data))
              // and now we are ready!
              this.#readyFlag = true
              console.log("++++++++ readyPromise() all done - resolving!")
              resolve(this)
            })
          })
        })
        this.#ws.websocket.addEventListener('close', (e: CloseEvent) => {
          this.#ws.closed = true
          if (!e.wasClean) {
            console.log('sbWebSocket() was closed (and NOT cleanly): ', e.reason)
          } else {
            console.log('sbWebSocket() was closed (cleanly): ', e.reason)
          }
          reject('wbSocket() closed before it was opened (?)')
        })
        this.#ws.websocket.addEventListener('error', (e) => {
          this.#ws.closed = true
          console.log('sbWebSocket() error: ', e)
          reject('sbWebSocket creation error (see log)')
        })
      } catch (e) {
        this.#ws.closed = true
        console.log(e)
        reject('failed to create sbWebSocket, see log')
      }
    })
  }

  constructor(sbServer: Snackabra, channel_id: string, onMessage: CallableFunction, identity?: Identity) {
    console.log("----ChannelSocket.constructor() start:")
    console.log(sbServer)
    console.log(identity)
    console.log("----ChannelSocket.constructor() ... end")
    // note: 'identity' is tracked by parent
    super(sbServer, channel_id, identity ? identity : new Identity()) // initialize 'channel' parent
    const url = sbServer.options.channel_ws + '/api/room/' + this.channel_id + '/websocket'
    this.#onMessage = onMessage
    this.#ws = {
      url: url,
      websocket: new WebSocket(url),
      ready: false,
      closed: false,
      timeout: 30000
    }
    this.ready = this.#readyPromise()
  }

  #wrap(sbMessage: SBMessage): Promise<Dictionary> {
    _sb_assert(this.#readyFlag, "#wrap called but channel not ready")
    console.log("+++++++++ #wrap() asked to wrap:")
    console.log(sbMessage)
    return new Promise<Dictionary>((resolve) => {
      const encryptionKey = this.keys.encryptionKey
      sbCrypto.encrypt(str2ab(JSON.stringify(sbMessage.contents)), encryptionKey, 'string').then((c) => {
        console.log("#wrap() resolved to:")
        console.log(c)
        resolve({ encrypted_contents: c })
        // resolve(c)
      })
    })
  }


  set onMessage(f: CallableFunction) {
    this.#onMessage = f
  }

  get onMessage() {
    return this.#onMessage
  }

  /**
   * ChannelSocket.keys
   * 
   * Will throw an exception if keys are unknown or not yet loaded
   */
  get keys(): ChannelKeys {
    if (!this.#keys) {
      _sb_assert(false, "ChannelSocket.keys: not initialized (?)")
    }
    return(this.#keys!)
  }

  /**
   * ChannelSocket.sendSbObject()
   *
   * Send SB object (file) on channel socket
   */
  // todo - move to API?
  async sendSbObject(file: SBFile) {
    return(this.send(file))
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
  send(message: SBMessage): Promise<string> {
    // for future inspiration here are more thoughts on making this more iron clad:
    // https://stackoverflow.com/questions/29881957/websocket-connection-timeout
    console.log("++++++++ ChannelSocket.send() this message: ")
    console.log(message)
    if (this.#ws.closed) {
      console.info("send() triggered reset of #readyPromise() (normal)")
      this.ready = this.#readyPromise() // possible reset of ready 
    }
    return new Promise((resolve, reject) => {
      this.ready.then(() => {
        if (!this.#readyFlag) reject("ChannelSocket.send() is confused - ready or not?")
        switch (this.#ws.websocket.readyState) {
          case 1: // OPEN
            this.#wrap(message).then((wrappedMessage) => {
              const m = JSON.stringify(wrappedMessage)
              console.log("++++++++ ChannelSocket.send() got this from wrap:")
              console.log(m)
              console.log("++++++++ ChannelSocket.send() then got this from JSON.stringify:")
              console.log(wrappedMessage)
              crypto.subtle.digest('SHA-256', new TextEncoder().encode(m)).then((hash) => {
                const _id = arrayBufferToBase64(hash)
                const ackPayload = { timestamp: Date.now(), type: 'ack', _id: _id }
                this.#ack[_id] = resolve
                console.log(`++++++++ ChannelSocket.send() this message: '${m}' `)
                this.#ws.websocket.send(m)
                // TODO: update protocol so server acks on message
                this.#ws.websocket.send(JSON.stringify(ackPayload));
                setTimeout(() => {
                  if (this.#ack[_id]) {
                    delete this.#ack[_id]
                    const msg = `Websocket request timed out (no ack) after ${this.#ws.timeout}ms (${_id})`
                    console.error(msg)
                    reject(msg)
                  } else {
                    // normal behavior
                    console.log("++++++++ ChannelSocket.send() completed sending!")
                    resolve("success")
                  }
                }, this.#ws.timeout)
              })
            })
            break
          case 3: // CLOSED
          case 0: // CONNECTING
          case 2: // CLOSING
            const errMsg = 'socket not OPEN - either CLOSED or in the state of CONNECTING/CLOSING'
            _sb_exception('sbWebSocket', errMsg)
            reject(errMsg)
        }
      })
    })
  }


} // ChannelSocket


/**
 * Storage API
 * @class
 * @constructor
 * @public
 */
class StorageApi {
  server: string;

  constructor(server: string) {
    this.server = server + '/api/v1';
  }

  /**
   * StorageApi.saveFile()
   */
  async saveFile(sbFile: SBFile, channel: Channel) {
    // const metaData: Dictionary = jsonParseWrapper(sbFile.imageMetaData, 'L1732');
    const metaData: ImageMetaData = sbFile.imageMetaData
    const fullStorePromise = this.storeImage(sbFile.data.fullImage, metaData.imageId!, metaData.imageKey!, 'f');
    const previewStorePromise = this.storeImage(sbFile.data.previewImage, metaData.previewId!, metaData.previewKey!, 'p');
    // TODO: We should probably discuss this in more detail
    Promise.all([fullStorePromise, previewStorePromise]).then((results) => {
      results.forEach((controlData) => {
        // @ts-ignore
        channel.sendSbObject({ ...controlData, control: true });
      });
      // psm: need to generalize classes ... sbFile and sbImage descent from sbMessage?
      // channel.sendSbObject(sbFile);
      channel.send(sbFile)
    });

  }

  /**
   * StorageApi().getFileKey
   */
  async #getFileKey(fileHash: string, _salt: Uint8Array) {
    const keyMaterial = await sbCrypto.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey']);

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
        method: 'POST',
        body: assemblePayload({
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
  fetchData(msgId: string, verificationToken: string | undefined): Promise<ArrayBuffer> {
    if (!verificationToken) {
      _sb_exception('StorageApi.fetchData()', 'verificationToken is undefined')
    }
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
    messages: Array<ChannelMessage2>,
    controlMessages: Array<ChannelMessage2>): Promise<Dictionary> {
    console.log("... need to code up retrieveData() with new typing ..")
    console.log(msgId)
    console.log(messages)
    console.log(controlMessages)
    console.error("... need to code up retrieveData() with new typing ..")

    const imageMetaData = messages.find((msg: ChannelMessageV1) => msg!._id === msgId)!.imageMetaData
    const image_id = imageMetaData!.previewId;
    // const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.id && ctrl_msg.id.startsWith(image_id));
    const control_msg = controlMessages.find((ctrl_msg) => ctrl_msg.id && ctrl_msg.id == image_id)!
    if (!control_msg) {
      return { 'error': 'Failed to fetch data - missing control message for that image' };
    }
    // const imageFetch = await this.fetchData(control_msg.id, control_msg.verificationToken);
    const imageFetch = await this.fetchData(control_msg.id!, control_msg.verificationToken);
    // extracts from binary format
    const data = extractPayload(imageFetch);
    const iv: string = data.iv;
    const salt: Uint8Array = data.salt;
    const image_key: CryptoKey = await this.#getFileKey(imageMetaData!.previewKey!, salt);
    const encrypted_image: string = data.image;
    const padded_img: ArrayBuffer = await sbCrypto.unwrap(image_key, { content: encrypted_image, iv: iv }, 'arrayBuffer')
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
    const padded_img = await sbCrypto.unwrap(image_key, { content: encrypted_image, iv: iv }, 'arrayBuffer')
    const img = this.#unpadData(padded_img);

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
  #sbServer: Snackabra
  #server: string; // channel server
  #identity?: Identity;
  #channel: Channel;
  #channelApi: string;
  #channelServer: string;

  // #payload: Payload;

  constructor(sbServer: Snackabra, channel: Channel, identity?: Identity) {
    this.#sbServer = sbServer
    this.#server = this.#sbServer.options.channel_server
    this.#channel = channel
    // this.#payload = new Payload()
    this.#channelApi = this.#server + '/api/'
    this.#channelServer = this.#server + '/api/room/'
    if (identity) this.#identity = identity!
  }

  /**
   * getLastMessageTimes
   */
  getLastMessageTimes() {
    return new Promise((resolve, reject) => {
      fetch(this.#channelApi + '/getLastMessageTimes', {
        method: 'POST', body: JSON.stringify([this.#channel.channel_id])
      }).then((response: Response) => {
        if (!response.ok) {
          reject(new Error('Network response was not OK'));
        }
        return response.json();
      }).then((message_times) => {
        resolve(message_times[this.#channel.channel_id]);
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
      fetch(this.#channelServer + this.#channel.channel_id + '/oldMessages?currentMessagesLength=' + currentMessagesLength, {
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
      fetch(this.#channelServer + this.#channel.channel_id + '/updateRoomCapacity?capacity=' + capacity, {
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
      fetch(this.#channelServer + this.#channel.channel_id + '/getRoomCapacity', {
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
      fetch(this.#channelServer + this.#channel.channel_id + '/getJoinRequests', {
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
      fetch(this.#channelServer + this.#channel.channel_id + '/roomLocked', {
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
      fetch(this.#channelServer + this.#channel.channel_id + '/motd', {
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
      const token_sign: string = await sbCrypto.sign(this.#channel.keys.channelSignKey, token_data);
      fetch(this.#channelServer + this.#channel.channel_id + '/getAdminData', {
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
      fetch(this.#channelServer + this.#channel.channel_id + '/downloadData', {
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
      fetch(this.#channelServer + this.#channel.channel_id + '/uploadRoom', {
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
      fetch(this.#channelServer + this.#channel.channel_id + '/authorizeRoom', {
        method: 'POST',
        body: JSON.stringify({ roomId: this.#channel.channel_id, SERVER_SECRET: serverSecret, ownerKey: ownerPublicKey })
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

  // we post our pub key if we're first
  postPubKey(_exportable_pubKey: Dictionary) {
    return new Promise((resolve, reject) => {
      fetch(this.#channelServer + this.#channel.channel_id + '/postPubKey?type=guestKey', {
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
      fetch(this.#channelServer + this.#channel.channel_id + '/storageRequest?size=' + byteLength, {
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

  // lock(identity?: Identity) {
  //   const _identity: Identity | undefined = identity ? identity : this.#identity
  //   if (_identity === undefined) {
  //     _sb_exception('Snackabra.lock(identity?)', 'No identity is set');
  //     return;
  //   }
  //   return new Promise(async (resolve, reject) => {
  //     if ((await this.#channel.keys.then()).lockedKey == null && this.#channel.admin) {
  //       const _locked_key: CryptoKey = await crypto.subtle.generateKey({
  //         name: 'AES-GCM', length: 256
  //       }, true, ['encrypt', 'decrypt']);
  //       const _exportable_locked_key: Dictionary = await crypto.subtle.exportKey('jwk', _locked_key);
  //       fetch(this.#channelServer + this.#channel.channel_id + '/lockRoom', {
  //         method: 'GET', credentials: 'include'
  //       })
  //         .then((response: Response) => {
  //           if (!response.ok) {
  //             reject(new Error('Network response was not OK'));
  //           }
  //           return response.json();
  //         })
  //         .then(async (data: Dictionary) => {
  //           if (data.locked) {
  //             await this.acceptVisitor(JSON.stringify(_identity.exportable_pubKey));
  //           }
  //           resolve({ locked: data.locked, lockedKey: _exportable_locked_key });
  //         }).catch((error: Error) => {
  //           reject(error);
  //         });
  //     }
  //   });
  // }

  // acceptVisitor(pubKey: string, identity?: Identity) {
  //   const _identity: Identity | undefined = identity ? identity : this.#identity
  //   if (_identity === undefined) {
  //     _sb_exception('Snackabra.lock(identity?)', 'No identity is set');
  //     return;
  //   }
  //   return new Promise(async (resolve, reject) => {
  //     // psm: need some "!"
  //     const shared_key = await sbCrypto.deriveKey(await _identity.privateKey, await sbCrypto.importKey('jwk', jsonParseWrapper(pubKey, 'L2276'), 'ECDH', false, []), 'AES', false, ['encrypt', 'decrypt']);
  //     const _encrypted_locked_key = await sbCrypto.encrypt(str2ab(JSON.stringify(this.#channel.keys.exportable_locked_key)), shared_key, 'string')
  //     fetch(this.#channelServer + this.#channel.channel_id + '/acceptVisitor', {
  //       method: 'POST',
  //       body: JSON.stringify({ pubKey: pubKey, lockedKey: JSON.stringify(_encrypted_locked_key) }),
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       credentials: 'include'
  //     })
  //       .then((response: Response) => {
  //         if (!response.ok) {
  //           reject(new Error('Network response was not OK'));
  //         }
  //         return response.json();
  //       })
  //       .then((data: Dictionary) => {
  //         resolve(data);
  //       }).catch((error: Error) => {
  //         reject(error);
  //       });
  //   });
  // }

  // ownerKeyRotation() {
  //   return new Promise((resolve, reject) => {
  //     fetch(this.#channelServer + this.#channel.channel_id + '/ownerKeyRotation', {
  //       method: 'GET', credentials: 'include', headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     })
  //       .then((response: Response) => {
  //         if (!response.ok) {
  //           reject(new Error('Network response was not OK'));
  //         }
  //         return response.json();
  //       })
  //       .then((data: Dictionary) => {
  //         resolve(data);
  //       }).catch((error: Error) => {
  //         reject(error);
  //       });
  //   });
  // }

  /*
  mtg: These methods have no implementation in the current webclient so I have skipped them for the time being
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
  // mtg: we have the option to expose this elswhere, but it might be better to break this out into a helper
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

class Snackabra {
  #listOfChannels: Channel[] = []
  #storage!: StorageApi
  #channel!: Channel
  // #defaultIdentity = new Identity();
  // defaultIdentity?: Identity
  options: SnackabraOptions = {
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
  constructor(args: SnackabraOptions) {
    _sb_assert(args, 'Snackabra(args) - missing args');
    try {
      this.options = Object.assign(this.options, {
        channel_server: args.channel_server,
        channel_ws: args.channel_ws,
        storage_server: args.storage_server
      });
      this.#storage = new StorageApi(args.storage_server)
    } catch (e: any) {
      if (e.hasOwnProperty('message')) {
        _sb_exception('Snackabra.constructor()', e.message);
      } else {
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
   * @param {string} channel_id - channel name
   * @param {Identity} identity - default identity for all messages
   */
  connect(channel_id: string, onMessage: CallableFunction, identity?: Identity): Promise<ChannelSocket> {
    return new Promise<ChannelSocket>((resolve, reject) => {
      const c = new ChannelSocket(this, channel_id, onMessage, identity)
      this.#listOfChannels.push(c)
      resolve(c)
    });
  }

  /**
   * Creates a new channel. Currently uses trivial authentication.
   * Returns the :term:`Channel Name`. Note that this does not
   * create a channel object, e.g. does not make a connection.
   * Therefore you need 
   * (TODO: token-based approval of storage spend)
   */
  create(serverSecret: string, identity: Identity): Promise<string> {
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
          // await this.connect(channelId, identity);
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

  get channel(): Channel {
    return this.#channel;
  }

  get storage(): StorageApi {
    return this.#storage;
  }

  get crypto(): SBCrypto {
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

  sendFile(file: SBFile) {
    this.storage.saveFile(file, this.#channel);
  }
}

export {
  // ChannelMessage,
  Channel,
  Identity,
  SBMessage,
  Snackabra,
  SBCrypto,
};
