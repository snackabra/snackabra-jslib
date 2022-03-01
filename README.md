<img src="https://user-images.githubusercontent.com/844289/156240563-cfa8d1ff-fd55-43d7-a867-e9e7c77d183e.svg" width="100">

# Snackabra Javascript Library
=============================

Javascript utilities, shared by, amongst others:
``snackabra-webclient``, ``snackabra-roomserver``, and
``snackabra-storageserver``.

For general documentation on Snackabra see:

* https://snackabra.io

If you would like to contribute or help out with the snackabra
project, please feel free to reach out to us at snackabra@gmail.com or
snackabra@protonmail.com


## Usage

```
# Installation:
npm install snackabra -g

# Use in Node:
var sb = require('snackabra')

# Use in browsers:
<script src="snackabra.js">
```

## Development

Build components (and install dependencies):

```
npm pack
```

## Testing

Test the node version of the library:

```
npm pack && npm test
```

To test the browser version, open the
![index.html](test-web-server/index.html) test page. Note: you will
need to be running a web server, for example:

```
cd test-web-server
python3 -m http.server --bind 127.0.0.1
```

And then point a browser to it.


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
