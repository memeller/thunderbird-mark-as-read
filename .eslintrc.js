module.exports = {
  root: true,
  env: {
    node: true,
    webextensions: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      "no-unused-vars": process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
