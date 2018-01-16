# proxy-generics-stripe

[![Waffle.io - Columns and their card count](https://badge.waffle.io/CaliStyle/proxy-generics-stripe.svg?columns=all)](https://waffle.io/CaliStyle/proxy-generics-stripe)

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

Proxy Generic Payment Processor for Stripe.com.

Looking for [Proxy Engine?](https://github.com/calistyle/trailpack-proxy-engine)
Looking for [Proxy Generics?](https://github.com/calistyle/trailpack-proxy-generics)

## Install

```sh
$ npm install --save proxy-generics-stripe
```

## Configure

```js
// config/proxyGenerics.js
module.exports = {
  // make the key stripe, alternatively make the key payment_processor to be the default payment_processor  
  stripe: {
    adapter: require('proxy-generic-stripe'),
    options: {
        public: '<your public key>',
        secret: '<your private key>'
    },
    api: require('proxy-generic-stripe/api'),
    icon: '' // url to an icon you want to use for this generic
  }
}
```

[npm-image]: https://img.shields.io/npm/v/proxy-generics-stripe.svg?style=flat-square
[npm-url]: https://npmjs.org/package/proxy-generics-stripe
[ci-image]: https://img.shields.io/circleci/project/github/CaliStyle/proxy-generics-stripe/master.svg
[ci-url]: https://circleci.com/gh/CaliStyle/proxy-generics-stripe/tree/master
[daviddm-image]: http://img.shields.io/david//trailpack-proxy-generics-stripe.svg?style=flat-square
[daviddm-url]: https://david-dm.org/CaliStyle/proxy-generics-stripe
[codeclimate-image]: https://img.shields.io/codeclimate/github/CaliStyle/proxy-generics-stripe.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/CaliStyle/proxy-generics-stripe

