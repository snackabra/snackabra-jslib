/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */
/* Distributed under GPL-v03, see 'LICENSE' file for details */
/* PART 1 of rewrite of "main.js" */
/* Zen Master: "um" */
export function SB_libraryVersion() {
    throw new Error("THIS IS NEITHER BROWSER NOR NODE THIS IS SPARTA!");
}
// exported for testing purposes
export function _sb_exception(loc, msg) {
    const m = '<< SB lib error (' + loc + ': ' + msg + ') >>';
    // for now disabling this to keep node testing less noisy
    // console.error(m);
    throw new Error(m);
}
// the above general exception handler can be improved so as to retain the error stack, per:
// https://stackoverflow.com/a/42755876
//
// class RethrownError extends Error {
//   constructor(message, error){
//     super(message)
//     this.name = this.constructor.name
//     if (!error) throw new Error('RethrownError requires a message and error')
//     this.original_error = error
//     this.stack_before_rethrow = this.stack
//     const message_lines =  (this.message.match(/\n/g)||[]).length + 1
//     this.stack = this.stack.split('\n').slice(0, message_lines+1).join('\n') + '\n' + error.stack
//   }
// }
// throw new RethrownError(`Oh no a "${error.message}" error`, error)
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
function _assertBase64(base64) {
    var _a;
    return (((_a = b64_regex.exec(base64)) === null || _a === void 0 ? void 0 : _a[0]) === base64);
    // if above doesn't work try:
    // const z = b64_regex.exec(base64);
    // if (z) return (z[0] === base64); else return false;
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
    // previous JS version, potentially preferred:
    // const length = string.length;
    // const buffer = new Uint8Array(length);
    // for (let i = 0; i < length; i++) buffer[i] = string.charCodeAt(i);
    // return buffer;
}
/**
 * Standardized 'ab2str()' function, array buffer to string.
 * This assumes one byte per character.
 *
 * @param {string} string
 * @return {Uint8Array} buffer
 *
 */
export function ab2str(buffer) {
    return new TextDecoder("utf-8").decode(buffer);
    // prior JS version:
    // return String.fromCharCode.apply(null, new Uint8Array(buffer));
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
    str = str.replace(/\s+/g, ''); // collapse any whitespace
    if (!_assertBase64(str))
        throw new Error('invalid character');
    let tmp;
    switch (str.length % 4) {
        case 2:
            str += "==";
            break;
        case 3:
            str += "=";
            break;
    }
    const [validLen, placeHoldersLen] = getLens(str);
    const arr = new Uint8Array(_byteLength(validLen, placeHoldersLen));
    let curByte = 0;
    const len = placeHoldersLen > 0 ? validLen - 4 : validLen;
    let i;
    for (i = 0; i < len; i += 4) {
        let r0 = revLookup[str.charCodeAt(i)];
        let r1 = revLookup[str.charCodeAt(i + 1)];
        let r2 = revLookup[str.charCodeAt(i + 2)];
        let r3 = revLookup[str.charCodeAt(i + 3)];
        tmp = (r0 << 18) | (r1 << 12) | (r2 << 6) | (r3);
        arr[curByte++] = (tmp >> 16) & 0xff;
        arr[curByte++] = (tmp >> 8) & 0xff;
        arr[curByte++] = (tmp) & 0xff;
    }
    if (placeHoldersLen === 2) {
        let r0 = revLookup[str.charCodeAt(i)];
        let r1 = revLookup[str.charCodeAt(i + 1)];
        tmp = (r0 << 2) | (r1 >> 4);
        arr[curByte++] = tmp & 0xff;
    }
    if (placeHoldersLen === 1) {
        let r0 = revLookup[str.charCodeAt(i)];
        let r1 = revLookup[str.charCodeAt(i + 1)];
        let r2 = revLookup[str.charCodeAt(i + 2)];
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
 * @param {bufferSource} Uint8Array buffer
 * @return {string} base64 string
 */
export function arrayBufferToBase64(buffer) {
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
export function _appendBuffer(buffer1, buffer2) {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}
;
