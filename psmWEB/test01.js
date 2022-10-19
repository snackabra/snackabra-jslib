// Copyright (c) 2022 Magnusson Institute, All Rights Reserved.
// to use this, simply add module script import in html:
//  <script type="module" src="./test01.js"></script>
// these are the tests to carry out:
const test_list = [
    /* 'test01a', 'test01b', 'test02', 'test02b', 'test03', */
    /* SB API */
    /* 'test04c', 'test04a', 'test04', 'test04b', */
    'test04d',
    /* voprf test, not standard
       plus: need to uncomment the import far below on voprf
       (we will be removing this since snackabra-jslib is constrained to standardized web API */
    /* 'test05' */
];
/*
  Asserts boolean, but doesn't break program flow, instead
  it reports on it and returns the outcome
  */
function assert(expr, msg = '') {
    if (expr) {
        return true;
    }
    else {
        let m = 'Failed Assertion in test. ' + msg;
        console.error(m);
        console.log('stack trace:');
        console.trace();
        return false;
    }
}
// import {jest} from '@jest/globals';
import { SB_libraryVersion, ab2str, str2ab, base64ToArrayBuffer, arrayBufferToBase64, getRandomValues, 
// jsonParseWrapper,
// Channel,
Identity, MessageBus, 
// SBFile,
SBMessage, Snackabra } from './snackabra.js';
let test_pass = 0, test_fail = 0;
// guarantees that it's not null
function getElement(s) {
    const z = document.getElementById(s);
    if (z == null) {
        assert(false, `failed to find DOM element '${s}'`);
        return {};
    }
    else {
        return z;
    }
}
const z = getElement('testResults');
z.innerHTML += 'Checking version of library: ' + SB_libraryVersion() + '\n';
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
// TODO: we should probably have an SB class for buffers
const bs2dv = (bs) => bs instanceof ArrayBuffer
    ? new DataView(bs)
    : new DataView(bs.buffer, bs.byteOffset, bs.byteLength);
// compare buffers
function compareBuffers(a, b) {
    if (typeof a != typeof b)
        return false;
    if ((a == null) || (b == null))
        return false;
    const av = bs2dv(a);
    const bv = bs2dv(b);
    if (av.byteLength !== bv.byteLength)
        return false;
    for (let i = 0; i < av.byteLength; i++)
        if (av.getUint8(i) !== bv.getUint8(i))
            return false;
    return true;
}
// // TRUE if the same, false otherwise (we assume they're uint8)
// function compare_uint8(a: ArrayBuffer, b: ArrayBuffer) {
//   if (a.length != b.length)
//     return false;
//   for (let i = a.length; -1 < i; i -= 1) {
//     if (a[i] !== b[i]) return false;
//   }
//   return true;
// }
function test_with_array(test_dom, test_index, array) {
    if ((test_dom == null) || (array == null)) {
        assert(false, "test_with_array() passed on or more null values");
        return;
    }
    const array_b64 = arrayBufferToBase64(array);
    const array_b64_array = base64ToArrayBuffer(array_b64);
    if (compareBuffers(array_b64_array, array)) {
        test_dom.innerHTML += `Test ${test_index} passed, base64 intermediate value was:<br\>${array_b64}<br\><br\>`;
        test_pass++;
    }
    else {
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
    const z = getElement('test01a');
    assert(z);
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
    const z = getElement('test01b');
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
    const z = getElement('test02');
    z.innerHTML += 'starting test ...<br\>';
    for (const s0 of z2) {
        const s1 = str2ab(s0);
        const s2 = ab2str(s1);
        if (s0 === s2) {
            z.innerHTML += `Pass for string '${s0}'<br\>`;
            test_pass++;
        }
        else {
            z.innerHTML += `FAIL for string '${s0}'<br\>`;
            test_fail++;
        }
    }
}
if (test_list.includes('test02b')) {
    let i;
    const z = getElement('test02b');
    z.innerHTML += 'starting test ...<br\>';
    for (i = 0; i < 20; i++) {
        const random_length = new Uint8Array(4);
        getRandomValues(random_length);
        const array = new Uint8Array(random_length[0]);
        getRandomValues(array);
        const s1 = ab2str(array);
        const s2 = str2ab(s1);
        if (compareBuffers(array, s2)) {
            z.innerHTML += `Pass for random (binary) string test #${i}<br\>`;
            test_pass++;
        }
        else {
            z.innerHTML += `FAIL for random (binary) string test #${i} (see console)<br\>`;
            console.log(`test02b string ${i}:`);
            console.log(array);
            test_fail++;
        }
    }
}
if (test_list.includes('test03')) {
    const z = getElement('test03');
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
    }
    else {
        test_fail++;
    }
    z.innerHTML += '... MessageBus tests done ...<br\>';
}
/* ******************************** *
    New 0.5.0 'snackabra.ts' tests!
 * ******************************** */
