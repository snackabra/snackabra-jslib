/*
  In general, use functionNamesLikeThis, variableNamesLikeThis,
  ClassNamesLikeThis, EnumNamesLikeThis, methodNamesLikeThis, and
  SYMBOLIC_CONSTANTS_LIKE_THIS.
*/

module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true,
  },
  'extends': [
    'google',
    'plugin:@typescript-eslint/recommended'
  ],
  'parser': '@typescript-eslint/parser',
  'plugins': ['@typescript-eslint'],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'rules': {
    'camelcase': 'off',
    'object-curly-newline': 'off',
    'spaced-comment': 'off',
    'brace-style': 'off', // specifically for more terse exception handling
    'block-spacing': 'off', // specifically for more terse exception handling
    'curly': 'off', // specifically omitted on some if-then-else for better rollup behaviour
    'require-jsdoc': 'off', // these are deprecated in eslint anyway ... ?
    'valid-jsdoc': 'off',
    'max-len': 'off',
    'one-var': 'off',
    'operator-linebreak': 'off',
    'prefer-spread': 'off',
    'indent': 'off',
    'comma-dangle': 'off',
    'no-tabs': 'off',
    'no-unused-vars': 'warn'
  },
  "ignorePatterns": ["test*.js", "test*.ts", "**/__tests__/*"],
};
