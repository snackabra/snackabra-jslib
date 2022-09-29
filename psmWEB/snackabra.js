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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _MessageBus_instances, _MessageBus_select, _SBFile_instances, _SBFile_asImage, _SBFile_getFileData, _SBFile_padImage, _SBFile_restrictPhoto, _SBFile_scaleCanvas, _SBFile_generateImageHash, _SBFile_readPhoto, _SBWebSocket_instances, _SBWebSocket_closed, _SBWebSocket_url, _SBWebSocket_websocket, _SBWebSocket_timeout, _SBWebSocket_ack, _SBWebSocket_processMessage, _SBWebSocket_readyPromise, _Channel_keys, _Channel_api, _Channel_socket, _ChannelSocket_instances, _ChannelSocket_url, _ChannelSocket_channel, _ChannelSocket_identity, _ChannelSocket_queue, _ChannelSocket_wrap, _StorageApi_instances, _StorageApi_channel, _StorageApi_identity, _StorageApi_getFileKey, _StorageApi_unpadData, _ChannelApi_identity, _ChannelApi_channel, _ChannelApi_channelApi, _ChannelApi_channelServer, _ChannelApi_payload, _IndexedKV_instances, _IndexedKV_useDatabase, _Snackabra_listOfChannels;
/*
  format is a single string:
  
  dZbuNAeDnuMOLPYcfExi4RIUVPljFZUZLE3tUo3zl1-avzxmm9nBhtRPVOwu6kK4
  011000001101110010110011101001000001101001
*/
var msgIdRegex = /^([A-Za-z0-9+/_\-=]{64})*([01]{42})$/;
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
    return ('THIS IS NEITHER BROWSER NOR NODE THIS IS SPARTA!');
}
/**
 * SB simple events (mesage bus) class
 */
