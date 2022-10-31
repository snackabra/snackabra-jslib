/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */

/* Distributed under GPL-v03, see 'LICENSE' file for details */

/* PART 1 of rewrite of "main.js" */

import { assertEquals, assertThrows } from "https://deno.land/std@0.156.0/testing/asserts.ts"

import {
  ab2str,
  str2ab,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  _appendBuffer,
  _sb_exception,
  getRandomValues,
  SB_libraryVersion
//  Snackabra
} from './main.01.ts'

Deno.test('string returns to same result', () => {
  const s = '0123456789abcdefghijklmnop'
  // console.log('1:', s)
  // console.log('2:', str2ab(s))
  // console.log('3:', arrayBufferToBase64(str2ab(s)))
  // console.log('4:', base64ToArrayBuffer(arrayBufferToBase64(str2ab(s))))
  // console.log('5:', ab2str(base64ToArrayBuffer(arrayBufferToBase64(str2ab(s)))))
  assertEquals(ab2str(base64ToArrayBuffer(arrayBufferToBase64(str2ab(s)))), s)
})

Deno.test('ten random buffers of random length', () => {
  for (var i = 0; i < 10; i++) {
    let array = new Uint8Array(Math.floor(Math.random() * 400) + 1)
    getRandomValues(array)
    // console.log(array)
    // console.log(arrayBufferToBase64(array))
    // console.log(base64ToArrayBuffer(arrayBufferToBase64(array)))
    assertEquals(base64ToArrayBuffer(arrayBufferToBase64(array)), array)
  }
})

Deno.test('test invalid chars - should throw', () => {
  assertThrows(() => {
    base64ToArrayBuffer(';;;;;')
  }, Error, 'invalid character',)
})

Deno.test('check version - should throw', () => {
  assertThrows(() => {
    let z = SB_libraryVersion()
  }, Error, 'THIS IS NEITHER BROWSER NOR NODE THIS IS SPARTA!',)
})

Deno.test('test sb exception', () => {
  assertThrows(() => {
    _sb_exception('L47', 'sb exception')
  }, Error, '<< SB lib error (L47: sb exception) >>')
})

// a handful of semi-challenging strings
const z = [
  'abcdef123456',
  'ABC*#&@^)!_=`|\\',
  '',
  '        ',
  '=============',
  '\0',
  '\0\0\0\0\0\0'
]

Deno.test('some string <-> binary conversions', () => {
  for (const s0 in z) {
    let s1 = str2ab(s0)
    let s2 = ab2str(s1)
    assertEquals(s0, s2)
  }
})

// removing this test, it's not really well-defined: a random
// binary string cannot be converted to utf-8 and straight back
//
// Deno.test('ten random binary strings of random length', () => {
//   for (var i = 0; i < 10; i++) {
//     let random_length = new Uint8Array(4);
//     getRandomValues(random_length);
//     let array = new Uint8Array(random_length[0]);
//     console.log("Length should be:", random_length[0])
//     getRandomValues(array);
//     console.log(array.length, array)
//     let s1 = ab2str(array);
//     console.log(s1.length, s1)
//     let s2 = str2ab(s1);
//     console.log(s2.length, s2)
//     assertEquals(s2, array);
//   }
// });

// (i think (?) that all uses of back and forth in format
// in SB always starts with a string)
function _randomString(length: number) {
  var r = ''
  var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()!@#$%^&*-_=+[]{}~;:\'"<>,./?'
  var l = c.length
  for (var i = 0; i < length; i++) {
    r += c.charAt(Math.floor(Math.random() * l))
  }
  return r
}

Deno.test('ten random binary strings of random length', () => {
  for (var i = 0; i < 10; i++) {
    let len = Math.floor(Math.random() * 200) + 1
    let str = _randomString(len)
    let s1 = str2ab(str)
    let s2 = ab2str(s1)
    assertEquals(s2, str)
  }
})

Deno.test('one very large string', () => {
  let str = _randomString(50000)
  let s1 = str2ab(str)
  let s2 = arrayBufferToBase64(s1)
  let s3 = base64ToArrayBuffer(s2)
  let s4 = ab2str(s3)
  assertEquals(s4, str)
})

Deno.test('some yucky strings', () => {
  for (const s0 in z) {
    let s1 = str2ab(s0)
    let s2 = arrayBufferToBase64(s1)
    let s3 = base64ToArrayBuffer(s2)
    let s4 = ab2str(s3)
    assertEquals(s0, s4)
  }
})

Deno.test('some simple append tests', () => {
  let b1 = new Uint8Array(477)
  getRandomValues(b1)
  let b2 = new Uint8Array(1477)
  getRandomValues(b2)
  let b3 = new Uint8Array(3477)
  getRandomValues(b1)
  let bA = _appendBuffer(b1, new Uint8Array(_appendBuffer(b2, b3)))
  let bB = _appendBuffer(new Uint8Array(_appendBuffer(b1, b2)), b3)
  assertEquals(bA, bB)
})

