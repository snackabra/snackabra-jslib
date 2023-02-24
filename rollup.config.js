import terser from '@rollup/plugin-terser';

export default {
  input: 'snackabra.js',
  plugins: [ terser() ],
  onwarn: function (warning) {
    if (warning.code === 'THIS_IS_UNDEFINED') { return; } // skip this warning (tsc side-effect)
    console.warn( warning.message ); // show any others
  }
};
