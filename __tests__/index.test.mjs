// Copyright (c) 2022 Magnusson Institute, All Rights Reserved.

// test node version of library
// run tests with 'npm test'
// coverage status:
// 2022-02-28: 100%

// nota bene ... pretty basic testing, not very sophisticated yet
import fetch from 'node-fetch';

// Shouldn't have to do with --experimental-fetch flag but it isn't working?
global.fetch = fetch;

import {
  SB_libraryVersion,
  ab2str,
  str2ab,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  getRandomValues,
  Snackabra
} from './index.mjs';

describe('Top level functions', () => {
  test('hello world (check loading)', () => {
    expect(SB_libraryVersion()).toEqual('This is the NODE.JS version of the library');
  });

  test('string returns to same result', () => {
    const s = '0123456789abcdefghijklmnop';
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

  test('test invalid chars - should throw', () => {
    expect(() => {
      base64ToArrayBuffer(';;;;;');
    }).toThrow('Invalid Character');
  });

  test('some string conversions', () => {
    expect(() => {
      base64ToArrayBuffer(';;;;;');
    }).toThrow('Invalid Character');
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

  test('some string <-> binary conversions', () => {
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
      let s2 = str2ab(s1);
      expect(s2).toEqual(array);
    }
  });

  test('some yucky strings', () => {
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

  test('our exception handler', () => {
    expect(() => {
      ab2str('foo');
    }).toThrow('<< SB lib error (ab2str(): parameter is not a Uint8Array buffer) >>');
  });

});

const sb_config = {
  channel_server: 'http://r.somethingstuff.workers.dev',
  channel_ws: 'ws://r.somethingstuff.workers.dev',
  storage_server: 'http://s.somethingstuff.workers.dev'
};

const channel_id = 'Qs784CLbB8RF6O3sCOJQfUccRMOhcTBJFzkD--l7Ec10gMlMoiqLg8CrYCYDKXjL';

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
  let SB;
  beforeAll(() => {
    SB = new Snackabra();
    return SB;
  });

  test('Connect before configure', async () => {
    expect(() => {
      SB.connect(sb_config, channel_id);
    }).toThrow('setIdentity must be called before connecting');
  });

  test('Connect after creating an identity', async () => {
    await SB.setIdentity();
    expect(() => {
      SB.connect(sb_config, channel_id);
    }).not.toThrow('setIdentity must be called before connecting');
  });

  test('Connect after configuring an identity', async () => {
    await SB.setIdentity(key);
    expect(() => {
      SB.connect(sb_config, channel_id);
    }).not.toThrow('setIdentity must be called before connecting');
  });

});

/* psm: added this stuff here, testing fetching messages */
describe('Snackabra Class --> get messages', () => {
  let SB;
  beforeAll(() => {
    return new Promise(async (resolve, reject) => {
      try {
        SB = new Snackabra();
        await SB.setIdentity(key);
        SB.connect(sb_config);
        resolve(SB);
      } catch (e) {
        reject(e);
      }
    });
  });

  test('Fetch messages', async () => {
    //console.log('... testing fetch messages ...');
    //console.log(SB.channel.keys);
    //console.log(JSON.stringify(SB.channel.api));
    //let z = await SB.channel.api.getOldMessages(10);
    //console.log('Fetching old messages:');
    //console.log(z);
  });
});


describe('Snackabra Class > ChannelAPI', () => {
  let SB;
  beforeAll(async () => {
    SB = new Snackabra();
    await SB.setIdentity(key);
    SB.connect(sb_config, channel_id);
    SB.onMessage = (event) => {
      console.log(event);
    };
    return SB;
  });

  test('Create', async () => {
    const channel = await SB.channel.api.create('password');
    //console.log(channel)
    //SB.connect(sb_config, channel);
    expect(typeof channel).toBe('string');
  });

  test('getLastMessageTimes', async () => {
    const res = await SB.channel.api.getLastMessageTimes();
    expect(typeof res).toBe('string');
  });

  test('getOldMessages', async () => {
    const res = await SB.channel.api.getOldMessages(10);
    expect(typeof res).toBe('object');
  });

  test('updateCapacity', async () => {
    const res = await SB.channel.api.updateCapacity(21);
    expect(res.capacity).toBe('21');
  });

  test('getCapacity', async () => {
    const capacity = await SB.channel.api.getCapacity();
    expect(capacity).toBe('21');
  });

  test('getJoinRequests', async () => {
    const joins = await SB.channel.api.getJoinRequests();
    expect(joins.join_requests).toStrictEqual([]);
  });

  test('isLocked', async () => {
    const locked = await SB.channel.api.isLocked();
    expect(locked).toStrictEqual(false);
  });

  test('setMOTD', async () => {
    const motd = await SB.channel.api.setMOTD('WOOOOOOT');
    console.log(motd);
    expect(motd).toStrictEqual({'motd': 'WOOOOOOT'});
  });

  test('getAdminData', async () => {
    const adminData = await SB.channel.api.getAdminData();
    console.log(adminData);
    expect(adminData).toStrictEqual({'motd': 'WOOOOOOT'});
  });

});

