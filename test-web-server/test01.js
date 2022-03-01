// Copyright (c) 2022 Magnusson Institute, All Rights Reserved.

// to use this, simply add module script import in html:
//  <script type="module" src="./test01.js"></script>

// import {jest} from '@jest/globals';
import {library_version, arrayBufferToString, base64ToArrayBuffer, arrayBufferToBase64, getRandomValues,
       stringToArrayBuffer} from './main.mjs';

let z = document.getElementById("testResults");
z.innerHTML += "Checking version of library: " + library_version() + "\n";

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
  let array_b64 = arrayBufferToBase64(array);
  let array_b64_array = base64ToArrayBuffer(array_b64);
  if (compare_uint8(array_b64_array, array)) {
    test_dom.innerHTML += `Test ${test_index} passed, base64 intermediate value was:<br\>${array_b64}<br\><br\>`;
    test_pass ++;
  } else {
    test_dom.innerHTML += `Test ${test_index} FAILED (see console log), base64 intermediate value was:<br\>${array_b64}<br\><br\>`;
    test_fail ++;
    console.log("Original array:");
    console.log(array);
    console.log("Intermediate b64:");
    console.log(array_b64);
    console.log("Final array:");
    console.log(array_b64_array);
  }
}

if (true)
{
  let i = 0;
  let z = document.getElementById('test01a');
  for (const e of z1) {
    z.innerHTML += `String is '${e}'<br\>`;
    const buffer = stringToArrayBuffer(e);
    test_with_array(z, i, buffer);
    i += 1;
  }
}

if (true)
{
  let z = document.getElementById('test01b');
  for (var i = 0; i < 20; i++) {
    let random_length = new Uint8Array(4);
    getRandomValues(random_length);
    let array = new Uint8Array(random_length[0]);
    getRandomValues(array);
    test_with_array(z, i, array);
  }
}

if (true)
{
  let z = document.getElementById('test02');
  for (const s0 of z2) {
    let s1 = stringToArrayBuffer(s0);
    let s2 = arrayBufferToString(s1);
    if (s0 === s2) {
      z.innerHTML += `Pass for string '${s0}'<br\>`;
      test_pass ++;
    } else {
      z.innerHTML += `FAIL for string '${s0}'<br\>`;
      test_fail ++;
    }
  }
}

if (true)
{
  let z = document.getElementById('test02b');
  for (var i = 0; i < 20; i++) {
    let random_length = new Uint8Array(4);
    getRandomValues(random_length);
    let array = new Uint8Array(random_length[0]);
    getRandomValues(array);
    let s1 = arrayBufferToString(array);
    let s2 = stringToArrayBuffer(s1)
    if (compare_uint8(array, s2)) {
      z.innerHTML += `Pass for random (binary) string test #${i}<br\>`;
      test_pass ++;
    } else {
      z.innerHTML += `FAIL for random (binary) string test #${i} (see console)<br\>`;
      console.log(`test02b string ${i}:`);
      console.log(array);
      test_fail ++;
    }
  }
}

if (true)
{
  // final results posting
  let z = document.getElementById('results');
  z.innerHTML = `Results: ${test_pass ? test_pass : 'none'} passed, ${test_fail ? test_fail : 'none'} failed`;
}
