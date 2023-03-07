module.exports = {
    entry: './snackabra.js', // the entry point of your application
    mode: 'production',
    optimization: {
        minimize: true
    },
    output: {
        library: 'SB', // the name exported to window
        libraryTarget: 'umd',
        filename: 'snackabra.min.js',
        path: __dirname + '/'
    }
};
