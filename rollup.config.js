import replace from '@rollup/plugin-replace';

export default {
  input: 'snackabra.js',
  plugins: [
    replace({
      'preventAssignment': true,
      __buildDate__: () => JSON.stringify(new Date()),
      'process.browser': process.env.BROWSER === 'true'
    }),
  ],
  onwarn: function (warning) {
    if (warning.code === 'THIS_IS_UNDEFINED') { return; } // skip this warning (tsc side-effect)
    console.warn( warning.message ); // show any others
  }
};
