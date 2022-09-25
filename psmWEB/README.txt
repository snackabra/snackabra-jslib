
This is the "web" point of view.

This will need both channel server and storage server running locally
(eg miniflare).

You'll need terminal windows, in one you run tsc in watch mode:

$ tsc

... and in the other you run the server, which will load "snackabra.ts"

$ python3 -m http.server --bind 127.0.0.1



NOTE: the test02.js file is for future work to run browser (headless)
testing automatically.
