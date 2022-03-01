<img src="https://user-images.githubusercontent.com/844289/156240563-cfa8d1ff-fd55-43d7-a867-e9e7c77d183e.svg" width="100">

# Snackabra Javascript Library

Javascript utilities, shared by, amongst others:
``snackabra-webclient``, ``snackabra-roomserver``, and
``snackabra-storageserver``.

For general documentation on Snackabra see: https://snackabra.io

If you would like to contribute or help out with the snackabra
project, please feel free to reach out to us at snackabra@gmail.com or
snackabra@protonmail.com

All of Snackabra is licensed under GPL-v3, see [GPL v3 license
file](LICENSE.md) for details.

_Note: this module is under active development as we refactor
the snackabra codebase; currently there's a lot of copy-pasted
code in the various snackabra parts._


## Usage in Node

Install:

```
npm install snackabra -g
```

A couple of ways to load ES module version in nodejs:

```javascript
// method 1:
import * as sb from 'snackabra';
console.log(sb.str2sb('hello'));

// method 2 (the default export)
import Snackabra from 'snackabra';
console.log(Snackabra.str2ab('hello'));

// method 3
const sb = await import('snackabra');
console.log(sb.str2ab('hello'));

// method 4
import {str2ab} from 'snackabra';
console.log(str2ab('hello'));
```

## Usage in browsers

From a local copy:

```html
  <script type="module" src="browser.mjs"></script>
```

Or from npm package:

```
  <!-- This gets latest version: -->
  <script type="module" src="https://unpkg.com/snackabra/browser.mjs"></script>
  <!-- This gets specific version: -->
  <script type="module" src="https://unpkg.com/snackabra@0.4.10/browser.mjs"></script>
```

Dynamic import of latest version from unpkg:

```html
  <h2>Test Results</h2>
  <p id='testResults'></p>
  <script>
    import('https://unpkg.com/snackabra/browser.mjs').then((sb) => {
      let z = document.getElementById("testResults");
      z.innerHTML += `Test: ${sb.str2ab('hello')}`;
    });
  </script>
```

You can also access the loaded functions globally, e.g. ``window.Snackabra.str2ab('hello')``.


## Development

Build components (and install dependencies):

```
npm pack
```

## Testing

There are three main ways to test the library. First test the node version:

```
npm pack && npm test
```

To test browser usage, you will need to open 
![index.html](test-web-server/index.html) test page.
For that, you will
need to be running a web server, for example:

```
cd test-web-server
python3 -m http.server --bind 127.0.0.1
```

We will assume you you have the page served locally at ``127.0.0.1``.
You can then just point your browser at it, e.g. on a Mac just do
``open index.html``, and the file self-tests and reports results.

You can also automate it with puppeteer:

```
cd test-web-server
node test02.js
```

Which will report on command line if all the tests passed or not.


## Publishing

If you have write/admin access to ``npmjs``:

```
npm login  # if needed
npm publish
```


## LICENSE

Copyright (c) 2016-2021 Magnusson Institute, All Rights Reserved.

"Snackabra" is a registered trademark

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice, the above trademark notice, and this
permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

See [GPL v3 license file](LICENSE.md) for details.
