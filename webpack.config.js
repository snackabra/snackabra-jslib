module.exports = {
    entry: './snackabra.js', // the entry point of your application
    optimization: {
        minimize: true
    },
    output: {
        library: 'SB', // the name exported to window
        libraryTarget: 'umd',
        filename: 'bundle.js'
    }
};