var MessageBus = /** @class */ (function () {
    function MessageBus() {
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
    Object.defineProperty(MessageBus.prototype, "subscribe", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (event, handler) {
            __classPrivateFieldGet(this, _MessageBus_instances, "m", _MessageBus_select).call(this, event).push(handler);
        }
    });
    /**
     * Unsubscribe
     */
    Object.defineProperty(MessageBus.prototype, "unsubscribe", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (event, handler) {
            var i = -1;
            if (this.bus[event]) {
                if ((i = this.bus[event].findLastIndex(function (e) { return e == handler; })) != -1) {
                    this.bus[event].splice(i, 1);
                }
                else {
                    console.info("fyi: asked to remove a handler but it's not there");
                }
            }
            else {
                console.info("fyi: asked to remove a handler but the event is not there");
            }
        }
    });
    /**
     * Publish
     */
    Object.defineProperty(MessageBus.prototype, "publish", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            for (var _a = 0, _b = __classPrivateFieldGet(this, _MessageBus_instances, "m", _MessageBus_select).call(this, '*'); _a < _b.length; _a++) {
                var handler = _b[_a];
                handler.apply(void 0, __spreadArray([event], args, false));
            }
            for (var _c = 0, _d = __classPrivateFieldGet(this, _MessageBus_instances, "m", _MessageBus_select).call(this, event); _c < _d.length; _c++) {
                var handler = _d[_c];
                handler.apply(void 0, args);
            }
        }
    });
    return MessageBus;
}());
export { MessageBus };
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
export function _sb_exception(loc, msg) {
    var m = '<< SB lib error (' + loc + ': ' + msg + ') >>';
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
        return new Promise(function (resolve) { return resolve(val); });
    }
}
// internal - handle assertions
export function _sb_assert(val, msg) {
    if (!(val)) {
        var m = "<< SB assertion error: ".concat(msg, " >>");
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
export function getRandomValues(buffer) {
    return crypto.getRandomValues(buffer);
}
// Strict b64 check:
// const b64_regex = new RegExp('^(?:[A-Za-z0-9+/_\-]{4})*(?:[A-Za-z0-9+/_\-]{2}==|[A-Za-z0-9+/_\-]{3}=)?$')
// But we will go (very) lenient:
var b64_regex = /^([A-Za-z0-9+/_\-=]*)$/;
/**
 * Returns 'true' if (and only if) string is well-formed base64.
 * Works same on browsers and nodejs.
 */
export function _assertBase64(base64) {
    // return (b64_regex.exec(base64)?.[0] === base64);
    var z = b64_regex.exec(base64);
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
var b64lookup = [];
var urlLookup = [];
var revLookup = [];
var CODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var CODE_B64 = CODE + '+/';
var CODE_URL = CODE + '-_';
var PAD = '=';
var MAX_CHUNK_LENGTH = 16383; // must be multiple of 3
for (var i = 0, len = CODE_B64.length; i < len; ++i) {
    b64lookup[i] = CODE_B64[i];
    urlLookup[i] = CODE_URL[i];
    revLookup[CODE_B64.charCodeAt(i)] = i;
}
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;
function getLens(b64) {
    var len = b64.length;
    var validLen = b64.indexOf(PAD);
    if (validLen === -1)
        validLen = len;
    var placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
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
    var tmp;
    switch (str.length % 4) {
        case 2:
            str += '==';
            break;
        case 3:
            str += '=';
            break;
    }
    var _a = getLens(str), validLen = _a[0], placeHoldersLen = _a[1];
    var arr = new Uint8Array(_byteLength(validLen, placeHoldersLen));
    var curByte = 0;
    var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
    var i;
    for (i = 0; i < len; i += 4) {
        var r0 = revLookup[str.charCodeAt(i)];
        var r1 = revLookup[str.charCodeAt(i + 1)];
        var r2 = revLookup[str.charCodeAt(i + 2)];
        var r3 = revLookup[str.charCodeAt(i + 3)];
        tmp = (r0 << 18) | (r1 << 12) | (r2 << 6) | (r3);
        arr[curByte++] = (tmp >> 16) & 0xff;
        arr[curByte++] = (tmp >> 8) & 0xff;
        arr[curByte++] = (tmp) & 0xff;
    }
    if (placeHoldersLen === 2) {
        var r0 = revLookup[str.charCodeAt(i)];
        var r1 = revLookup[str.charCodeAt(i + 1)];
        tmp = (r0 << 2) | (r1 >> 4);
        arr[curByte++] = tmp & 0xff;
    }
    if (placeHoldersLen === 1) {
        var r0 = revLookup[str.charCodeAt(i)];
        var r1 = revLookup[str.charCodeAt(i + 1)];
        var r2 = revLookup[str.charCodeAt(i + 2)];
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
    var tmp;
    var output = new Array((end - start) / 3);
    for (var i = start, j = 0; i < end; i += 3, j++) {
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
var bs2dv = function (bs) { return bs instanceof ArrayBuffer
    ? new DataView(bs)
    : new DataView(bs.buffer, bs.byteOffset, bs.byteLength); };
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
        console.log(buffer);
        // const view = new DataView(buffer)
        var view = bs2dv(buffer);
        var len = view.byteLength;
        var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
        var len2 = len - extraBytes;
        var parts = new Array(Math.floor(len2 / MAX_CHUNK_LENGTH) + Math.sign(extraBytes));
        // const lookup = urlLookup;
        var lookup = b64lookup; // regular atob() doesn't like url friendly
        var pad = '';
        var j = 0;
        for (var i = 0; i < len2; i += MAX_CHUNK_LENGTH) {
            parts[j++] = encodeChunk(lookup, view, i, (i + MAX_CHUNK_LENGTH) > len2 ? len2 : (i + MAX_CHUNK_LENGTH));
        }
        if (extraBytes === 1) {
            var tmp = view.getUint8(len - 1);
            parts[j] = (lookup[tmp >> 2] +
                lookup[(tmp << 4) & 0x3f] +
                pad + pad);
        }
        else if (extraBytes === 2) {
            var tmp = (view.getUint8(len - 2) << 8) + view.getUint8(len - 1);
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
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
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
var defaultPublicKeyPEM = "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtVedzwPq7OIl84xx9ruV\nTAkv+sUPUYeQJ3PtFOJkBSrMyGPErVxjXQQ6nvb+OevQ2t7EhimyQ3bnP7PdeAU2\nmWQX6V8LfhJj0ox8Envtw9DF7nEED5aLwnimTjox906j7itXO2xDdJCRuAfpar3u\nTj3d0EAKWFXTBHrorKI0pHCg1opIRsqNjpVnetZn1SweCtArE7YymNRQmoi8XWzj\nyCt41fGFoFcmVeE87hiq41NJkE0iMfrmf6QqE91Fp1BSSTD75KEbKPXepS/jl3nV\nVFe4tWrHypcT+Uk7I2UBqHnR+AnODVrSxZMzoVnXoYbhDAdReTQ81MrSQ+LW7yZV\nrTxa5uYVPIRB6l58dpBEhIGcvEz376fvEwdhEqw9iXm7FchbqX3FQpwDVKvguj+w\njIaV60/hyBaRPO2oD9IhByvL3F+Gq+iwQRXbEgvI8QvkJ1w/WcelytljcwUoYbC5\n7VS7EvnoNvMQT+r5RJfoPVPbwsCOFAQCVnzyOPAMZyUn69ycK+rONvrVxkM+c8Q2\n8w7do2MDeRWJRf4Va0XceXsN+YcK7g9bqBWrBYJIWzeRiAQ3R6kyaxxbdEhyY3Hl\nOlY876IbVmwlWAQ82l9r7ECjBL2nGMjDFm5Lv8TXKC5NHWHwY1b2vfvl6cyGtG1I\nOTJj8TMRI6y3Omop3kIfpgUCAwEAAQ==\n-----END PUBLIC KEY-----";
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
    var pemHeader = '-----BEGIN PUBLIC KEY-----';
    var pemFooter = '-----END PUBLIC KEY-----';
    var start = pem.indexOf(pemHeader);
    var end = pem.indexOf(pemFooter);
    if ((start < 0) || (end < 0))
        _sb_exception('importPublicKey()', 'fail to find BEGIN and/or END string in RSA (PEM) key');
    var pemContents = pem.slice(start + pemHeader.length, end);
    // const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    // console.log(pemContents)
    var binaryDer = base64ToArrayBuffer(pemContents);
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
var base32mi = '0123456789abcdefyhEjkLmNHpFrRTUW';
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
        var z = crypto.getRandomValues(new Uint8Array(n));
        var r = '';
        for (var i = 0; i < n; i++)
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
 * callback function with the results
 *
 * @param {dict} dictionary (payload)
 * @param {publicKeyPEM} public key (PEM format)
 * @param {callback} callback function, called with results
 *
 */
export function packageEncryptDict(dict, publicKeyPEM, callback) {
    var clearDataArrayBufferView = str2ab(JSON.stringify(dict));
    var aesAlgorithmKeyGen = { name: 'AES-GCM', length: 256 };
    var aesAlgorithmEncrypt = { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(16)) };
    if (!publicKeyPEM)
        publicKeyPEM = defaultPublicKeyPEM;
    // Create a key generator to produce a one-time-use AES key to encrypt some data
    crypto.subtle.generateKey(aesAlgorithmKeyGen, true, ['encrypt']).then(function (aesKey) {
        // we are exporting the symmetric AES key so we can encrypt it using pub key
        crypto.subtle.exportKey('raw', aesKey).then(function (theKey) {
            var rsaAlgorithmEncrypt = { name: 'RSA-OAEP' };
            importPublicKey(publicKeyPEM).then(function (publicKey) {
                return crypto.subtle.encrypt(rsaAlgorithmEncrypt, publicKey, theKey);
            }).then(function (buf) {
                var encryptedAesKey = arrayBufferToBase64(buf);
                return encryptedAesKey;
            }).then(function (encAesKey) {
                return Promise.all([crypto.subtle.encrypt(aesAlgorithmEncrypt, aesKey, clearDataArrayBufferView), encAesKey]);
            }).then(function (arr) {
                // arr[0] is the encrypted dict in raw format, arr[1] is the aes key encrypted with rsa public key
                var encryptedData = arrayBufferToBase64(arr[0]);
                var postableEncryptedAesKey = arr[1];
                var theContent = encodeURIComponent(encryptedData);
                var data = {
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
    var returnArr = [];
    var i, l;
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
            var s2 = '';
            var s3 = '';
            var str2 = str;
            while (str2 != (s3 = s2, s2 = str2, str2 = (_a = str2 === null || str2 === void 0 ? void 0 : str2.match(/^(['"])(.*)\1$/m)) === null || _a === void 0 ? void 0 : _a[2]))
                return JSON.parse("'".concat(s3, "'"));
        }
        catch (_b) {
            // let's try one more thing
            try {
                return JSON.parse(str.slice(1, -1));
            }
            catch (_c) {
                // i am beginning to dislike TS .. ugh no simple way to get error message
                // see: https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
                throw new Error("JSON.parse() error at ".concat(loc, " (tried eval and slice)\nString was: ").concat(str));
            }
        }
    }
}
/**
 * Extract payload
 */
export function extractPayloadV1(payload) {
    try {
        var metadataSize = new Uint32Array(payload.slice(0, 4))[0];
        var decoder = new TextDecoder();
        var metadata = jsonParseWrapper(decoder.decode(payload.slice(4, 4 + metadataSize)), 'L476');
        var startIndex = 4 + metadataSize;
        var data = {};
        for (var key in metadata) {
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
        var metadata = {};
        metadata['version'] = '002';
        var keyCount = 0;
        var startIndex = 0;
        for (var key in data) {
            if (data.key) {
                keyCount++;
                metadata[keyCount.toString()] = { name: key, start: startIndex, size: data[key].byteLength };
                startIndex += data[key].byteLength;
            }
        }
        var encoder = new TextEncoder();
        var metadataBuffer = encoder.encode(JSON.stringify(metadata));
        var metadataSize = new Uint32Array([metadataBuffer.byteLength]);
        // psm: changed to Uint8 .. hope that doesn't break things?
        var payload = _appendBuffer(new Uint8Array(metadataSize.buffer), new Uint8Array(metadataBuffer));
        for (var key in data) {
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
export function extractPayload(payload) {
    try {
        var metadataSize = new Uint32Array(payload.slice(0, 4))[0];
        var decoder = new TextDecoder();
        console.info('METADATASIZE: ', metadataSize);
        console.info('METADATASTRING: ', decoder.decode(payload.slice(4, 4 + metadataSize)));
        var _metadata = jsonParseWrapper(decoder.decode(payload.slice(4, 4 + metadataSize)), 'L533');
        console.info('METADATA EXTRACTED', JSON.stringify(_metadata));
        var startIndex = 4 + metadataSize;
        if (!_metadata.version) {
            _metadata['version'] = '001';
        }
        console.info(_metadata['version']);
        switch (_metadata['version']) {
            case '001': {
                return extractPayloadV1(payload);
            }
            case '002': {
                var data = [];
                for (var i = 1; i < Object.keys(_metadata).length; i++) {
                    var _index = i.toString();
                    if (_metadata._index) {
                        var propertyStartIndex = _metadata[_index]['start'];
                        console.info(propertyStartIndex);
                        var size = _metadata[_index]['size'];
                        var entry = _metadata[_index];
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
    var pad = input.length % 4;
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
var Crypto = /** @class */ (function () {
    function Crypto() {
    }
    /**
     * Extracts (generates) public key from a private key.
     */
    Object.defineProperty(Crypto.prototype, "extractPubKey", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (privateKey) {
            try {
                var pubKey = __assign({}, privateKey);
                delete pubKey.d;
                delete pubKey.dp;
                delete pubKey.dq;
                delete pubKey.q;
                delete pubKey.qi;
                // pubKey.key_ops = [];
                return pubKey;
            }
            catch (e) {
                console.error(e);
                return null;
            }
        }
    });
    /**
     * Generates standard ``ECDH`` keys using ``P-384``.
     */
    Object.defineProperty(Crypto.prototype, "generateKeys", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var _a, e_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            _a = resolve;
                            return [4 /*yield*/, crypto.subtle.generateKey({
                                    name: 'ECDH', namedCurve: 'P-384'
                                }, true, ['deriveKey'])];
                        case 1:
                            _a.apply(void 0, [_b.sent()]);
                            return [3 /*break*/, 3];
                        case 2:
                            e_1 = _b.sent();
                            reject(e_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    /**
     * Import keys
     */
    Object.defineProperty(Crypto.prototype, "importKey", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (format, key, type, extractable, keyUsages) {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var keyAlgorithms, response, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            keyAlgorithms = {
                                ECDH: {
                                    name: 'ECDH', namedCurve: 'P-384'
                                }, AES: {
                                    name: 'AES-GCM'
                                }, PBKDF2: 'PBKDF2'
                            };
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, window.crypto.subtle.importKey(format, key, keyAlgorithms[type], extractable, keyUsages)];
                        case 2:
                            response = _a.sent();
                            resolve(response);
                            return [3 /*break*/, 4];
                        case 3:
                            e_2 = _a.sent();
                            console.error(format, key, type, extractable, keyUsages);
                            reject(e_2);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    /**
     * Derive key.
     */
    Object.defineProperty(Crypto.prototype, "deriveKey", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (privateKey, publicKey, type, extractable, keyUsages) {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var keyAlgorithms, _a, e_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            keyAlgorithms = {
                                AES: {
                                    name: 'AES-GCM', length: 256
                                }, HMAC: {
                                    name: 'HMAC', hash: 'SHA-256', length: 256
                                }
                            };
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            _a = resolve;
                            return [4 /*yield*/, crypto.subtle.deriveKey({
                                    name: 'ECDH',
                                    public: publicKey
                                }, privateKey, keyAlgorithms[type], extractable, keyUsages)];
                        case 2:
                            _a.apply(void 0, [_b.sent()]);
                            return [3 /*break*/, 4];
                        case 3:
                            e_3 = _b.sent();
                            console.error(e_3, privateKey, publicKey, type, extractable, keyUsages);
                            reject(e_3);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    /**
     * Get file key
     */
    Object.defineProperty(Crypto.prototype, "getFileKey", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (fileHash, _salt) {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var keyMaterial, key, e_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey'])];
                        case 1:
                            keyMaterial = _a.sent();
                            return [4 /*yield*/, crypto.subtle.deriveKey({
                                    'name': 'PBKDF2',
                                    'salt': _salt,
                                    'iterations': 100000,
                                    'hash': 'SHA-256'
                                }, keyMaterial, { 'name': 'AES-GCM', 'length': 256 }, true, ['encrypt', 'decrypt'])];
                        case 2:
                            key = _a.sent();
                            // return key;
                            resolve(key);
                            return [3 /*break*/, 4];
                        case 3:
                            e_4 = _a.sent();
                            reject(e_4);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    /**
     * Encrypt
     */
    Object.defineProperty(Crypto.prototype, "encrypt", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (contents, secret_key, outputType, _iv) {
            var _this = this;
            if (outputType === void 0) { outputType = 'string'; }
            if (_iv === void 0) { _iv = null; }
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var iv, algorithm, key, data, encoder, encrypted, e_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            if (contents === null) {
                                reject(new Error('no contents'));
                            }
                            iv = _iv === null ? crypto.getRandomValues(new Uint8Array(12)) : _iv;
                            algorithm = {
                                name: 'AES-GCM',
                                iv: iv
                            };
                            key = secret_key;
                            data = contents;
                            encoder = new TextEncoder();
                            if (typeof contents === 'string') {
                                data = encoder.encode(contents);
                            }
                            encrypted = void 0;
                            return [4 /*yield*/, crypto.subtle.encrypt(algorithm, key, data)];
                        case 1:
                            encrypted = _a.sent();
                            console.log(encrypted);
                            resolve((outputType === 'string') ? {
                                content: encodeURIComponent(arrayBufferToBase64(encrypted)), iv: encodeURIComponent(arrayBufferToBase64(iv))
                            } : { content: encrypted, iv: iv });
                            return [3 /*break*/, 3];
                        case 2:
                            e_5 = _a.sent();
                            console.error(e_5);
                            reject(e_5);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    /**
     * Decrypt
     */
    Object.defineProperty(Crypto.prototype, "decrypt", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (secretKey, contents, outputType) {
            var _this = this;
            if (outputType === void 0) { outputType = 'string'; }
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var ciphertext, iv, decrypted, e_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            ciphertext = typeof contents.content === 'string' ? base64ToArrayBuffer(decodeURIComponent(contents.content)) : contents.content;
                            iv = typeof contents.iv === 'string' ? base64ToArrayBuffer(decodeURIComponent(contents.iv)) : contents.iv;
                            return [4 /*yield*/, crypto.subtle.decrypt({
                                    name: 'AES-GCM', iv: iv
                                }, secretKey, ciphertext)];
                        case 1:
                            decrypted = _a.sent();
                            resolve(new TextDecoder().decode(decrypted));
                            return [3 /*break*/, 3];
                        case 2:
                            e_6 = _a.sent();
                            reject(e_6);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    /**
     * Sign
     */
    Object.defineProperty(Crypto.prototype, "sign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (secretKey, contents) {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var encoder, encoded, sign, error_1, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            encoder = new TextEncoder();
                            encoded = encoder.encode(contents);
                            sign = void 0;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, crypto.subtle.sign('HMAC', secretKey, encoded)];
                        case 2:
                            sign = _a.sent();
                            resolve(encodeURIComponent(arrayBufferToBase64(sign)));
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            reject(error_1);
                            return [3 /*break*/, 4];
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            error_2 = _a.sent();
                            reject(error_2);
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    /**
     * Verify
     */
    Object.defineProperty(Crypto.prototype, "verify", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (secretKey, sign, contents) {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var _sign, encoder, encoded, verified, e_7, e_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            _sign = base64ToArrayBuffer(decodeURIComponent(sign));
                            encoder = new TextEncoder();
                            encoded = encoder.encode(contents);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, crypto.subtle.verify('HMAC', secretKey, _sign, encoded)];
                        case 2:
                            verified = _a.sent();
                            resolve(verified);
                            return [3 /*break*/, 4];
                        case 3:
                            e_7 = _a.sent();
                            reject(e_7);
                            return [3 /*break*/, 4];
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            e_8 = _a.sent();
                            reject(e_8);
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    /**
     * Compare keys
     */
    Object.defineProperty(Crypto.prototype, "areKeysSame", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (key1, key2) {
            if (key1 != null && key2 != null && typeof key1 === 'object' && typeof key2 === 'object') {
                return key1['x'] === key2['x'] && key1['y'] === key2['y'];
            }
            return false;
        }
    });
    return Crypto;
}());
var SB_Crypto = new Crypto();
/**
 * Identity (key for use in SB)
 * @class
 * @constructor
 * @public
 */
var Identity = /** @class */ (function () {
    function Identity() {
        var _this = this;
        Object.defineProperty(this, "resolve_exportable_pubKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (function () { throw new Error('uninit prom called'); })
        });
        Object.defineProperty(this, "resolve_exportable_privateKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (function () { throw new Error('uninit prom called'); })
        });
        Object.defineProperty(this, "resolve_privateKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (function () { throw new Error('uninit prom called'); })
        });
        Object.defineProperty(this, "exportable_pubKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Promise(function (resolve) { return _this.resolve_exportable_pubKey = resolve; })
        });
        Object.defineProperty(this, "exportable_privateKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Promise(function (resolve) { return _this.resolve_exportable_privateKey = resolve; })
        });
        Object.defineProperty(this, "privateKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Promise(function (resolve) { return _this.resolve_privateKey = resolve; })
        });
    }
    /**
     * Mint keys
     */
    Object.defineProperty(Identity.prototype, "mintKeys", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    try {
                        SB_Crypto.generateKeys().then(function (keyPair) {
                            crypto.subtle.exportKey('jwk', keyPair.publicKey).then(function (k) { return _this.resolve_exportable_pubKey(k); });
                            crypto.subtle.exportKey('jwk', keyPair.privateKey).then(function (k) { return _this.resolve_exportable_privateKey(k); });
                            _this.resolve_privateKey(keyPair.privateKey);
                            Promise.all([_this.resolve_exportable_pubKey, _this.resolve_privateKey]).then(function () { return resolve(true); });
                        });
                    }
                    catch (e) {
                        reject(e);
                    }
                    return [2 /*return*/];
                });
            }); });
        }
    });
    /**
     * Mount keys
     */
    Object.defineProperty(Identity.prototype, "mountKeys", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (key) {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    try {
                        this.resolve_exportable_privateKey(key);
                        this.resolve_exportable_pubKey(SB_Crypto.extractPubKey(key));
                        SB_Crypto.importKey('jwk', key, 'ECDH', true, ['deriveKey']).then(function (k) {
                            _this.resolve_privateKey(k);
                            resolve(true);
                        });
                    }
                    catch (e) {
                        reject(e);
                    }
                    return [2 /*return*/];
                });
            }); });
        }
    });
    Object.defineProperty(Identity.prototype, "_id", {
        get: function () {
            return JSON.stringify(this.exportable_pubKey);
        },
        enumerable: false,
        configurable: true
    });
    return Identity;
}());
/**
 * SBMessage
 * @class
 * @constructor
 * @public
 */
var SBMessage = /** @class */ (function () {
    function SBMessage(channel, body) {
        var _this = this;
        Object.defineProperty(this, "ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "signKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "contents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { encrypted: false, body: '', sign: '', image: '', imageMetaData: {} }
        });
        console.log("creating SBMessage on channel:");
        console.log(channel);
        this.contents.body = body;
        this.contents.sender_pubKey = channel.keys.exportable_pubKey; // need to get this from SB object
        this.signKey = channel.keys.personal_signKey;
        this.ready = new Promise(function (resolve) {
            var sign = SB_Crypto.sign(_this.signKey, body);
            var image_sign = SB_Crypto.sign(_this.signKey, _this.contents.image);
            var imageMetadata_sign = SB_Crypto.sign(_this.signKey, JSON.stringify(_this.contents.imageMetaData));
            Promise.all([sign, image_sign, imageMetadata_sign]).then(function (values) {
                _this.contents.sign = values[0];
                _this.contents.image_sign = values[1];
                _this.contents.imageMetadata_sign = values[2];
                resolve(_this);
            });
        });
    }
    return SBMessage;
}());
/**
 * SBFile
 * @class
 * @constructor
 * @public
 */
var SBFile = /** @class */ (function () {
    // file is an instance of File
    function SBFile(file, signKey, key) {
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
            value: ''
        });
        Object.defineProperty(this, "senderPubKey", {
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
        // psm: this should all be done in a class manner, no?
        //      e.g. SBFileImage inherits from SBFile?
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
            value: ''
        });
        Object.defineProperty(this, "imageMetaData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "imageMetadata_sign", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        this.senderPubKey = key;
        // psm: again, why are we signing empty contents?
        this.sign = SB_Crypto.sign(signKey, this.contents);
        if (file.type.match(/^image/i)) {
            __classPrivateFieldGet(this, _SBFile_instances, "m", _SBFile_asImage).call(this, file, signKey);
        }
        else {
            throw new Error('Unsupported file type: ' + file.type);
        }
    }
    return SBFile;
}());
_SBFile_instances = new WeakSet(), _SBFile_asImage = function _SBFile_asImage(image, signKey) {
    // psm: this should all be replaced by SBImage
    throw new Error('#asImage() needs carryover from SBImage etc');
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
}, _SBFile_getFileData = function _SBFile_getFileData(file, outputType) {
    try {
        var reader_1 = new FileReader();
        if (file.size === 0) {
            return null;
        }
        outputType === 'url' ? reader_1.readAsDataURL(file) : reader_1.readAsArrayBuffer(file);
        return new Promise(function (resolve) {
            reader_1.onloadend = function () {
                var the_blob = reader_1.result;
                resolve(the_blob);
            };
        });
    }
    catch (e) {
        console.log(e);
        return null;
    }
}, _SBFile_padImage = function _SBFile_padImage(image_buffer) {
    var _sizes = [128, 256, 512, 1024, 2048, 4096]; // in KB
    _sizes = _sizes.map(function (size) { return size * 1024; });
    var image_size = image_buffer.byteLength;
    // console.log('BEFORE PADDING: ', image_size)
    var _target = 0;
    if (image_size < _sizes[_sizes.length - 1]) {
        for (var i = 0; i < _sizes.length; i++) {
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
    var _padding_array = [128];
    _target = _target - image_size - 21;
    // We will finally convert to Uint32Array where each element is 4 bytes
    // So we need (_target/4) - 6 array elements with value 0 (128 bits or 16 bytes or 4 elements to be left empty,
    // last 4 bytes or 1 element to represent the size and 1st element is 128 or 0x80)
    for (var i = 0; i < _target; i++) {
        _padding_array.push(0);
    }
    // _padding_array.push(image_size);
    var _padding = new Uint8Array(_padding_array).buffer;
    // console.log('Padding size: ', _padding.byteLength)
    var final_data = _appendBuffer(image_buffer, _padding);
    final_data = _appendBuffer(final_data, new Uint32Array([image_size]).buffer);
    // console.log('AFTER PADDING: ', final_data.byteLength)
    return final_data;
}, _SBFile_restrictPhoto = function _SBFile_restrictPhoto(photo, maxSize, // in KB
imageType, qualityArgument) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // latest and greatest JS version is in:
            // 384-snackabra-webclient/src/utils/ImageProcessor.js
            throw new Error('restrictPhoto() needs TS version');
        });
    });
}, _SBFile_scaleCanvas = function _SBFile_scaleCanvas(canvas, scale) {
    // latest and greatest JS version is in:
    // 384-snackabra-webclient/src/utils/ImageProcessor.js
    throw new Error('scaleCanvas() needs TS version');
    var scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;
    // console.log(`#### scaledCanvas target W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
    scaledCanvas
        .getContext('2d')
        .drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    // console.log(`#### scaledCanvas actual W ${scaledCanvas.width} x H ${scaledCanvas.height}`);
    return scaledCanvas;
}, _SBFile_generateImageHash = function _SBFile_generateImageHash(image) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // latest and greatest JS version is in:
            // 384-snackabra-webclient/src/utils/ImageProcessor.js
            throw new Error('generateImageHash() needs TS version');
        });
    });
}, _SBFile_readPhoto = function _SBFile_readPhoto(photo) {
    return __awaiter(this, void 0, void 0, function () {
        var canvas, img, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    canvas = document.createElement('canvas');
                    img = document.createElement('img');
                    // create img element from File object
                    _a = img;
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var reader = new FileReader();
                            // TODO: the entire readPhoto stuff is replaced by SBImage
                            // @ts-ignore
                            reader.onload = function (e) { var _a; return resolve((_a = e.target) === null || _a === void 0 ? void 0 : _a.result); };
                            // TODO: ditto
                            // @ts-ignore
                            reader.readAsDataURL(photo);
                        })];
                case 1:
                    // create img element from File object
                    _a.src = _b.sent();
                    return [4 /*yield*/, new Promise(function (resolve) {
                            img.onload = resolve;
                        })];
                case 2:
                    _b.sent();
                    // console.log("img object");
                    // console.log(img);
                    // console.log("canvas object");
                    // console.log(canvas);
                    // draw image in canvas element
                    canvas.width = img.width;
                    canvas.height = img.height;
                    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                    return [2 /*return*/, canvas];
            }
        });
    });
};
var SBWebSocket = /** @class */ (function () {
    function SBWebSocket(url, onMessage) {
        _SBWebSocket_instances.add(this);
        Object.defineProperty(this, "ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _SBWebSocket_closed.set(this, false);
        _SBWebSocket_url.set(this, void 0);
        _SBWebSocket_websocket.set(this, void 0);
        _SBWebSocket_timeout.set(this, 30000);
        Object.defineProperty(this, "onMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _SBWebSocket_ack.set(this, []);
        __classPrivateFieldSet(this, _SBWebSocket_url, url, "f");
        this.onMessage = onMessage;
        __classPrivateFieldSet(this, _SBWebSocket_websocket, new WebSocket(url), "f"); // this one will be discarded
        this.ready = __classPrivateFieldGet(this, _SBWebSocket_instances, "m", _SBWebSocket_readyPromise).call(this, url);
    }
    Object.defineProperty(SBWebSocket.prototype, "send", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (m) {
            var _this = this;
            // for future inspiration here are more thoughts on making this more iron clad:
            // https://stackoverflow.com/questions/29881957/websocket-connection-timeout
            return new Promise(function (resolve, reject) {
                if (__classPrivateFieldGet(_this, _SBWebSocket_closed, "f"))
                    _this.ready = __classPrivateFieldGet(_this, _SBWebSocket_instances, "m", _SBWebSocket_readyPromise).call(_this, __classPrivateFieldGet(_this, _SBWebSocket_url, "f"));
                _this.ready.then(function () {
                    switch (__classPrivateFieldGet(_this, _SBWebSocket_websocket, "f").readyState) {
                        case 1: // OPEN
                            _this.ready.then(function () {
                                crypto.subtle.digest('SHA-256', new TextEncoder().encode(m)).then(function (hash) {
                                    var _id = arrayBufferToBase64(hash);
                                    var ackPayload = { timestamp: Date.now(), type: 'ack', _id: _id };
                                    __classPrivateFieldGet(_this, _SBWebSocket_ack, "f")[_id] = resolve;
                                    __classPrivateFieldGet(_this, _SBWebSocket_websocket, "f").send(m);
                                    // TODO: update protocol so server acks on message
                                    __classPrivateFieldGet(_this, _SBWebSocket_websocket, "f").send(JSON.stringify(ackPayload));
                                    setTimeout(function () {
                                        if (__classPrivateFieldGet(_this, _SBWebSocket_ack, "f")[_id]) {
                                            delete __classPrivateFieldGet(_this, _SBWebSocket_ack, "f")[_id];
                                            var error = "Websocket request timed out after ".concat(__classPrivateFieldGet(_this, _SBWebSocket_timeout, "f"), "ms (").concat(_id, ")");
                                            console.error(error);
                                            reject(new Error(error));
                                        }
                                        else {
                                            // normal behavior
                                        }
                                    }, __classPrivateFieldGet(_this, _SBWebSocket_timeout, "f"));
                                });
                            });
                            break;
                        case 3: // CLOSED
                        case 0: // CONNECTING
                        case 2: // CLOSING
                            var errMsg = 'socket not OPEN - either CLOSED or in the state of CONNECTING/CLOSING';
                            _sb_exception('sbWebSocket', 'socket not OPEN - either CLOSED or in the state of CONNECTING/CLOSING');
                    }
                });
            });
        }
    });
    return SBWebSocket;
}());
_SBWebSocket_closed = new WeakMap(), _SBWebSocket_url = new WeakMap(), _SBWebSocket_websocket = new WeakMap(), _SBWebSocket_timeout = new WeakMap(), _SBWebSocket_ack = new WeakMap(), _SBWebSocket_instances = new WeakSet(), _SBWebSocket_processMessage = function _SBWebSocket_processMessage(m) {
    // receives the message, can be of any type
    console.log("got raw message:");
    console.log(m);
    var data = jsonParseWrapper(m, 'L1489');
    console.log("... unwrapped:");
    console.log(data);
    if (data.ack) {
        var r = __classPrivateFieldGet(this, _SBWebSocket_ack, "f")[data._id];
        if (r) {
            delete __classPrivateFieldGet(this, _SBWebSocket_ack, "f")[data._id];
            r(); // resolve
        }
    }
    else if (data.nack) {
        console.error('Nack received');
        __classPrivateFieldSet(this, _SBWebSocket_closed, true, "f");
        __classPrivateFieldGet(this, _SBWebSocket_websocket, "f").close();
    }
    else if (typeof this.onMessage === 'function') {
        if (this.onMessage(data))
            this.onMessage(data);
    }
    else {
        _sb_exception('SBWebSocket', 'received message but there is no hander');
    }
}, _SBWebSocket_readyPromise = function _SBWebSocket_readyPromise(url) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        try {
            if (__classPrivateFieldGet(_this, _SBWebSocket_websocket, "f"))
                __classPrivateFieldGet(_this, _SBWebSocket_websocket, "f").close(); // keep clean
            var ws = __classPrivateFieldSet(_this, _SBWebSocket_websocket, new WebSocket(url), "f");
            ws.addEventListener('open', function () { __classPrivateFieldSet(_this, _SBWebSocket_closed, false, "f"); resolve(_this); });
            ws.addEventListener('message', function (e) { return __classPrivateFieldGet(_this, _SBWebSocket_instances, "m", _SBWebSocket_processMessage).call(_this, e.data); });
            ws.addEventListener('close', function (e) {
                __classPrivateFieldSet(_this, _SBWebSocket_closed, true, "f");
                if (!e.wasClean) {
                    console.log('sbWebSocket() was closed (and NOT cleanly): ', e.reason);
                }
                else {
                    console.log('sbWebSocket() was closed (cleanly): ', e.reason);
                }
                reject('wbSocket() closed before it was opened (?)');
            });
            ws.addEventListener('error', function (e) {
                __classPrivateFieldSet(_this, _SBWebSocket_closed, true, "f");
                console.log('sbWebSocket() error: ', e);
                reject('sbWebSocket creation error (see log)');
            });
        }
        catch (e) {
            __classPrivateFieldSet(_this, _SBWebSocket_closed, true, "f");
            console.log(e);
            reject('failed to create sbWebSocket, see log');
        }
    });
};
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
var Channel = /** @class */ (function () {
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
    function Channel(sbServer, channel_id, identity) {
        var _this = this;
        // url: string;
        // wss: string;
        Object.defineProperty(this, "ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sbServer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "channel_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "defaultIdentity", {
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
        Object.defineProperty(this, "storage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // TODO: in principle should be optional?
        this.sbServer = sbServer;
        this.defaultIdentity = identity;
        _sb_assert(channel_id != null, 'channel_id cannot be null'); // TODO: this can be done with types
        this.channel_id = channel_id;
        __classPrivateFieldSet(this, _Channel_api, new ChannelApi(this.sbServer, this, this.identity), "f");
        __classPrivateFieldSet(this, _Channel_socket, new ChannelSocket(this.sbServer, this, this.identity), "f");
        __classPrivateFieldGet(this, _Channel_socket, "f").onJoin = function (message) {
            if (message === null || message === void 0 ? void 0 : message.ready) {
                console.log(message);
                _this.metaData = message;
                _this.loadKeys(message.keys).then(function () {
                    _this.socket.isReady();
                    // resolve(this);
                });
            }
        };
        // we're ready when the ChannelSocket is ready, but note that the ready function can change
        this.ready = (function () { return __classPrivateFieldGet(_this, _Channel_socket, "f").ready; });
    }
    Object.defineProperty(Channel.prototype, "keys", {
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
        get: function () {
            return __classPrivateFieldGet(this, _Channel_keys, "f");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "api", {
        /**
         * Channel.api()
         */
        get: function () {
            return __classPrivateFieldGet(this, _Channel_api, "f");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "socket", {
        /**
         * Channel.socket()
         */
        get: function () {
            return __classPrivateFieldGet(this, _Channel_socket, "f");
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Channel.loadKeys()
     */
    Object.defineProperty(Channel.prototype, "loadKeys", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (keys) {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var _exportable_owner_pubKey, _exportable_room_signKey, _exportable_encryption_key, _exportable_verifiedGuest_pubKey, _exportable_pubKey, _privateKey, isVerifiedGuest, _owner_pubKey, isOwner, isAdmin, _encryption_key, _room_privateSignKey, _exportable_room_signPubKey, _room_signPubKey, _personal_signKey, _shared_key, _locked_key, _exportable_locked_key, _string_locked_key, _a, _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            if (keys.ownerKey === null) {
                                reject(new Error('Channel does not exist'));
                            }
                            _exportable_owner_pubKey = jsonParseWrapper(keys.ownerKey || JSON.stringify({}), 'L1460');
                            if (_exportable_owner_pubKey.key) {
                                _exportable_owner_pubKey = typeof _exportable_owner_pubKey.key === 'object' ? _exportable_owner_pubKey.key : jsonParseWrapper(_exportable_owner_pubKey.key, 'L1463');
                            }
                            try {
                                _exportable_owner_pubKey.key_ops = [];
                            }
                            catch (error) {
                                reject(error);
                            }
                            _exportable_room_signKey = jsonParseWrapper(keys.signKey, 'L1470');
                            _exportable_encryption_key = jsonParseWrapper(keys.encryptionKey, 'L1471');
                            _exportable_verifiedGuest_pubKey = jsonParseWrapper(keys.guestKey || null, 'L1472');
                            return [4 /*yield*/, this.identity.exportable_pubKey.then()];
                        case 1:
                            _exportable_pubKey = _g.sent();
                            return [4 /*yield*/, this.identity.privateKey.then()];
                        case 2:
                            _privateKey = _g.sent();
                            isVerifiedGuest = false;
                            return [4 /*yield*/, SB_Crypto.importKey('jwk', _exportable_owner_pubKey, 'ECDH', false, [])];
                        case 3:
                            _owner_pubKey = _g.sent();
                            isOwner = SB_Crypto.areKeysSame(_exportable_pubKey, _exportable_owner_pubKey);
                            isAdmin = false;
                            if (!isOwner && !isAdmin) {
                                if (_exportable_verifiedGuest_pubKey === null) {
                                    this.api.postPubKey(_exportable_pubKey);
                                    _exportable_verifiedGuest_pubKey = __assign({}, _exportable_pubKey);
                                }
                                if (SB_Crypto.areKeysSame(_exportable_verifiedGuest_pubKey, _exportable_pubKey)) {
                                    isVerifiedGuest = true;
                                }
                            }
                            return [4 /*yield*/, SB_Crypto.importKey('jwk', _exportable_encryption_key, 'AES', false, ['encrypt', 'decrypt'])];
                        case 4:
                            _encryption_key = _g.sent();
                            return [4 /*yield*/, SB_Crypto.importKey('jwk', _exportable_room_signKey, 'ECDH', true, ['deriveKey'])];
                        case 5:
                            _room_privateSignKey = _g.sent();
                            _exportable_room_signPubKey = SB_Crypto.extractPubKey(_exportable_room_signKey);
                            return [4 /*yield*/, SB_Crypto.importKey('jwk', _exportable_room_signPubKey, 'ECDH', true, [])];
                        case 6:
                            _room_signPubKey = _g.sent();
                            return [4 /*yield*/, SB_Crypto.deriveKey(_privateKey, _room_signPubKey, 'HMAC', false, ['sign', 'verify'])];
                        case 7:
                            _personal_signKey = _g.sent();
                            if (!!isOwner) return [3 /*break*/, 9];
                            return [4 /*yield*/, SB_Crypto.deriveKey(_privateKey, _owner_pubKey, 'AES', false, ['encrypt', 'decrypt'])];
                        case 8:
                            _shared_key = _g.sent();
                            _g.label = 9;
                        case 9: return [4 /*yield*/, _localStorage.getItem(this.channel_id + '_lockedKey')];
                        case 10:
                            _exportable_locked_key = _g.sent();
                            if (!(_exportable_locked_key !== null)) return [3 /*break*/, 13];
                            return [4 /*yield*/, SB_Crypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key, 'L1517'), 'AES', false, ['encrypt', 'decrypt'])];
                        case 11:
                            CryptoKey = _g.sent();
                            _g.label = 12;
                        case 12: return [3 /*break*/, 20];
                        case 13:
                            if (!keys.locked_key) return [3 /*break*/, 20];
                            _b = (_a = SB_Crypto).decrypt;
                            if (!isOwner) return [3 /*break*/, 16];
                            _e = (_d = SB_Crypto).deriveKey;
                            _f = [keys.privateKey];
                            return [4 /*yield*/, SB_Crypto.importKey('jwk', keys.exportable_pubKey, 'ECDH', true, [])];
                        case 14: return [4 /*yield*/, _e.apply(_d, _f.concat([_g.sent(), 'AES', false, ['decrypt']]))];
                        case 15:
                            _c = _g.sent();
                            return [3 /*break*/, 17];
                        case 16:
                            _c = _shared_key;
                            _g.label = 17;
                        case 17: return [4 /*yield*/, _b.apply(_a, [_c, jsonParseWrapper(keys.locked_key, 'L1519'), 'string'])];
                        case 18:
                            _string_locked_key = _g.sent();
                            _exportable_locked_key = jsonParseWrapper(_string_locked_key, 'L1520');
                            return [4 /*yield*/, SB_Crypto.importKey('jwk', jsonParseWrapper(_exportable_locked_key, 'L1521'), 'AES', false, ['encrypt', 'decrypt'])];
                        case 19:
                            _locked_key = _g.sent();
                            _g.label = 20;
                        case 20:
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
                            return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    ;
    return Channel;
}());
_Channel_keys = new WeakMap(), _Channel_api = new WeakMap(), _Channel_socket = new WeakMap();
/** Class managing connections */
var ChannelSocket = /** @class */ (function () {
    // channelCryptoKey: CryptoKey
    function ChannelSocket(sbServer, channel, identity) {
        var _this = this;
        _ChannelSocket_instances.add(this);
        Object.defineProperty(this, "ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // socket!: WS_Protocol;
        Object.defineProperty(this, "sbWebSocket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _ChannelSocket_url.set(this, void 0);
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
        // #payload: Payload;
        _ChannelSocket_queue.set(this, []);
        // ready = false;
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
        // this.url = sbServer.SnackabraOptions.channel_ws
        __classPrivateFieldSet(this, _ChannelSocket_channel, channel, "f");
        __classPrivateFieldSet(this, _ChannelSocket_identity, identity, "f");
        // this.#payload = new Payload();
        // this.open()
        __classPrivateFieldSet(this, _ChannelSocket_url, sbServer.options.channel_server + '/api/room/' + this.channelId + '/websocket', "f"),
            this.sbWebSocket = new SBWebSocket(__classPrivateFieldGet(this, _ChannelSocket_url, "f"), this.receive);
        // we're ready when the socket is ready, but note that the ready function can change
        this.ready = (function () { return _this.sbWebSocket.ready; });
    }
    Object.defineProperty(ChannelSocket.prototype, "unwrap", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (payload, key) {
            return __awaiter(this, void 0, void 0, function () {
                var msg, e_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, SB_Crypto.decrypt(key, payload.encrypted_contents)];
                        case 1:
                            msg = _a.sent();
                            // psm: i think this throws in case of error
                            // if (msg['error']) {
                            //   return {error: msg['error']};
                            // }
                            return [2 /*return*/, msg];
                        case 2:
                            e_9 = _a.sent();
                            return [2 /*return*/, { error: "Error: ".concat(e_9) }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
    });
    /**
     * ChannelSocket.open()
     *
     */
    Object.defineProperty(ChannelSocket.prototype, "open", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            var options = {
                url: this.url + '/api/room/' + this.channelId + '/websocket',
                onOpen: function (event) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.info('websocket opened');
                                this.init = { name: JSON.stringify(__classPrivateFieldGet(this, _ChannelSocket_identity, "f").exportable_pubKey) };
                                return [4 /*yield*/, this.socket.send(JSON.stringify(this.init))];
                            case 1:
                                _a.sent();
                                if (typeof this.onOpen === 'function') {
                                    this.onOpen(event);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); },
                onMessage: function (event) { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                console.log("****** start: onMessage() *****");
                                console.log(event);
                                console.log("****** end: onMessage() *****");
                                if (!(event === null || event === void 0 ? void 0 : event.ready)) return [3 /*break*/, 1];
                                if (typeof this.onJoin === 'function') {
                                    this.onJoin(event);
                                    if (typeof this.onSystemInfo === 'function') {
                                        this.onSystemInfo(event);
                                    }
                                }
                                return [3 /*break*/, 4];
                            case 1:
                                if (!(event === null || event === void 0 ? void 0 : event.system)) return [3 /*break*/, 2];
                                if (typeof this.onSystemInfo === 'function') {
                                    this.onSystemInfo(event);
                                }
                                return [3 /*break*/, 4];
                            case 2:
                                if (!(typeof this.onMessage === 'function')) return [3 /*break*/, 4];
                                _a = this.onMessage;
                                return [4 /*yield*/, this.receive(event)];
                            case 3:
                                _a.apply(this, [_b.sent()]);
                                _b.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
                onClose: function (event) {
                    if (typeof _this.onClose === 'function') {
                        _this.onClose(event);
                    }
                },
                onError: function (event) {
                    if (typeof _this.onError === 'function') {
                        _this.onError(event);
                    }
                }
            };
            this.socket = new WS_Protocol(options);
        }
    });
    /**
     * ChannelSocket.close()
     */
    Object.defineProperty(ChannelSocket.prototype, "close", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            this.socket.close();
        }
    });
    /**
     * ChannelSocket.isReady()
     */
    Object.defineProperty(ChannelSocket.prototype, "isReady", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            console.info('SB Socket ready');
            this.ready = true;
            if (__classPrivateFieldGet(this, _ChannelSocket_queue, "f").length > 0) {
                __classPrivateFieldGet(this, _ChannelSocket_queue, "f").forEach(function (message) {
                    _this.send(message);
                });
            }
        }
    });
    /**
     * ChannelSocket.send()
     *
     * @param {SBMessage} the message object to send
     */
    Object.defineProperty(ChannelSocket.prototype, "send", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (message) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            });
        }
    });
    /**
     * ChannelSocket.sendSbObject()
     *
     * Send SB object (file) on channel socket
     */
    Object.defineProperty(ChannelSocket.prototype, "sendSbObject", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (file) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    if (this.ready) {
                        this..wrap(file, __classPrivateFieldGet(this, _ChannelSocket_channel, "f").keys.encryptionKey).then(function (payload) { return _this.socket.send(payload); });
                    }
                    else {
                        __classPrivateFieldGet(this, _ChannelSocket_queue, "f").push(file);
                    }
                    return [2 /*return*/];
                });
            });
        }
    });
    /**
     * ChannelSocket.receive()
     *
     * Receive message on channel socket
     * psm: updating using new cool types
     * (it will arrive mostly unwrapped)
     */
    Object.defineProperty(ChannelSocket.prototype, "receive", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (message) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // const id = Object.keys(message)[0];
                    if (message.encrypted_contents) {
                        throw new Error('add decryption');
                        // try {
                        //   unwrapped = await SB_Crypto.decrypt(this.#channel.keys.encryptionKey,
                        // 				      message[id].encrypted_contents, 'string');
                        // } catch (e) {
                        //   console.warn(e);
                        //   unwrapped = await SB_Crypto.decrypt(this.#channel.keys.locked_key,
                        // 				      message[id].encrypted_contents, 'string');
                        // }
                    }
                    else {
                        // unwrapped = jsonParseWrapper(unwrapped, 'L1702');
                        // psm: TODO, i don't know what messages are really supposed to look like in all cases
                        // unwrapped._id = id;
                        // _localStorage.setItem(this.#channel._id + '_lastSeenMessage', id.slice(this.#channel._id.length));
                        if (message._id)
                            _localStorage.setItem(__classPrivateFieldGet(this, _ChannelSocket_channel, "f")._id + '_lastSeenMessage', message._id);
                        // return JSON.stringify(unwrapped);
                        return [2 /*return*/, message];
                    }
                    return [2 /*return*/];
                });
            });
        }
    });
    return ChannelSocket;
}()); // end of class ChannelSocket
_ChannelSocket_url = new WeakMap(), _ChannelSocket_channel = new WeakMap(), _ChannelSocket_identity = new WeakMap(), _ChannelSocket_queue = new WeakMap(), _ChannelSocket_instances = new WeakSet(), _ChannelSocket_wrap = function _ChannelSocket_wrap(sbMessage) {
    contents.ready.then(function () {
        // TODO - in progress
        SB_Crypto.encrypt(str2ab(JSON.stringify(sbMessage.contents)), key, 'string').then(function (c) {
            var msg = { encrypted_contents: c };
        });
    });
    // return new Promise(async (resolve, reject) => {
    //   try {
    //     const msg = {encrypted_contents: await SB_Crypto.encrypt(str2ab(JSON.stringify(contents)), key, 'string')};
    //     resolve(JSON.stringify(msg));
    //   } catch (e) {
    //     console.error(e);
    //     reject(new Error('Unable to encrypt payload.'));
    //   }
    // });
};
/**
 * Storage API
 * @class
 * @constructor
 * @public
 */
