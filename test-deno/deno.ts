/* Copyright (c) 2020-2022 Magnusson Institute, All Rights Reserved */
/* Distributed under GPL-v03, see 'LICENSE' file for details */

import { assert, assertEquals, assertThrows } from "https://deno.land/std@0.156.0/testing/asserts.ts"
import { indexedDB } from 'https://deno.land/x/indexeddb@v1.1.0/ponyfill.ts';
import 'https://deno.land/x/indexeddb@1.3.4/polyfill.ts?doc';
import * as canvas from "https://deno.land/x/canvas@v1.2.2/mod.ts";
import { describe, beforeAll } from "https://deno.land/std@0.157.0/testing/bdd.ts";
//import { User } from "https://deno.land/std@0.157.0/testing/


import {
  ab2str,
  str2ab,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  _appendBuffer,
  _sb_exception,
  getRandomValues,
  SB_libraryVersion,
  MessageBus,
  _sb_resolve,
  _sb_assert,
  importPublicKey,
  simpleRand256,
  simpleRandomString,
  cleanBase32mi,
  // and starting to test this little guy!
  Snackabra
} from './main.ts'

/* ================ */

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

/* ================ */

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

/* ================ */


// const sb_config = {
//   channel_server: 'http://r.somethingstuff.workers.dev',
//   channel_ws: 'ws://r.somethingstuff.workers.dev',
//   storage_server: 'http://s.somethingstuff.workers.dev'
// };
// const channel_id = 'Qs784CLbB8RF6O3sCOJQfUccRMOhcTBJFzkD--l7Ec10gMlMoiqLg8CrYCYDKXjL';

const sb_config = {
  channel_server: 'http://127.0.0.1:4001',
  channel_ws: 'ws://127.0.0.1:4001',
  storage_server: 'http://127.0.0.1:4000'
};

var channel_id_resolve: (arg0: string) => void
var channel_id = new Promise((resolve) => { channel_id_resolve = resolve; }): string

const key = {
  key_ops: ['deriveKey'],
  ext: true,
  kty: 'EC',
  x: '62RGlvpBrkrBTgscORtV5MmJqSS0N6aIELTLY1VdOEhrToUbnNPi2XbFucGhWey9',
  y: '24kcejeniQMNGuYigc39fcsjzP6P9VqEYWieT6WYgSBlVsCR_DXTjlPRAQ4P8x1K',
  crv: 'P-384',
  d: '9sYVDOfUJ8YofRh4y_4dItXcXzTiiwYKI6pXU9thJyfMqMtaFhvUbCsHl14Wx37k'
};

describe('Snackabra Class --> identity', () => {
  let SB: Snackabra
  beforeAll(() => {
    SB = new Snackabra(sb_config);
    SB.setIdentity(key).then(async () => {
      SB.create('password').then((c: string) => {
        channel_id.then((channel_id) => {
          channel_id_resolve(c);
          console.log("Set up baseline channel: ", c);
          return SB;
        });
      });
    });
  });

  // test('Connect before configure', async () => {
  //   expect(() => {
  //     SB.connect(channel_id);
  //   }).toThrow('setIdentity must be called before connecting');
  // });

  Deno.test('Connect after creating an identity', async () => {
    await SB.setIdentity(key);
    await channel_id;
    await SB.connect(await channel_id);
  });

  Deno.test('Connect after configuring an identity', async () => {
    await SB.setIdentity(key);
    await channel_id;
    await SB.connect(channel_id);
  });

});

/* psm: added this stuff here, testing fetching messages */
describe('Snackabra Class --> get messages', () => {
  let SB;
  beforeAll(async () => {
    const w = new Promise(async (resolve, reject) => {
      try {
        SB = await new Snackabra(sb_config);
        await SB.setIdentity(key);
        SB.connect(await channel_id);
        resolve(SB);
      } catch (e) {
        reject(e);
      }
    });
    await w;
  });

  Deno.test('Fetch messages', async () => {
    // console.log('... testing fetch messages ...');
    // console.log(SB.channel.keys);
    // console.log(JSON.stringify(SB.channel.api));
    // let z = await SB.channel.api.getOldMessages(10);
    // console.log('Fetching old messages:');
    // console.log(z);
    // done();
  });

});


// describe('Snackabra Class > ChannelAPI', () => {
//   let SB;
//   beforeAll(async () => {
//     SB = new Snackabra(sb_config);
//     await SB.setIdentity(key);
//     await SB.connect(channel_id);
//     SB.onMessage = (event) => {
//       console.log(event);
//     };
//     return SB;
//   });

//   test('Create', async () => {
//     const channel = await SB.channel.api.create('password');
//     //console.log(channel)
//     //SB.connect(sb_config, channel);
//     expect(typeof channel).toBe('string');
//   });

//   test('getLastMessageTimes', async () => {
//     const res = await SB.channel.api.getLastMessageTimes();
//     expect(typeof res).toBe('string');
//   });

//   test('getOldMessages', async () => {
//     const res = await SB.channel.api.getOldMessages(10);
//     expect(typeof res).toBe('object');
//   });

//   test('updateCapacity', async () => {
//     const res = await SB.channel.api.updateCapacity(21);
//     expect(res.capacity).toBe('21');
//   });

//   test('getCapacity', async () => {
//     const capacity = await SB.channel.api.getCapacity();
//     expect(capacity).toBe('21');
//   });

//   test('getJoinRequests', async () => {
//     const joins = await SB.channel.api.getJoinRequests();
//     expect(joins.join_requests).toStrictEqual([]);
//   });

//   test('isLocked', async () => {
//     const locked = await SB.channel.api.isLocked();
//     expect(locked).toStrictEqual(false);
//   });

//   test('setMOTD', async () => {
//     const motd = await SB.channel.api.setMOTD('WOOOOOOT');
//     console.log(motd);
//     expect(motd).toStrictEqual({'motd': 'WOOOOOOT'});
//   });

//   test('getAdminData', async () => {
//     const adminData = await SB.channel.api.getAdminData();
//     console.log(adminData);
//     expect(adminData).toStrictEqual({'motd': 'WOOOOOOT'});
//   });
// });

