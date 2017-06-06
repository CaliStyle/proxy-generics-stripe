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
        require('trailpack-router'),
        require('trailpack-proxy-generics')
      ]
    },
    proxyGenerics: {
      stripe: {
        adapter: require('../'),
        options: {
          public: process.env.STRIPE_PUBLIC,
          secret: process.env.STRIPE_SECRET
        },
        api: require('../api')
      }
    }
  }
}, smokesignals.FailsafeConfig)


