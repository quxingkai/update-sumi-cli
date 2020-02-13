const { eslintTS, deepmerge } = require('@ice/spec');

module.exports = deepmerge(eslintTS, {
  rules: {
    "@typescript-eslint/no-var-requires": 0,

    // 与 kaitian 保持一致
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "class-methods-use-this": 0,
    "no-underscore-dangle": 0,
    "dot-notation": 0,
    'no-restricted-syntax': 0,
    'prefer-promise-reject-errors': 0
  }
});
