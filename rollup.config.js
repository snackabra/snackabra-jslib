import replace from '@rollup/plugin-replace';
// import terser from '@rollup/plugin-terser';

export default {
  input: 'src/main.js',
  plugins: [
    replace({
      'preventAssignment': true,
      __buildDate__: () => JSON.stringify(new Date()),
      'process.browser': process.env.BROWSER === 'true'
    }),
/* this is supposed to work (https://github.com/terser/terser/issues/599) but doesn't,
   leaving it in here anyway for future TODO to generate a minified version as well
     terser({
      compress: false,
      mangle: false,
      output: { comments: false }, // strip comments in JS
    }),
 */  ],
  onwarn: function (warning) {
    if (warning.code === 'THIS_IS_UNDEFINED') { return; } // skip this warning (tsc side-effect)
    console.warn( warning.message ); // show any others
  }
};
