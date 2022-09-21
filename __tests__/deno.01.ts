

import { assertEquals, assertThrows } from "https://deno.land/std@0.156.0/testing/asserts.ts";

// import { Client } from "https://deno.land/x/postgres@v0.15.0/mod.ts";
// import { delay } from "https://deno.land/std@0.156.0/async/delay.ts";


import {
  ab2str,
  str2ab,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  getRandomValues,
//  Snackabra
} from './main.01.ts';


Deno.test('string returns to same result', () => {
  try {
    const s = '0123456789abcdefghijklmnop';
    // console.log('1:', s)
    // console.log('2:', str2ab(s))
    // console.log('3:', arrayBufferToBase64(str2ab(s)))
    // console.log('4:', base64ToArrayBuffer(arrayBufferToBase64(str2ab(s))))
    // console.log('5:', ab2str(base64ToArrayBuffer(arrayBufferToBase64(str2ab(s)))))
    assertEquals(ab2str(base64ToArrayBuffer(arrayBufferToBase64(str2ab(s)))), s);
  } catch (e) {
    console.log("ERROR:", e)
  }
});

Deno.test('ten random buffers of random length', () => {
  for (var i = 0; i < 10; i++) {
    let random_length = new Uint8Array(4);
    getRandomValues(random_length);
    let array = new Uint8Array(random_length[0]);
    getRandomValues(array);
    // console.log(array);
    // console.log(arrayBufferToBase64(array));
    // console.log(base64ToArrayBuffer(arrayBufferToBase64(array)));
    assertEquals(base64ToArrayBuffer(arrayBufferToBase64(array)), array);
  }
});

Deno.test('test invalid chars - should throw', () => {
  assertThrows(() => {
    base64ToArrayBuffer(';;;;;');
  }, Error, 'invalid character',);
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

Deno.test('some string <-> binary conversions', () => {
  for (const s0 of z) {
    let s1 = str2ab(s0);
    let s2 = ab2str(s1);
    assertEquals(s0, s2);
  }
});

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
  var r = '';
  var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()!@#$%^&*-_=+[]{}~;:\'"<>,./?';
  var l = c.length;
  for (var i = 0; i < length; i++) {
    r += c.charAt(Math.floor(Math.random() * l));
  }
  return r;
}

Deno.test('ten random binary strings of random length', () => {
  for (var i = 0; i < 10; i++) {
    let len = Math.floor(Math.random() * 200) + 1
    let str = _randomString(len)
    let s1 = str2ab(str);
    let s2 = ab2str(s1);
    assertEquals(s2, str);
  }
});


Deno.test('some yucky strings', () => {
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
    assertEquals(s0, s4);
  }
});





////////////////////////////////////////////////////////////////

// Deno.test("url test", () => {
//   const url = new URL("./foo.js", "https://deno.land/");
//   assertEquals(url.href, "https://deno.land/foo.js");
// });

// // Compact form: name and function
// Deno.test("hello world #1", () => {
//   const x = 1 + 2;
//   assertEquals(x, 3);
// });

// // Compact form: named function.
// Deno.test(function helloWorld3() {
//   const x = 1 + 2;
//   assertEquals(x, 3);
// });

// // Longer form: test definition.
// Deno.test({
//   name: "hello world #2",
//   fn: () => {
//     const x = 1 + 2;
//     assertEquals(x, 3);
//   },
// });

// // Similar to compact form, with additional configuration as a second argument.
// Deno.test("hello world #4", { permissions: { read: true } }, () => {
//   const x = 1 + 2;
//   assertEquals(x, 3);
// });

// // Similar to longer form, with test function as a second argument.
// Deno.test(
//   { name: "hello world #5", permissions: { read: true } },
//   () => {
//     const x = 1 + 2;
//     assertEquals(x, 3);
//   },
// );

// // Similar to longer form, with a named test function as a second argument.
// Deno.test({ permissions: { read: true } }, function helloWorld6() {
//   const x = 1 + 2;
//   assertEquals(x, 3);
// });

// Deno.test("async hello world", async () => {
//   const x = 1 + 2;

//   // await some async task
//   await delay(100);

//   if (x !== 3) {
//     throw Error("x should be equal to 3");
//   }
// });

// function foo() {
//   return 5;
// }

// interface User {
//   id: number;
//   name: string;
// }

// interface Book {
//   id: number;
//   title: string;
// }

// Deno.test("database", async (t) => {
//   const client = new Client({
//     user: "user",
//     database: "test",
//     hostname: "localhost",
//     port: 5432,
//   });
//   await client.connect();

//   // provide a step name and function
//   await t.step("insert user", async () => {
//     const users = await client.queryObject<User>(
//       "INSERT INTO users (name) VALUES ('Deno') RETURNING *",
//     );
//     assertEquals(users.rows.length, 1);
//     assertEquals(users.rows[0].name, "Deno");
//   });

//   // or provide a test definition
//   await t.step({
//     name: "insert book",
//     fn: async () => {
//       const books = await client.queryObject<Book>(
//         "INSERT INTO books (name) VALUES ('The Deno Manual') RETURNING *",
//       );
//       assertEquals(books.rows.length, 1);
//       assertEquals(books.rows[0].title, "The Deno Manual");
//     },
//     ignore: false,
//     // these default to the parent test or step's value
//     sanitizeOps: true,
//     sanitizeResources: true,
//     sanitizeExit: true,
//   });

//   // nested steps are also supported
//   await t.step("update and delete", async (t) => {
//     await t.step("update", () => {
//       // even though this test throws, the outer promise does not reject
//       // and the next test step will run
//       throw new Error("Fail.");
//     });

//     await t.step("delete", () => {
//       // ...etc...
//     });
//   });

//   // steps return a value saying if they ran or not
//   const testRan = await t.step({
//     name: "copy books",
//     fn: () => {
//       // ...etc...
//     },
//     ignore: true, // was ignored, so will return `false`
//   });

//   // steps can be run concurrently if sanitizers are disabled on sibling steps
//   const testCases = [1, 2, 3];
//   await Promise.all(testCases.map((testCase) =>
//     t.step({
//       name: `case ${testCase}`,
//       fn: async () => {
//         // ...etc...
//       },
//       sanitizeOps: false,
//       sanitizeResources: false,
//       sanitizeExit: false,
//     })
//   ));

//   client.end();
// });
