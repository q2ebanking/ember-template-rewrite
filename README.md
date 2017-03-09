# ember-template-rewrite [![Build Status][travis-badge]][travis-badge-url]

A utility for automatically refactoring Ember.js templates.

## Install

```
npm install -g ember-template-rewrite
```

## Running

Get help

```
ember-template-rewrite --help
```

Example: convert bind-attrs to attribute bindings

```
cd my-ember-app/
ember-template-rewrite convert-bind-attr .
```

## Contributing

- open an issue
- submit a PR

## Running Tests

```
npm run test
```

or with test coverage

```
npm run cover
```

## License

ember-template-rewrite is [Apache 2.0 Licensed](http://bitbucket/projects/EMBER/repos/ember-template-rewrite/browse/LICENSE.md).

## Code of Conduct

ember-template-rewrite conforms to [Contributor Code of Conduct](http://bitbucket/projects/OSS/repos/oss-policy/browse/template/code-of-conduct.md).

[travis-badge]: https://travis-ci.org/jschilli/ember-cli-dash-docset.svg?branch=master
[travis-badge-url]: https://travis-ci.org/jschilli/ember-cli-dash-docset
