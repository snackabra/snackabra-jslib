// Copyright (c) 2022 Magnusson Institute, All Rights Reserved.

// to use this, simply add module script import in html:
//  <script type="module" src="./test01.js"></script>

// these are the tests to carry out:

const test_list = [
  /* 'test01a', 'test01b', 'test02', 'test02b', 'test03', */

  /* SB API */
  'test04c',
  'test04a', 'test04',

  /* voprf test, not standard
     plus: need to uncomment the import far below on voprf
     (we will be removing this since snackabra-jslib is constrained to standardized web API */
  /* 'test05' */
];




// import {jest} from '@jest/globals';
import {
  SB_libraryVersion,
  ab2str,
  str2ab,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  getRandomValues,
  jsonParseWrapper,
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

if (test_list.includes('test01a')) {
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


if (test_list.includes('test01b')) {
  let i;
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

if (test_list.includes('test02')) {
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

if (test_list.includes('test02b')) {
  let i;
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

if (test_list.includes('test03')) {
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
  // channel_server: 'https://r.somethingstuff.workers.dev',
  channel_server: 'http://127.0.0.1:4001',
  // channel_ws: 'wss://r.somethingstuff.workers.dev',
  channel_ws: 'ws://127.0.0.1:4001',
  // storage_server: 'https://s.somethingstuff.workers.dev'
  storage_server: 'http://127.0.0.1:4000'
};


/* so you can also reach this on:
   https://snackabra.pages.dev/rooms/yzeQWYahP87ngAVbhdP7DxU3or0mOrOTLJ3HcQ9UQQzZgKMYq3zWr1Qk5bZTXpHl
*/

// updating tests - channel ID is created
// const channel_id = 'yzeQWYahP87ngAVbhdP7DxU3or0mOrOTLJ3HcQ9UQQzZgKMYq3zWr1Qk5bZTXpHl';



var channel_id_resolve;
var channel_id = new Promise((resolve) => { channel_id_resolve = resolve; });

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

if (test_list.includes('test04c')) {
  const z = document.getElementById('test04c');
  z.innerHTML = 'starting test ... creating Snackabra object ...<br\>';
  const SB = new Snackabra(sb_config);
  z.innerHTML += ' ... received Snackabra object (see console log) ...<br\>';
  console.log(SB);
  SB.setIdentity(key).then(async () => {
    z.innerHTML += ' ... set identity ...<br\>';
    SB.create('password').then((c) => {
      z.innerHTML += ' ... received new channel:<br\>';
      z.innerHTML += c + '<br\n>';
      channel_id_resolve(c);
    });
  });
}


if (test_list.includes('test04a')) {
  channel_id.then((channel_id) => {
    // Watch for incoming messages on the socket
    const SB = new Snackabra(sb_config);
    SB.setIdentity(key).then(async () => {
      const c = await SB.connect(channel_id);
      const messages = [];
      const controlMessages = [];
      c.channel.socket.onMessage = async (sb_message) => {
        console.log('Message Received:\n ', sb_message);
        const message = jsonParseWrapper(sb_message, 'L248');
        if (message?.control) {
          controlMessages.push(message);
        } else {
          if (message?.image !== '') {
            messages.push(message);
          }
        }
        if (controlMessages.length === messages.length * 2 && controlMessages.length > 0) {
          const imageData = await c.storage.retrieveData(messages[0]._id, messages, controlMessages);
          const img = document.getElementById('new-snackabra-img');
          console.log(imageData);
          img.src = imageData.url;
        }
      };
    });
  });
}


if (test_list.includes('test04')) {
  channel_id.then((channel_id) => {
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
          const img = document.getElementById('original-snackabra-img');

          fetch(img.src)
            .then((res) => res.blob())
            .then((blob) => {
              // const file = new File([blob], 'dot.png', blob);
              const file = new File([blob], 'dot.svg', blob);
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
  });
}


// VOPRF testing ...
// ... uncomment this if you're running test05

// import {
//   Oprf, VOPRFClient, VOPRFServer, generatePublicKey, randomPrivateKey
//   // '@cloudflare/voprf-ts';
// } from './voprf-src/index.js';

if (test_list.includes('test05')) {

  // kick-tire test from
  // https://github.com/cloudflare/voprf-ts

  console.log("inside VOPRF test ...");

  // set up client and server with suite P384-SHA384.

  // the OPRF server has a private key obviously
  const suite = Oprf.Suite.P384_SHA384;
  const privateKey = await randomPrivateKey(suite);
  const server = new VOPRFServer(suite, privateKey);
  console.log("Private key (48 bytes): ", arrayBufferToBase64(privateKey.buffer));

  // the client gets the server's public key
  const publicKey = generatePublicKey(suite, privateKey);
  const client = new VOPRFClient(suite, publicKey);
  console.log("Public key (49 bytes so b64 will be padded): ", arrayBufferToBase64(publicKey.buffer));
  
  // client generates input (it's secret)
  const input = new TextEncoder().encode("This is the client's input");
  console.log("Client input 1: ", arrayBufferToBase64(input));
  const [finData, evalReq] = await client.blind([input]);

  // server responds with evaluation
  const evaluation = await server.evaluate(evalReq);

  // client can pull out output and at same time verify (that the server used the correct private key)
  const output = await client.finalize(finData, evaluation);
  console.log("Test 1, returns: ", arrayBufferToBase64(output[0]));

  // try with different client secret
  const input2 = getRandomValues(new Uint8Array(48));
  console.log("Client input2 : ", arrayBufferToBase64(input2));
  const [finData2, evalReq2] = await client.blind([input2]);
  const evaluation2 = await server.evaluate(evalReq2);
  const output2 = await client.finalize(finData2, evaluation2);
  console.log("Test 2, returns: ", arrayBufferToBase64(output2[0]));
  
  console.log("testing again with same client secret");
  const [finData3, evalReq3] = await client.blind([input2]);
  const evaluation3 = await server.evaluate(evalReq3);
  const output3 = await client.finalize(finData3, evaluation3);
  console.log("Test 3 (same client secret as test 2) returns: ", arrayBufferToBase64(output3[0]));
}



if (true) {
  // final results posting
  const z = document.getElementById('results');
  z.innerHTML = `Results: ${test_pass ? test_pass : 'none'} passed, ${test_fail ? test_fail : 'none'} failed`;
}
