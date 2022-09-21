/* ****************************************************************
 *  These are wrappers to handle both browser and node targets
 *  with the same code. The 'process.browser' value is replaced
 *  by rollup and this whole library is then tree-shaken so
 *  that only either the node-specific or browser-specific code
 *  is retained, into 'index.mjs' and 'browser.mjs' respectively.
 * ****************************************************************/


function _sb_exception(loc: string, msg: string) {
  const m = '<< SB lib error (' + loc + ': ' + msg + ') >>';
  // for now disabling this to keep node testing less noisy
  // console.error(m);
  throw new Error(m);
}

let _crypto = crypto;
let _ws = WebSocket;

/** 
 * Fills buffer with random data
 */
export function getRandomValues(buffer: Uint8Array) {
  return _crypto.getRandomValues(buffer);
}

/**
 * Returns 'true' if (and only if) object is of type 'Uint8Array'.
 * Works same on browsers and nodejs.
 */
function _assertUint8Array(obj: any) {
  if (typeof obj === 'object') if (Object.prototype.toString.call(obj) === '[object Uint8Array]') return true;
  return false;
}

const b64_regex = new RegExp('^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$');

/**
 * Returns 'true' if (and only if) string is well-formed base64.
 * Works same on browsers and nodejs.
 */
function _assertBase64(base64: string) {
  /* webpack 4 doesn't support optional chaining, requires webpack 5;
     since wp 5 is pretty recent (2020-10-10), we'll avoid using
     optional chaining in this library for a while */
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
  const length = string.length;
  const buffer = new Uint8Array(length);
  for (let i = 0; i < length; i++) buffer[i] = string.charCodeAt(i);
  return buffer;
}

/**
 * Standardized 'ab2str()' function, array buffer to string.
 * This assumes one byte per character.
 *
 * @param {string} string
 * @return {Uint8Array} buffer
 *
 */
export function ab2str(buffer: Uint8Array) {
  if (!_assertUint8Array(buffer)) _sb_exception('ab2str()', 'parameter is not a Uint8Array buffer'); // this will throw
  // return String.fromCharCode.apply(String, new Uint8Array(buffer));
  return new TextDecoder("utf-8").decode(buffer);
}


/*
 * Extracted from:
 * https://raw.githubusercontent.com/dankogai/js-base64/main/base64.ts
 */

const _fromCC = String.fromCharCode.bind(String);

/**
 * Standardized 'btoa()'-like function, e.g., takes a binary string
 * ('b') and returns a Base64 encoded version ('a' used to be short
 * for 'ascii').
 *
 * @param {buffer} Uint8Array buffer
 * @return {string} base64 string
 */
export function arrayBufferToBase64(u8a: Uint8Array) {
  const maxargs = 0x1000;
  let strs: string[] = [];
  for (let i = 0, l = u8a.length; i < l; i += maxargs) {
    strs.push(new TextDecoder("utf-8").decode(u8a.subarray(i, i + maxargs)));
  }
  // return window.btoa(strs.join(''));
  return window.btoa(unescape(encodeURIComponent(strs.join(''))));
}


/**
 * Standardized 'atob()' function, e.g. takes the a Base64 encoded
 * input and decodes it. Note: always returns Uint8Array.
 *
 * @param {string} base64 string
 * @return {Uint8Array} returns decoded result
 */
export function base64ToArrayBuffer(asc: string) {
  return new TextEncoder().encode(window.atob(asc));
}

export function _appendBuffer(buffer1: Uint8Array, buffer2: Uint8Array) {
  try {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
  } catch (e) {
    console.error(e);
    return {};
  }
};