var StorageApi = /** @class */ (function () {
    function StorageApi(server, channel, identity) {
        _StorageApi_instances.add(this);
        Object.defineProperty(this, "server", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _StorageApi_channel.set(this, void 0);
        _StorageApi_identity.set(this, void 0);
        this.server = server + '/api/v1';
        __classPrivateFieldSet(this, _StorageApi_channel, channel, "f");
        __classPrivateFieldSet(this, _StorageApi_identity, identity, "f");
    }
    /**
     * StorageApi.saveFile()
     */
    Object.defineProperty(StorageApi.prototype, "saveFile", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (file) {
            return __awaiter(this, void 0, void 0, function () {
                var sbFile_1, metaData, fullStorePromise, previewStorePromise;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(file instanceof File)) return [3 /*break*/, 2];
                            return [4 /*yield*/, new SBFile(file, __classPrivateFieldGet(this, _StorageApi_channel, "f").keys.personal_signKey, __classPrivateFieldGet(this, _StorageApi_identity, "f").exportable_pubKey)];
                        case 1:
                            sbFile_1 = _a.sent();
                            metaData = sbFile_1.imageMetaData;
                            fullStorePromise = this.storeImage(sbFile_1.data.fullImage, metaData.imageId, metaData.imageKey, 'f');
                            previewStorePromise = this.storeImage(sbFile_1.data.previewImage, metaData.previewId, metaData.previewKey, 'p');
                            Promise.all([fullStorePromise, previewStorePromise]).then(function (results) {
                                results.forEach(function (controlData) {
                                    __classPrivateFieldGet(_this, _StorageApi_channel, "f").socket.sendSbObject(__assign(__assign({}, controlData), { control: true }));
                                });
                                // psm: need to generalize classes ... sbFile and sbImage descent from sbMessage?
                                __classPrivateFieldGet(_this, _StorageApi_channel, "f").socket.sendSbObject(sbFile_1);
                            });
                            return [3 /*break*/, 3];
                        case 2: throw new Error('Must be an instance of File accepted');
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
    });
    /**
     * StorageApi().storeRequest
     */
    Object.defineProperty(StorageApi.prototype, "storeRequest", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (fileId) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(_this.server + '/storeRequest?name=' + fileId)
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.arrayBuffer();
                })
                    .then(function (data) {
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    /**
     * StorageApi().storeData()
     */
    Object.defineProperty(StorageApi.prototype, "storeData", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (type, fileId, encrypt_data, storageToken, data) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(_this.server + '/storeData?type=' + type + '&key=' + encodeURIComponent(fileId), {
                    // psm: need to clean up these types
                    method: 'POST', body: assemblePayload({
                        iv: encrypt_data.iv,
                        salt: encrypt_data.salt,
                        image: data.content,
                        storageToken: (new TextEncoder()).encode(storageToken),
                        vid: crypto.getRandomValues(new Uint8Array(48))
                    })
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then(function (data) {
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    /**
     * StorageApi().storeImage()
     */
    Object.defineProperty(StorageApi.prototype, "storeImage", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (image, image_id, keyData, type) {
            // latest and greatest JS version is in:
            // 384-snackabra-webclient/src/utils/ImageProcessor.js
            throw new Error('Storage() needs TS version');
        }
    });
    /**
     * StorageApi().fetchData()
     */
    Object.defineProperty(StorageApi.prototype, "fetchData", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (msgId, verificationToken) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(_this.server + '/fetchData?id=' + encodeURIComponent(msgId) + '&verification_token=' + verificationToken, {
                    method: 'GET'
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.arrayBuffer();
                })
                    .then(function (data) {
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    /**
     * StorageApi().retrieveData()
     * retrievses an object from storage
     */
    Object.defineProperty(StorageApi.prototype, "retrieveData", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (msgId, messages, controlMessages) {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var imageMetaData, image_id, control_msg, imageFetch, data, iv, salt, image_key, encrypted_image, padded_img, _b, img;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            console.log("... need to code up retrieveData() with new typing ..");
                            console.log(msgId);
                            console.log(messages);
                            console.log(controlMessages);
                            console.error("... need to code up retrieveData() with new typing ..");
                            imageMetaData = (_a = messages.find(function (msg) { return msg._id === msgId; })) === null || _a === void 0 ? void 0 : _a.imageMetaData;
                            image_id = imageMetaData.previewId;
                            control_msg = controlMessages.find(function (ctrl_msg) { return ctrl_msg.id && ctrl_msg.id == image_id; });
                            if (!control_msg) {
                                return [2 /*return*/, { 'error': 'Failed to fetch data - missing control message for that image' }];
                            }
                            return [4 /*yield*/, this.fetchData(control_msg.id, control_msg.verificationToken)];
                        case 1:
                            imageFetch = _c.sent();
                            data = extractPayload(imageFetch);
                            iv = data.iv;
                            salt = data.salt;
                            return [4 /*yield*/, __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_getFileKey).call(this, imageMetaData.previewKey, salt)];
                        case 2:
                            image_key = _c.sent();
                            encrypted_image = data.image;
                            _b = str2ab;
                            return [4 /*yield*/, SB_Crypto.decrypt(image_key, { content: encrypted_image, iv: iv }, 'arrayBuffer')];
                        case 3:
                            padded_img = _b.apply(void 0, [_c.sent()]);
                            img = __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_unpadData).call(this, padded_img);
                            // psm: issues should throw i think
                            // if (img.error) {
                            //   console.error('(Image error: ' + img.error + ')');
                            //   throw new Error('Failed to fetch data - authentication or formatting error');
                            // }
                            return [2 /*return*/, { 'url': 'data:image/jpeg;base64,' + arrayBufferToBase64(img) }];
                    }
                });
            });
        }
    });
    /**
     * StorageApi().retrieveDataFromMessage()
     */
    Object.defineProperty(StorageApi.prototype, "retrieveDataFromMessage", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (message, controlMessages) {
            return __awaiter(this, void 0, void 0, function () {
                var imageMetaData, image_id, control_msg, imageFetch, data, iv, salt, image_key, encrypted_image, padded_img, _a, img;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            imageMetaData = typeof message.imageMetaData === 'string' ? jsonParseWrapper(message.imageMetaData, 'L1893') : message.imageMetaData;
                            image_id = imageMetaData.previewId;
                            control_msg = controlMessages.find(function (ctrl_msg) { return ctrl_msg.id && ctrl_msg.id === image_id; });
                            if (!control_msg) {
                                return [2 /*return*/, { 'error': 'Failed to fetch data - missing control message for that image' }];
                            }
                            return [4 /*yield*/, this.fetchData(control_msg.id, control_msg.verificationToken)];
                        case 1:
                            imageFetch = _b.sent();
                            data = extractPayload(imageFetch);
                            iv = data.iv;
                            salt = data.salt;
                            return [4 /*yield*/, __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_getFileKey).call(this, imageMetaData.previewKey, salt)];
                        case 2:
                            image_key = _b.sent();
                            encrypted_image = data.image;
                            _a = str2ab;
                            return [4 /*yield*/, SB_Crypto.decrypt(image_key, {
                                    content: encrypted_image,
                                    iv: iv
                                }, 'arrayBuffer')];
                        case 3:
                            padded_img = _a.apply(void 0, [_b.sent()]);
                            img = __classPrivateFieldGet(this, _StorageApi_instances, "m", _StorageApi_unpadData).call(this, padded_img);
                            // if (img.error) {
                            //   console.error('(Image error: ' + img.error + ')');
                            //   throw new Error('Failed to fetch data - authentication or formatting error');
                            // }
                            return [2 /*return*/, { 'url': 'data:image/jpeg;base64,' + arrayBufferToBase64(img) }];
                    }
                });
            });
        }
    });
    return StorageApi;
}());
_StorageApi_channel = new WeakMap(), _StorageApi_identity = new WeakMap(), _StorageApi_instances = new WeakSet(), _StorageApi_getFileKey = function _StorageApi_getFileKey(fileHash, _salt) {
    return __awaiter(this, void 0, void 0, function () {
        var keyMaterial, key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, SB_Crypto.importKey('raw', base64ToArrayBuffer(decodeURIComponent(fileHash)), 'PBKDF2', false, ['deriveBits', 'deriveKey'])];
                case 1:
                    keyMaterial = _a.sent();
                    return [4 /*yield*/, crypto.subtle.deriveKey({
                            'name': 'PBKDF2',
                            'salt': _salt,
                            'iterations': 100000,
                            'hash': 'SHA-256'
                        }, keyMaterial, { 'name': 'AES-GCM', 'length': 256 }, true, ['encrypt', 'decrypt'])];
                case 2:
                    key = _a.sent();
                    // return key;
                    return [2 /*return*/, key];
            }
        });
    });
}, _StorageApi_unpadData = function _StorageApi_unpadData(data_buffer) {
    var _size = new Uint32Array(data_buffer.slice(-4))[0];
    return data_buffer.slice(0, _size);
};
/**
 * Channel API
 * @class
 * @constructor
 * @public
 */
