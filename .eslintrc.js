module.exports = {
    "extends": "airbnb-base",
    "plugins": [
      "import"
    ],
    "rules": {
      "prefer-destructuring": ["error", {
          "VariableDeclarator": {
            "array": true,
            "object": true,
          },
          "AssignmentExpression": {
            "array": false,
            "object": false,
          }
        }, {
          "enforceForRenamedProperties": false,
        },
      ],
    },
};
