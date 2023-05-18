/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */

/* Distributed under GPL-v03, see 'LICENSE' file for details */

/* PART 2 of rewrite of "main.js" */

import { assert, assertEquals, assertThrows } from "https://deno.land/std@0.156.0/testing/asserts.ts"

import {
  MessageBus,
  _sb_resolve,
  _sb_assert,
  importPublicKey,
  simpleRand256,
  simpleRandomString,
  cleanBase32mi
} from './main.02.ts'

Deno.test('some simple message bus tests', () => {
  let mb = new MessageBus()
  let i = 0
  function inc77() {
    i += 77
  }
  mb.subscribe('*', (() => { i += 5 }))
  mb.subscribe('hello', (() => { i += 77 }))
  mb.subscribe('hello', inc77)
  mb.publish('hello')
  mb.publish('goodbye')
  mb.unsubscribe('hello', inc77)
  mb.publish('hello')
  mb.unsubscribe('hello', inc77)
  mb.unsubscribe('foo', inc77)
  mb.publish('hello')
  assertEquals(i, 77 * 4 + (5 * 4))
})

Deno.test('should test our assertions', () => {
  assertThrows(() => {
    _sb_assert(false, 'assertion test');
  }, Error, '<< SB assertion error: assertion test >>',)
})

Deno.test('should test our resolve (haha)', async () => {
  async function f(): Promise<number> {
    return 4;
  }
  let p0 = await _sb_resolve(1)
  let p1 = await _sb_resolve(f())
  assertEquals(p0+p1, 5)
})
  
Deno.test('import a key', async () => {
  let pk = await importPublicKey()
  // TODO: use this with packageEncryptDict
  // we wil also need decrypt (which only exists in python right now)
  assert(true)
})

Deno.test('import a broken key', () => {
  assertThrows(() => {
    console.log(importPublicKey('MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCg'));
  }, Error, 'fail to find BEGIN and/or END string in RSA (PEM) key')
})

Deno.test('generate a random number', () => {
  let x: number = simpleRand256()
  assert(x < 256);
})

Deno.test('generate a random string', () => {
  let x: string = simpleRandomString(10, 'base32mi')
  // this doesn't do anything really:
  let y: string = cleanBase32mi(x)
  assertEquals(x, y)
})

Deno.test('generate unsupported random string', () => {
  assertThrows(() => {
    let x: string = simpleRandomString(10, 'base99')
  }, Error, '<< SB lib error (simpleRandomString: code base99 not supported) >>',)
})

