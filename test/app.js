'use strict'

const _ = require('lodash')
const smokesignals = require('smokesignals')

module.exports = _.defaultsDeep({
  pkg: {
    name: require('../package').name + '-test'
  },
  api: require('../api'),
  config: {
    main: {
      packs: [
        require('trailpack-proxy-generics')
      ]
    },
    proxyGenerics: {
      stripe: {
        adapter: require('../'),
        options: {
          public: process.ENV.STRIPE_PUBLIC,
          secret: process.ENV.STRIPE_SECRET
        }
      }
    }
  }
}, smokesignals.FailsafeConfig)


