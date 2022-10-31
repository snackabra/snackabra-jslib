/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */

/* Distributed under GPL-v03, see 'LICENSE' file for details */

/* PART 2 of rewrite of "main.js" */

// @ts-ignore
import { base64ToArrayBuffer, _sb_exception, getRandomValues } from './main.01.ts'

interface Dictionary {
  [index: string]: any;
}

/**
 * SB simple events (mesage bus) class
 */
export class MessageBus {
  bus: Dictionary = {}
  constructor() {
  }

  /**
   * Safely returns handler for any event
   */
  #select(event:string) {
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
  unsubscribe(event:string, handler: Function) {
    let i = -1;
    if (this.bus[event]) {
      if ((i = this.bus[event].findLastIndex((e:any) => e == handler)) != -1) {
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
  publish(event:string, ...args: any[]) {
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
export function _sb_assert(val:any, msg:string) {
  if (!(val)) {
    const m = `<< SB assertion error: ${msg} >>`;
    throw new Error(m);
  }
}

// the publicKeyPEM paramater below needs to look like this
// if not given, will use this default (MI/384 has private key)
export const defaultPublicKeyPEM = `-----BEGIN PUBLIC KEY-----
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
export function importPublicKey(pem?:string) {
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


