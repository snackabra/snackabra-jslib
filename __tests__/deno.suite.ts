

import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { Client } from "https://deno.land/x/postgres@v0.15.0/mod.ts";
import { delay } from "https://deno.land/std@0.156.0/async/delay.ts";


import {
  SB_libraryVersion,
  ab2str,
  str2ab,
  base64ToArrayBuffer,
  arrayBufferToBase64,
  getRandomValues,
  Snackabra
} from './main.01.ts';


Deno.test('string returns to same result', () => {
  const s = '0123456789abcdefghijklmnop';
  assertEquals(ab2str(base64ToArrayBuffer(arrayBufferToBase64(str2ab(s)))), s);
});


////////////////////////////////////////////////////////////////

Deno.test("url test", () => {
  const url = new URL("./foo.js", "https://deno.land/");
  assertEquals(url.href, "https://deno.land/foo.js");
});

// Compact form: name and function
Deno.test("hello world #1", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});

// Compact form: named function.
Deno.test(function helloWorld3() {
  const x = 1 + 2;
  assertEquals(x, 3);
});

// Longer form: test definition.
Deno.test({
  name: "hello world #2",
  fn: () => {
    const x = 1 + 2;
    assertEquals(x, 3);
  },
});

// Similar to compact form, with additional configuration as a second argument.
Deno.test("hello world #4", { permissions: { read: true } }, () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});

// Similar to longer form, with test function as a second argument.
Deno.test(
  { name: "hello world #5", permissions: { read: true } },
  () => {
    const x = 1 + 2;
    assertEquals(x, 3);
  },
);

// Similar to longer form, with a named test function as a second argument.
Deno.test({ permissions: { read: true } }, function helloWorld6() {
  const x = 1 + 2;
  assertEquals(x, 3);
});

Deno.test("async hello world", async () => {
  const x = 1 + 2;

  // await some async task
  await delay(100);

  if (x !== 3) {
    throw Error("x should be equal to 3");
  }
});

function foo() {
  return 5;
}

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
