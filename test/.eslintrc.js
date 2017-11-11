module.exports = {
  extends: '../.eslintrc.js',
  rules: {
    'prefer-destructuring': ['error', {
      VariableDeclarator: {
        array: false,
        object: false,
      },
    }],
  },
};