const sb_config = {
    channel_server: 'http://127.0.0.1:4001',
    channel_ws: 'ws://127.0.0.1:4001',
    storage_server: 'http://127.0.0.1:4000'
};
if (true) {
    const testKeys = new Identity();
    console.log("new identity pub keys - should throw an exception");
    console.log(testKeys.exportable_pubKey);
}
if (true) {
    // create server object
    const SB = new Snackabra({
        channel_server: 'http://127.0.0.1:4001',
        channel_ws: 'ws://127.0.0.1:4001',
        storage_server: 'http://127.0.0.1:4000'
    });
    // create a new channel (room) and connect
    const ownerKeys = new Identity();
    SB.create('password', ownerKeys).then((channelId) => {
        SB.connect(channelId, 
        // print out any messages we get
        (m) => { console.log(`got message: ${m}`); }, ownerKeys // if we omit then we're connecting anonymously
        ).then((c) => c.ready).then((c) => {
            // say hello to everybody
            c.userName = "TestBot";
            (new SBMessage(c, "Hello from TestBot!")).send().then((c) => { console.log(`sent! (${c})`); });
        });
    });
}
if (test_list.includes('test04d')) {
    const z = getElement('test04d');
    // create orchestration (master) object (synchronous)
    console.log("++++test04d++++ SB object:");
    const SB = new Snackabra(sb_config);
    console.log("++++test04d++++ new owner keys:");
    const channelOwnerKeys = new Identity();
    SB.create('password', channelOwnerKeys).then((channelId) => {
        SB.connect(channelId, (message) => {
            console.log('++++test04d++++ Message Received:');
            console.log(message);
        } /* optionally we could add ', identity' override here */).then((c) => c.ready).then((c) => {
            console.log("++++test04d++++ channel:");
            console.log(c);
            // update test web page (index.html)
            const roomUrl = `localhost:3000/rooms/${channelId}`;
            z.innerHTML += ' ... received new channel:<br\>';
            z.innerHTML += `<a href="${roomUrl}">${roomUrl}</a><br\n>`;
            console.log("++++test04d++++ reachable at:");
            console.log(roomUrl);
            // optional
            c.userName = "TestBot";
            // everything should be ready
            console.log("++++test04d++++ channel has keys:");
            console.log(c.keys);
            let sbm = new SBMessage(c, "Hello from test04d!");
            console.log("++++test04d++++ will try to send this message:");
            console.log(sbm);
            sbm.send().then((c) => {
                console.log("++++test04d++++ back from send promise - got response:");
                console.log(c);
            });
            // there's a button that sends more messages manually
            let messageCount = 0;
            getElement('sayHello').onclick = (() => {
                messageCount++;
                let sbm = new SBMessage(c, `message number ${messageCount} from test04d!`);
                console.log(`================ sending message number ${messageCount}:`);
                console.log(sbm);
                c.send(sbm).then((c) => console.log(`back from sending message ${messageCount} (${c})`));
            });
        });
    });
}
/* so you can also reach this on:
   https://snackabra.pages.dev/rooms/yzeQWYahP87ngAVbhdP7DxU3or0mOrOTLJ3HcQ9UQQzZgKMYq3zWr1Qk5bZTXpHl
*/
// updating tests - channel ID is created
// const channel_id = 'yzeQWYahP87ngAVbhdP7DxU3or0mOrOTLJ3HcQ9UQQzZgKMYq3zWr1Qk5bZTXpHl';
// let channel_id_resolve: (arg0: string) => void = (() => { throw new Error('resolve err'); })
// let channel_id = new Promise<string>((resolve) => { channel_id_resolve = resolve; });
/* this is one of Matt's keys */
// const key = {
//   key_ops: ['deriveKey'],
//   ext: true,
//   kty: 'EC',
//   x: '62RGlvpBrkrBTgscORtV5MmJqSS0N6aIELTLY1VdOEhrToUbnNPi2XbFucGhWey9',
//   y: '24kcejeniQMNGuYigc39fcsjzP6P9VqEYWieT6WYgSBlVsCR_DXTjlPRAQ4P8x1K',
//   crv: 'P-384',
//   d: '9sYVDOfUJ8YofRh4y_4dItXcXzTiiwYKI6pXU9thJyfMqMtaFhvUbCsHl14Wx37k'
// };
// if (test_list.includes('test04c')) {
//   const z = getElement('test04c');
//   z.innerHTML = 'starting test ... creating Snackabra object ...<br\>';
//   const SB = new Snackabra(sb_config);
//   z.innerHTML += ' ... received Snackabra object (see console log) ...<br\>';
//   console.log(SB);
//   SB.setIdentity(key).then(async () => {
//     z.innerHTML += ' ... set identity ...<br\>';
//     SB.create('password').then((c) => {
//       z.innerHTML += ' ... received new channel:<br\>';
//       z.innerHTML += `<a href="localhost:3000/rooms/${c}">${c}</a><br\n>`;
//       channel_id_resolve(c);
//     });
//   });
// }
// previous tiny hello
// if (test_list.includes('test04a')) {
//   // "me", note 'key' is set above as a const
//   const myId = new Identity(key)
//   // create SB (orchestration) object
//   const SB = new Snackabra(sb_config)
//   // create a new room (channel)
//   SB.create('password', myId).then((channelId) => {
//     // we have a nice new channel
//     const roomUrl = `localhost:3000/rooms/${channelId}`
//     z.innerHTML += ' ... received new channel:<br\>';
//     z.innerHTML += `<a href="${roomUrl}">${roomUrl}</a><br\n>`;
//     console.log("++++test04a++++ created ID and created room:")
//     console.log("++++test04a++++ my identity:")
//     console.log(myId)
//     console.log("++++test04a++++ new room URL:")
//     console.log(roomUrl)
//     // we now need to connect to it
//     SB.connect(
//       channelId,
//       myId,
//       (message: any) => {
//         console.log('Message Received:')
//         console.log(message)
//       }
//       ).then((c) => {
//       console.log("++++test04a++++ got ourselves a channel:")
//       console.log(c)
//       // const messages = [];
//       // const controlMessages = [];
//       c.ready.then(() => {
//         // everything should be ready
//         c.userName = "TestBot"
//         const k = c.keys
//         console.log("++++test04a++++ channel has keys:")
//         console.log(k)
//         console.log(c.keys)
//         console.log("++++test04a++++ trying to send message!")
//         let sbm = new SBMessage(c, "Hello from test04a!")
//         console.log("++++test04a++++ will try to send this message:")
//         console.log(sbm)
//         sbm.send().then((c) => {
//           console.log("back from send promise? got response:")
//           console.log(c)
//           console.log("++++test04a++++ end of test")
//         })
//         // // in parallel, handle incoming messages:
//         // c.onMessage = async (message: any) => {
//         //   console.log('Message Received:')
//         //   console.log(message)
//         // }
//         // send more hello
//         let messageCount = 0
//         getElement('sayHello').onclick = (() => {
//           messageCount++
//           let sbm = new SBMessage(c, `message number ${messageCount} from test04ba!`)
//           // @ts-ignore
//           // sbm.sender_pubKey = JSON.stringify(myPubKey)
//           console.log(`================ sending message number ${messageCount}:`)
//           console.log(sbm)
//           c.send(sbm).then((c) => console.log(`back from send promise? (${c})`))
//         })
//       })
//     })
//   })
// }
// if (test_list.includes('test04a')) {
//   channel_id.then((channel_id: string) => {
//     // Watch for incoming messages on the socket
//     const SB = new Snackabra(sb_config);
//     SB.setIdentity(key).then(async () => {
//       // console.log("@@@@@@@@@@@@@@@@ Identity set")
//       const c: Channel = await SB.connect(channel_id);
//       // console.log("@@@@@@@@@@@@@@@@ got connection:")
//       console.log(c)
//       const messages: ChannelMessage[] = []
//       const controlMessages: ChannelMessage[] = []
//       c.socket.onMessage = async (message: ChannelMessage) => {
//         // console.log("@@@@@@@@@@@@@@@@ Message Received:\n ", message);
//         // const message = jsonParseWrapper(sb_message, 'L248');
//         if (message?.control) {
//           controlMessages.push(message);
//         } else {
//           if (message?.image !== '') {
//             messages.push(message);
//           }
//         }
//         if (controlMessages.length === messages.length * 2 && controlMessages.length > 0) {
// 	  // this stuff won't work yet, but error outputs are useful
// 	  if (messages[0]._id) {
// 	    let m: ChannelMessage = messages[0] // as ChannelMessage
// 	    // @ts-ignore
//             const imageData = await c.storage!.retrieveData(m!._id, messages, controlMessages);
//             const img = getElement('new-snackabra-img');
//             console.log(imageData);
// 	    // @ts-ignore
//             img.src = imageData.url;
// 	  } else {
// 	    console.log(messages[0])
// 	    assert(false, 'Cannot parse messages[0] (see above)')
// 	  }
//         }
//       };
//     });
//   });
// }
// // send "Hello"
// if (test_list.includes('test04b')) {
//   channel_id.then((channel_id) => {
//     console.log("@@@@@@@@@@@@@@@@ Channel id:")
//     console.log("localhost:3000/rooms/" + channel_id)
//     const SB = new Snackabra(sb_config);
//     SB.setIdentity(key).then(async () => {
//       const c = await SB.connect(channel_id);
//       const messages = [];
//       const controlMessages = [];
//       console.log("@@@@@@@@@@@@@@@@ channel has keys:")
//       console.log(SB.channel.keys)
//       console.log("@@@@@@@@@@@@@@@@ trying to send message!")
//       let sbm = new SBMessage(c, "Hello from test04b!")
//       let myPubKey: JsonWebKey
//       SB.identity.exportable_pubKey.then((pubKey) => {
// 	console.log("Got pubkey: ", pubKey)
// 	sbm.ready.then(() => {
// 	  sbm.sender_pubKey = pubKey! // should be per channel?
// 	  myPubKey = pubKey!
// 	  console.log("here is sender pubkey:", myPubKey)
// 	  // console.log("trying to re-import key, i get:")
// 	  // console.log(await crypto.importKey("jwk", myPubKey, "ECDH", true, []))
// 	  // myPubKey.key_ops = ['deriveKey', 'sign']
// 	  // console.log("trying again:")
// 	  // console.log(await importKey("jwk", myPubKey, "ECDH", true, []))
// 	  console.log("@@@@@@@@@@@@@@@@ will try to send this message:")
// 	  console.log(sbm)
// 	  c.socket.send(sbm).then((c) => console.log("back from send promise?"))
// 	  console.log("@@@@@@@@@@@@@@@@ end of test")
// 	})
//       })
//       c.socket.onMessage = async (message: ChannelMessage) => {
//         console.log('Message Received:\n ', message);
//       }
//       // send more hello
//       let messageCount = 0
//       getElement('sayHello').onclick = (() => {
// 	messageCount++
// 	let msg = new SBMessage(c, `message number ${messageCount}!`)
// 	// @ts-ignore
// 	sbm.sender_pubKey = JSON.stringify(myPubKey)
// 	console.log(`================ sending message number ${messageCount}:`)
// 	console.log(sbm)
// 	c.socket.send(sbm).then((c) => console.log("back from send promise?"))
//       })
//     });
//   });
// }
// NOT WORKING YET
// the image stuff not finished as TS
// // sends an image to the storage server
// if (test_list.includes('test04')) {
//   channel_id.then((channel_id) => {
//     const z = getElement('test04');
//     z.innerHTML += 'starting channel tests ... setting up snoop bot ...<br\>';
//     const SB = new Snackabra(sb_config);
//     SB.setIdentity(key).then(async () => {
//       z.innerHTML += '.. identity set ...<br\>';
//       const c = await SB.connect(channel_id);
//       z.innerHTML += '.. connected ...<br\>';
//       console.log(c);
//       try {
//         // All methods are promises we need to await or use .then().catch()
//         c.channel.api.getOldMessages(10).then(() => {
//           c.sendMessage('hello!');
//           console.log('got channel response:');
//           console.log(z2);
//           const img = getElement('original-snackabra-img');
//           fetch(img.src)
//             .then((res) => res.blob())
//             .then((blob) => {
//               // const file = new File([blob], 'dot.png', blob);
//               const file = new File([blob], 'dot.svg', blob);
//               console.log(file);
//               c.sendFile(file);
//             });
//         });
//       } catch (e) {
//         console.log('ERROR in channel test:');
//         console.log(e);
//         test_fail++;
//       }
//     });
//   });
// }
// VOPRF testing ...
// ... uncomment this if you're running test05
// import {
//   Oprf, VOPRFClient, VOPRFServer, generatePublicKey, randomPrivateKey
//   // '@cloudflare/voprf-ts';
// } from './voprf-src/index.js';
// if (test_list.includes('test05')) {
//   // kick-tire test from
//   // https://github.com/cloudflare/voprf-ts
//   console.log("inside VOPRF test ...");
//   // set up client and server with suite P384-SHA384.
//   // the OPRF server has a private key obviously
//   const suite = Oprf.Suite.P384_SHA384;
//   const privateKey = await randomPrivateKey(suite);
//   const server = new VOPRFServer(suite, privateKey);
//   console.log("Private key (48 bytes): ", arrayBufferToBase64(privateKey.buffer));
//   // the client gets the server's public key
//   const publicKey = generatePublicKey(suite, privateKey);
//   const client = new VOPRFClient(suite, publicKey);
//   console.log("Public key (49 bytes so b64 will be padded): ", arrayBufferToBase64(publicKey.buffer));
//   // client generates input (it's secret)
//   const input = new TextEncoder().encode("This is the client's input");
//   console.log("Client input 1: ", arrayBufferToBase64(input));
//   const [finData, evalReq] = await client.blind([input]);
//   // server responds with evaluation
//   const evaluation = await server.evaluate(evalReq);
//   // client can pull out output and at same time verify (that the server used the correct private key)
//   const output = await client.finalize(finData, evaluation);
//   console.log("Test 1, returns: ", arrayBufferToBase64(output[0]));
//   // try with different client secret
//   const input2 = getRandomValues(new Uint8Array(48));
//   console.log("Client input2 : ", arrayBufferToBase64(input2));
//   const [finData2, evalReq2] = await client.blind([input2]);
//   const evaluation2 = await server.evaluate(evalReq2);
//   const output2 = await client.finalize(finData2, evaluation2);
//   console.log("Test 2, returns: ", arrayBufferToBase64(output2[0]));
//   console.log("testing again with same client secret");
//   const [finData3, evalReq3] = await client.blind([input2]);
//   const evaluation3 = await server.evaluate(evalReq3);
//   const output3 = await client.finalize(finData3, evaluation3);
//   console.log("Test 3 (same client secret as test 2) returns: ", arrayBufferToBase64(output3[0]));
// }
if (true) {
    // final results posting
    const z = getElement('results');
    z.innerHTML = `Results: ${test_pass ? test_pass : 'none'} passed, ${test_fail ? test_fail : 'none'} failed`;
}
//# sourceMappingURL=test01.js.map