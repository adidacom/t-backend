module.exports = {
  "parser": "babel-eslint",
  'env': {
      'es6': true,
      'node': true,
      'browser': false,
  },
  'extends': ['plugin:prettier/recommended'],
  'parserOptions': {
     'ecmaVersion': 8,
     'sourceType': 'module',
  },
};
