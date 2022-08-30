import replace from '@rollup/plugin-replace';

export default {
  input: 'src/main.js',
  external: ['crypto', 'fs', 'path'],
  plugins: [
    replace({
      'preventAssignment': true,
      'process.browser': process.env.BROWSER === 'true'
    })
  ]
};