var ChannelApi = /** @class */ (function () {
    function ChannelApi(sbServer, channel, identity) {
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
        this. = sbServer;
        this. = this.sbServer.SnackabraOptions.channel_server;
        __classPrivateFieldSet(this, _ChannelApi_channel, channel, "f");
        // this.#payload = new Payload()
        __classPrivateFieldSet(this, _ChannelApi_channelApi, this. + '/api/', "f");
        __classPrivateFieldSet(this, _ChannelApi_channelServer, this. + '/api/room/', "f");
        __classPrivateFieldSet(this, _ChannelApi_identity, identity, "f");
    }
    /**
     * getLastMessageTimes
     */
    Object.defineProperty(ChannelApi.prototype, "getLastMessageTimes", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelApi, "f") + '/getLastMessageTimes', {
                    method: 'POST', body: JSON.stringify([__classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id])
                }).then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                }).then(function (message_times) {
                    resolve(message_times[__classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id]);
                })["catch"](function (e) {
                    reject(e);
                });
            });
        }
    });
    /**
     * getOldMessages
     */
    Object.defineProperty(ChannelApi.prototype, "getOldMessages", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (currentMessagesLength) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/oldMessages?currentMessagesLength=' + currentMessagesLength, {
                    method: 'GET'
                }).then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                }).then(function (_encrypted_messages) {
                    resolve(_encrypted_messages);
                })["catch"](function (e) {
                    reject(e);
                });
            });
        }
    });
    /**
     * updateCapacity
     */
    Object.defineProperty(ChannelApi.prototype, "updateCapacity", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (capacity) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/updateRoomCapacity?capacity=' + capacity, {
                    method: 'GET', credentials: 'include'
                }).then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                }).then(function (data) {
                    resolve(data);
                })["catch"](function (e) {
                    reject(e);
                });
            });
        }
    });
    /**
     * getCapacity
     */
    Object.defineProperty(ChannelApi.prototype, "getCapacity", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/getRoomCapacity', {
                    method: 'GET', credentials: 'include'
                }).then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                }).then(function (data) {
                    resolve(data.capacity);
                })["catch"](function (e) {
                    reject(e);
                });
            });
        }
    });
    /**
     * getJoinRequests
     */
    Object.defineProperty(ChannelApi.prototype, "getJoinRequests", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/getJoinRequests', {
                    method: 'GET', credentials: 'include'
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then(function (data) {
                    if (data.error) {
                        reject(new Error(data.error));
                    }
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    /**
     * isLocked
     */
    Object.defineProperty(ChannelApi.prototype, "isLocked", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/roomLocked', {
                    method: 'GET', credentials: 'include'
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then(function (data) {
                    resolve(data.locked);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    /**
     * Set message of the day
     */
    Object.defineProperty(ChannelApi.prototype, "setMOTD", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (motd) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                //if (this.#channel.owner) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/motd', {
                    method: 'POST', body: JSON.stringify({ motd: motd }), headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then(function (data) {
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
                //} else {
                //  reject(new Error('Must be channel owner to get admin data'));
                //}
            });
        }
    });
    /**
     * getAdminData
     */
    Object.defineProperty(ChannelApi.prototype, "getAdminData", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var token_data, token_sign;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            token_data = new Date().getTime().toString();
                            return [4 /*yield*/, SB_Crypto.sign(__classPrivateFieldGet(this, _ChannelApi_channel, "f").keys.personal_signKey, token_data)];
                        case 1:
                            token_sign = _a.sent();
                            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/getAdminData', {
                                method: 'GET', credentials: 'include', headers: {
                                    'authorization': token_data + '.' + token_sign, 'Content-Type': 'application/json'
                                }
                            })
                                .then(function (response) {
                                if (!response.ok) {
                                    reject(new Error('Network response was not OK'));
                                }
                                return response.json();
                            })
                                .then(function (data) {
                                if (data.error) {
                                    reject(new Error(data.error));
                                }
                                resolve(data);
                            })["catch"](function (error) {
                                reject(error);
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    /**
     * downloadData
     */
    Object.defineProperty(ChannelApi.prototype, "downloadData", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/downloadData', {
                    method: 'GET', credentials: 'include', headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then(function (data) {
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    Object.defineProperty(ChannelApi.prototype, "uploadChannel", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (channelData) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/uploadRoom', {
                    method: 'POST', body: JSON.stringify(channelData), headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then(function (data) {
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    Object.defineProperty(ChannelApi.prototype, "authorize", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (ownerPublicKey, serverSecret) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/authorizeRoom', {
                    method: 'POST',
                    body: JSON.stringify({ roomId: __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id, SERVER_SECRET: serverSecret, ownerKey: ownerPublicKey })
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then(function (data) {
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    Object.defineProperty(ChannelApi.prototype, "postPubKey", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (_exportable_pubKey) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/postPubKey?type=guestKey', {
                    method: 'POST',
                    body: JSON.stringify(_exportable_pubKey),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then(function (data) {
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    Object.defineProperty(ChannelApi.prototype, "storageRequest", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (byteLength) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/storageRequest?size=' + byteLength, {
                    method: 'GET', credentials: 'include', headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then(function (data) {
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    Object.defineProperty(ChannelApi.prototype, "lock", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var _locked_key, _exportable_locked_key_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(__classPrivateFieldGet(this, _ChannelApi_channel, "f").keys.locked_key == null && __classPrivateFieldGet(this, _ChannelApi_channel, "f").admin)) return [3 /*break*/, 3];
                            return [4 /*yield*/, crypto.subtle.generateKey({
                                    name: 'AES-GCM', length: 256
                                }, true, ['encrypt', 'decrypt'])];
                        case 1:
                            _locked_key = _a.sent();
                            return [4 /*yield*/, crypto.subtle.exportKey('jwk', _locked_key)];
                        case 2:
                            _exportable_locked_key_1 = _a.sent();
                            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/lockRoom', {
                                method: 'GET', credentials: 'include'
                            })
                                .then(function (response) {
                                if (!response.ok) {
                                    reject(new Error('Network response was not OK'));
                                }
                                return response.json();
                            })
                                .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!data.locked) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.acceptVisitor(JSON.stringify(__classPrivateFieldGet(this, _ChannelApi_identity, "f").exportable_pubKey))];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2:
                                            resolve({ locked: data.locked, lockedKey: _exportable_locked_key_1 });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })["catch"](function (error) {
                                reject(error);
                            });
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    Object.defineProperty(ChannelApi.prototype, "acceptVisitor", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (pubKey) {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var shared_key, _a, _b, _c, _encrypted_locked_key;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _b = (_a = SB_Crypto).deriveKey;
                            return [4 /*yield*/, __classPrivateFieldGet(this, _ChannelApi_identity, "f").privateKey];
                        case 1:
                            _c = [_d.sent()];
                            return [4 /*yield*/, SB_Crypto.importKey('jwk', jsonParseWrapper(pubKey, 'L2276'), 'ECDH', false, [])];
                        case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), 'AES', false, ['encrypt', 'decrypt']]))];
                        case 3:
                            shared_key = _d.sent();
                            return [4 /*yield*/, SB_Crypto.encrypt(str2ab(JSON.stringify(__classPrivateFieldGet(this, _ChannelApi_channel, "f").keys.exportable_locked_key)), shared_key, 'string')];
                        case 4:
                            _encrypted_locked_key = _d.sent();
                            fetch(__classPrivateFieldGet(this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(this, _ChannelApi_channel, "f")._id + '/acceptVisitor', {
                                method: 'POST',
                                body: JSON.stringify({ pubKey: pubKey, lockedKey: JSON.stringify(_encrypted_locked_key) }),
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'include'
                            })
                                .then(function (response) {
                                if (!response.ok) {
                                    reject(new Error('Network response was not OK'));
                                }
                                return response.json();
                            })
                                .then(function (data) {
                                resolve(data);
                            })["catch"](function (error) {
                                reject(error);
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
        }
    });
    Object.defineProperty(ChannelApi.prototype, "ownerKeyRotation", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(__classPrivateFieldGet(_this, _ChannelApi_channelServer, "f") + __classPrivateFieldGet(_this, _ChannelApi_channel, "f")._id + '/ownerKeyRotation', {
                    method: 'GET', credentials: 'include', headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(function (response) {
                    if (!response.ok) {
                        reject(new Error('Network response was not OK'));
                    }
                    return response.json();
                })
                    .then(function (data) {
                    resolve(data);
                })["catch"](function (error) {
                    reject(error);
                });
            });
        }
    });
    return ChannelApi;
}());
_ChannelApi_identity = new WeakMap(), _ChannelApi_channel = new WeakMap(), _ChannelApi_channelApi = new WeakMap(), _ChannelApi_channelServer = new WeakMap(), _ChannelApi_payload = new WeakMap();
/**
 * Augments IndexedDB to be used as a KV to easily
 * replace _localStorage for larger and more complex datasets
 *
 * @class
 * @constructor
 * @public
 */
var IndexedKV = /** @class */ (function () {
    // psm: override doesn't seem to be used
    function IndexedKV( /* options: IndexedKVOptions */) {
        var _this = this;
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
                db: 'MyDB', table: 'default', onReady: function () {
                    return;
                }
            }
        });
        // psm: hm?
        this.options = Object.assign(this.options, this.options);
        if (typeof this.options.onReady === 'function') {
            this.events.subscribe("ready", function (e) {
                _this.options.onReady(e);
            });
        }
        // if (!process.browser) {
        //   this.indexedDB = global.indexedDB;
        // } else {
        // }
        var openReq = indexedDB.open(this.options.db);
        openReq.onerror = function (event) {
            console.error(event);
        };
        openReq.onsuccess = function (event) {
            _this.db = event.target.result;
            _this.events.publish('ready');
        };
        openReq.onerror = function (event) {
            console.error('Database error: ' + event.target.errorCode);
        };
        openReq.onupgradeneeded = function (event) {
            _this.db = event.target.result;
            _this.db.createObjectStore(_this.options.table, { keyPath: 'key' });
            __classPrivateFieldGet(_this, _IndexedKV_instances, "m", _IndexedKV_useDatabase).call(_this);
            _this.events.publish('ready');
        };
    }
    Object.defineProperty(IndexedKV.prototype, "openCursor", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (match, callback) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var objectStore = _this.db.transaction([_this.options.table], 'readonly').objectStore(_this.options.table);
                var request = objectStore.openCursor(null, 'next');
                request.onsuccess = function (event) {
                    resolve(event.target.result);
                    var cursor = event.target.result;
                    if (cursor) {
                        var regex = new RegExp("^".concat(match));
                        if (cursor.key.match(regex)) {
                            callback(cursor.value.value);
                        }
                        cursor["continue"]();
                    }
                    else {
                        resolve(true);
                    }
                };
                request.onerror = function (event) {
                    reject(event);
                };
            });
        }
    });
    // Set item will insert or replace
    Object.defineProperty(IndexedKV.prototype, "setItem", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (key, value) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var objectStore = _this.db.transaction([_this.options.table], 'readwrite').objectStore(_this.options.table);
                var request = objectStore.get(key);
                request.onerror = function (event) {
                    reject(event);
                };
                request.onsuccess = function (event) {
                    var _a;
                    var data = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.result;
                    if (data === null || data === void 0 ? void 0 : data.value) {
                        data.value = value;
                        var requestUpdate = objectStore.put(data);
                        requestUpdate.onerror = function (event) {
                            reject(event);
                        };
                        requestUpdate.onsuccess = function (event) {
                            var data = event.target.result;
                            resolve(data.value);
                        };
                    }
                    else {
                        var requestAdd = objectStore.add({ key: key, value: value });
                        requestAdd.onsuccess = function (event) {
                            resolve(event.target.result);
                        };
                        requestAdd.onerror = function (event) {
                            reject(event);
                        };
                    }
                };
            });
        }
    });
    //Add item but not replace
    Object.defineProperty(IndexedKV.prototype, "add", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (key, value) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var objectStore = _this.db.transaction([_this.options.table], 'readwrite').objectStore(_this.options.table);
                var request = objectStore.get(key);
                request.onerror = function (event) {
                    reject(event);
                };
                request.onsuccess = function (event) {
                    var _a;
                    var data = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.result;
                    if (data === null || data === void 0 ? void 0 : data.value) {
                        resolve(data.value);
                    }
                    else {
                        var requestAdd = objectStore.add({ key: key, value: value });
                        requestAdd.onsuccess = function (event) {
                            resolve(event.target.result);
                        };
                        requestAdd.onerror = function (event) {
                            reject(event);
                        };
                    }
                };
            });
        }
    });
    Object.defineProperty(IndexedKV.prototype, "getItem", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (key) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var objectStore = _this.db.transaction([_this.options.table]).objectStore(_this.options.table);
                var request = objectStore.get(key);
                request.onerror = function (event) {
                    reject(event);
                };
                request.onsuccess = function (event) {
                    var _a;
                    var data = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.result;
                    if (data === null || data === void 0 ? void 0 : data.value) {
                        resolve(data.value);
                    }
                    else {
                        resolve(null);
                    }
                };
            });
        }
    });
    Object.defineProperty(IndexedKV.prototype, "removeItem", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (key) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var request = _this.db.transaction([_this.options.table], 'readwrite')
                    .objectStore(_this.options.table)["delete"](key);
                request.onsuccess = function () {
                    resolve(true);
                };
                request.onerror = function (event) {
                    reject(event);
                };
            });
        }
    });
    return IndexedKV;
}());
_IndexedKV_instances = new WeakSet(), _IndexedKV_useDatabase = function _IndexedKV_useDatabase() {
    var _this = this;
    this.db.onversionchange = function () {
        _this.db.close();
        console.info('A new version of this page is ready. Please reload or close this tab!');
    };
};
var _localStorage = new IndexedKV();
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
var Snackabra = /** @class */ (function () {
    /**
     * Constructor expects an object with the names of the matching servers, for example
     * (this shows the miniflare local dev config):
     *
     * @param {SnackabraOptions} the servers to talk to, look like this:
     *
     * ::
     *
     *     {
     *       channel_server: 'http://127.0.0.1:4001',
     *       channel_ws: 'ws://127.0.0.1:4001',
     *       storage_server: 'http://127.0.0.1:4000'
     *     }
     *
     */
    function Snackabra(args) {
        _Snackabra_listOfChannels.set(this, []);
        Object.defineProperty(this, "storageApi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // #storage = new StorageApi();
        // #identity = new Identity();
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
        this.storageApi = new StorageApi();
        _sb_assert(args, 'Snackabra(args) - missing args');
        try {
            this.options = {
                channel_server: args.channel_server,
                channel_ws: args.channel_ws,
                storage_server: args.storage_server
            };
        }
        catch (e) {
            _sb_exception('Snackabra.constructor()', "".concat(e));
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
    Object.defineProperty(Snackabra.prototype, "connect", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (channel_id, identity) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-this-alias
                    // psm: changing to make this on a per-message basis
                    // if (!_self.#identity.exportable_pubKey) {
                    //   reject(new Error('setIdentity() must be called before connecting'));
                    // }
                    var c = new Channel(_this, channel_id, identity);
                    __classPrivateFieldGet(_this, _Snackabra_listOfChannels, "f").push(c);
                    _this.
                    ;
                    // const c = new Channel(this.options.channel_server, _self.options.channel_ws, _self.#identity);
                    // c.join(channel_id).then((_c: Channel) => {
                    //   _self.#storage = new StorageApi();
                    //   _c.storage = _self.#storage
                    //   _self.#channel = _c;
                    //   _self.#storage.init(_self.options.storage_server, _self.#channel, _self.#identity)
                    //   // resolve(_self);
                    //   resolve(_self.#channel);
                }
                finally { }
            });
        }
    });
    Object.defineProperty(Snackabra.prototype, "catch", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (e) {
            reject(e);
        }
    });
    return Snackabra;
}());
_Snackabra_listOfChannels = new WeakMap();
;
/**
 * Creates a channel. Currently uses trivial authentication.
 * Returns the :term:`Channel Name`.
 * (TODO: token-based approval of storage spend)
 */
