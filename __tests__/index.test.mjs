// Copyright (c) 2022 Magnusson Institute, All Rights Reserved.

// test node version of library
// run tests with 'npm test'
// coverage status:
// 2022-02-28: 100%

// nota bene ... pretty basic testing, not very sophisticated yet

import {SB_libraryVersion, ab2str, str2ab, base64ToArrayBuffer, arrayBufferToBase64, getRandomValues} from './index.mjs';

test('hello world (check loading)', () => {
  expect(SB_libraryVersion()).toEqual('This is the NODE.JS version of the library');
});

test('string returns to same result', () => {
  const s = "0123456789abcdefghijklmnop";
  expect(ab2str(base64ToArrayBuffer(arrayBufferToBase64(str2ab(s))))).toEqual(s);
});

test('ten random buffers of random length', () => {
  for (var i = 0; i < 10; i++) {
    let random_length = new Uint8Array(4);
    getRandomValues(random_length);
    let array = new Uint8Array(random_length[0]);
    getRandomValues(array);
    // console.log(array);
    // console.log(arrayBufferToBase64(array));
    // console.log(base64ToArrayBuffer(arrayBufferToBase64(array)));
    expect(base64ToArrayBuffer(arrayBufferToBase64(array))).toEqual(array);
  }
});

test("test invalid chars - should throw", () => {
  expect(() => {base64ToArrayBuffer(';;;;;')}).toThrow('Invalid Character');
});

test("some string conversions", () => {
  expect(() => {base64ToArrayBuffer(';;;;;')}).toThrow('Invalid Character');
});

// a handful of semi-challenging strings
const z = [
  'abcdef123456',
  'ABC*#&@^)!_=`|\\',
  '',
  '        ',
  '=============',
  '\0',
  '\0\0\0\0\0\0'
];

test("some string <-> binary conversions", () => {
  for (const s0 of z) {
    let s1 = str2ab(s0);
    let s2 = ab2str(s1);
    expect(s0).toEqual(s2);    
  }
});

test('ten random binary strings of random length', () => {
  for (var i = 0; i < 10; i++) {
    let random_length = new Uint8Array(4);
    getRandomValues(random_length);
    let array = new Uint8Array(random_length[0]);
    getRandomValues(array);
    let s1 = ab2str(array);
    let s2 = str2ab(s1)
    expect(s2).toEqual(array);
  }
});


test("some yucky strings", () => {
  for (const e of z) {
    let s0 = e;
    let s1 = str2ab(s0);
    let s2 = arrayBufferToBase64(s1);
    let s3 = base64ToArrayBuffer(s2);
    let s4 = ab2str(s3);
    if (s0 !== s4) {
      console.log('Failed conversion of string, details:');
      console.log(` s0: ${s0}\n s1: ${s1}\n s2: ${s2}\n s3: ${s3}\n s4: ${s4}\n`);
    }
    expect(s0).toEqual(s4);
  }
});

test("our exception handler", () => {
  expect(() => {ab2str('foo')}).toThrow('<< SB lib error (ab2str(): parameter is not a Uint8Array buffer) >>');
});

