// Copyright (c) 2022 Magnusson Institute, All Rights Reserved.

// to use this, simply add module script import in html:
//  <script type="module" src="./test01.js"></script>

// import {jest} from '@jest/globals';
import {
  SB_libraryVersion,
  ab2str,
  str2ab,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  getRandomValues,
  MessageBus,
  Snackabra
} from './browser.mjs';

const z = document.getElementById('testResults');
// eslint-disable-next-line new-cap
z.innerHTML += 'Checking version of library: ' + SB_libraryVersion() + '\n';

let test_pass = 0, test_fail = 0;


// easy tests
const z1 = [
  'Hello Everybody',
  'abcdefgABCDEFG0123456!@#$%^&*()'
];

const z2 = [
  'abcdef123456',
  'ABC*#&@^)!_=`|\\',
  '',
  '        ',
  '=============',
  '\0',
  '\0\0\0\0\0\0'
];

// true if the same, false otherwise (we assume they're uint8)
function compare_uint8(a, b) {
  if (a.length != b.length)
    return false;
  for (let i = a.length; -1 < i; i -= 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function test_with_array(test_dom, test_index, array) {
  const array_b64 = arrayBufferToBase64(array);
  const array_b64_array = base64ToArrayBuffer(array_b64);
  if (compare_uint8(array_b64_array, array)) {
    test_dom.innerHTML += `Test ${test_index} passed, base64 intermediate value was:<br\>${array_b64}<br\><br\>`;
    test_pass++;
  } else {
    test_dom.innerHTML += `Test ${test_index} FAILED (see console log), base64 intermediate value was:<br\>${array_b64}<br\><br\>`;
    test_fail++;
    console.log('Original array:');
    console.log(array);
    console.log('Intermediate b64:');
    console.log(array_b64);
    console.log('Final array:');
    console.log(array_b64_array);
  }
}

if (true) {
  let i = 0;
  const z = document.getElementById('test01a');
  z.innerHTML += 'starting test ...<br\>';
  for (const e of z1) {
    z.innerHTML += `String is '${e}'<br\>`;
    const buffer = str2ab(e);
    test_with_array(z, i, buffer);
    i += 1;
  }
}

let i;
if (true) {
  const z = document.getElementById('test01b');
  z.innerHTML += 'starting test ...<br\>';
  for (i = 0; i < 20; i++) {
    const random_length = new Uint8Array(4);
    getRandomValues(random_length);
    const array = new Uint8Array(random_length[0]);
    getRandomValues(array);
    test_with_array(z, i, array);
  }
}

if (true) {
  const z = document.getElementById('test02');
  z.innerHTML += 'starting test ...<br\>';
  for (const s0 of z2) {
    const s1 = str2ab(s0);
    const s2 = ab2str(s1);
    if (s0 === s2) {
      z.innerHTML += `Pass for string '${s0}'<br\>`;
      test_pass++;
    } else {
      z.innerHTML += `FAIL for string '${s0}'<br\>`;
      test_fail++;
    }
  }
}

if (true) {
  const z = document.getElementById('test02b');
  z.innerHTML += 'starting test ...<br\>';
  for (i = 0; i < 20; i++) {
    const random_length = new Uint8Array(4);
    getRandomValues(random_length);
    const array = new Uint8Array(random_length[0]);
    getRandomValues(array);
    const s1 = ab2str(array);
    const s2 = str2ab(s1);
    if (compare_uint8(array, s2)) {
      z.innerHTML += `Pass for random (binary) string test #${i}<br\>`;
      test_pass++;
    } else {
      z.innerHTML += `FAIL for random (binary) string test #${i} (see console)<br\>`;
      console.log(`test02b string ${i}:`);
      console.log(array);
      test_fail++;
    }
  }
}

if (true) {
  const z = document.getElementById('test03');
  const b = new MessageBus();
  let called_1 = false;
  z.innerHTML += 'starting test ...<br\>';
  console.log('inside testing messagebus');

  function hello_1() {
    z.innerHTML += '... first handler<br\>';
    called_1 = true;
  }

  b.subscribe('1', hello_1);
  b.subscribe('1', hello_1);
  z.innerHTML += 'Should call first handler twice:<br\>';
  b.publish('1');
  z.innerHTML += 'And now just once:<br\>';
  b.unsubscribe('1', hello_1);
  b.publish('1');
  z.innerHTML += 'And now not at all:<br\>';
  b.unsubscribe('1', hello_1);
  b.publish('1');

  if (called_1) {
    test_pass++;
  } else {
    test_fail++;
  }
  z.innerHTML += '... MessageBus tests done ...<br\>';
}


/* snackabra channel tests ... these correspond to snackabra.pages.dev public server */

const sb_config = {
  channel_server: 'https://r.somethingstuff.workers.dev',
  channel_ws: 'wss://r.somethingstuff.workers.dev',
  storage_server: 'https://s.somethingstuff.workers.dev'
};


/* so you can also reach this on:
   https://snackabra.pages.dev/rooms/yzeQWYahP87ngAVbhdP7DxU3or0mOrOTLJ3HcQ9UQQzZgKMYq3zWr1Qk5bZTXpHl
*/
const channel_id = 'yzeQWYahP87ngAVbhdP7DxU3or0mOrOTLJ3HcQ9UQQzZgKMYq3zWr1Qk5bZTXpHl';

/* this is one of Matt's keys */
const key = {
  key_ops: ['deriveKey'],
  ext: true,
  kty: 'EC',
  x: '62RGlvpBrkrBTgscORtV5MmJqSS0N6aIELTLY1VdOEhrToUbnNPi2XbFucGhWey9',
  y: '24kcejeniQMNGuYigc39fcsjzP6P9VqEYWieT6WYgSBlVsCR_DXTjlPRAQ4P8x1K',
  crv: 'P-384',
  d: '9sYVDOfUJ8YofRh4y_4dItXcXzTiiwYKI6pXU9thJyfMqMtaFhvUbCsHl14Wx37k'
};


if (true) {
  const z = document.getElementById('test04');
  z.innerHTML += 'starting channel tests ... setting up snoop bot ...<br\>';
  const SB = new Snackabra(sb_config);
  SB.setIdentity(key).then(async () => {
    z.innerHTML += '.. identity set ...<br\>';
    const c = await SB.connect(channel_id);
    z.innerHTML += '.. connected ...<br\>';
    console.log(c);
    try {
      // All methods are promises we need to await or use .then().catch()
      c.channel.api.getOldMessages(10).then(() => {
        c.sendMessage('hello!');
        console.log('got channel response:');
        console.log(z2);
        const img = document.getElementById('snackabra-img');

        fetch(img.src)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], 'dot.png', blob);
            console.log(file);
            c.sendFile(file);
          });
      });
    } catch (e) {
      console.log('ERROR in channel test:');
      console.log(e);
      test_fail++;
    }
  });
}


if (true) {
  // final results posting
  const z = document.getElementById('results');
  z.innerHTML = `Results: ${test_pass ? test_pass : 'none'} passed, ${test_fail ? test_fail : 'none'} failed`;
}
