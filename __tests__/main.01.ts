/* ****************************************************************
 *  These are wrappers to handle both browser and node targets
 *  with the same code. The 'process.browser' value is replaced
 *  by rollup and this whole library is then tree-shaken so
 *  that only either the node-specific or browser-specific code
 *  is retained, into 'index.mjs' and 'browser.mjs' respectively.
 * ****************************************************************/


function _sb_exception(loc, msg) {
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
function getRandomValues(buffer: Uint8Array) {
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
function _assertBase64(base64) {
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
function str2ab(string) {
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
function ab2str(buffer) {
  if (!_assertUint8Array(buffer)) _sb_exception('ab2str()', 'parameter is not a Uint8Array buffer'); // this will throw
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}