create(serverSecret, string);
{
    return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
        var ownerKeyPair, exportable_privateKey, exportable_pubKey, channelId, encryptionKey, exportable_encryptionKey, signKeyPair, exportable_signKey, channelData, data, resp, e_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 14, , 15]);
                    return [4 /*yield*/, crypto.subtle.generateKey({
                            name: 'ECDH',
                            namedCurve: 'P-384'
                        }, true, ['deriveKey'])];
                case 1:
                    ownerKeyPair = _a.sent();
                    return [4 /*yield*/, crypto.subtle.exportKey('jwk', ownerKeyPair.privateKey)];
                case 2:
                    exportable_privateKey = _a.sent();
                    return [4 /*yield*/, crypto.subtle.exportKey('jwk', ownerKeyPair.publicKey)];
                case 3:
                    exportable_pubKey = _a.sent();
                    return [4 /*yield*/, this..call(this, exportable_pubKey.x, exportable_pubKey.y)];
                case 4:
                    channelId = _a.sent();
                    return [4 /*yield*/, crypto.subtle.generateKey({
                            name: 'AES-GCM',
                            length: 256
                        }, true, ['encrypt', 'decrypt'])];
                case 5:
                    encryptionKey = _a.sent();
                    return [4 /*yield*/, crypto.subtle.exportKey('jwk', encryptionKey)];
                case 6:
                    exportable_encryptionKey = _a.sent();
                    return [4 /*yield*/, crypto.subtle.generateKey({
                            name: 'ECDH', namedCurve: 'P-384'
                        }, true, ['deriveKey'])];
                case 7:
                    signKeyPair = _a.sent();
                    return [4 /*yield*/, crypto.subtle.exportKey('jwk', signKeyPair.privateKey)];
                case 8:
                    exportable_signKey = _a.sent();
                    channelData = {
                        roomId: channelId,
                        ownerKey: JSON.stringify(exportable_pubKey),
                        encryptionKey: JSON.stringify(exportable_encryptionKey),
                        signKey: JSON.stringify(exportable_signKey),
                        SERVER_SECRET: serverSecret
                    };
                    data = new TextEncoder().encode(JSON.stringify(channelData));
                    return [4 /*yield*/, fetch(this.options.channel_server + '/api/room/' + channelId + '/uploadRoom', {
                            method: 'POST',
                            body: data
                        })];
                case 9:
                    resp = _a.sent();
                    return [4 /*yield*/, resp.json()];
                case 10:
                    resp = _a.sent();
                    if (!resp.success) return [3 /*break*/, 12];
                    return [4 /*yield*/, this.connect(channelId)];
                case 11:
                    _a.sent();
                    _localStorage.setItem(channelId, JSON.stringify(exportable_privateKey));
                    resolve(channelId);
                    return [3 /*break*/, 13];
                case 12:
                    reject(new Error(JSON.stringify(resp)));
                    _a.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    e_10 = _a.sent();
                    reject(e_10);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    }); });
}
(x, string, y, string);
Promise < string > {
    "return": new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
        var xBytes, yBytes, channelBytes, channelBytesHash, e_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    xBytes = base64ToArrayBuffer(decodeB64Url(x));
                    yBytes = base64ToArrayBuffer(decodeB64Url(y));
                    channelBytes = _appendBuffer(xBytes, yBytes);
                    return [4 /*yield*/, crypto.subtle.digest('SHA-384', channelBytes)];
                case 1:
                    channelBytesHash = _a.sent();
                    resolve(encodeB64Url(arrayBufferToBase64(channelBytesHash)));
                    return [3 /*break*/, 3];
                case 2:
                    e_11 = _a.sent();
                    reject(e_11);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); })
};
get;
channel();
{
    return this.;
}
get;
storage();
{
    return this.;
}
get;
crypto();
{
    return SB_Crypto;
}
get;
identity();
{
    return this.;
}
sendMessage(message, SBMessage);
{
    this.channel.socket.send(message);
}
sendFile(file, File);
{
    this.storage.saveFile(file);
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
export { Channel, Snackabra, SBMessage, SBFile, };
//# sourceMappingURL=snackabra.js.map