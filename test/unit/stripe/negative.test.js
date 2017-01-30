'use strict'
/* global describe, it */
const assert = require('assert')

describe('Payment Generic Stripe', () => {
  let PaymentGenericService
  let Stripe

  before((done) => {
    PaymentGenericService = global.app.services.PaymentGenericService
    Stripe = global.app.config.proxyGenerics.stripe
    done()
  })

  it('should report card declined',done => {
    require('stripe')(
      Stripe.options.secret
    ).tokens.create({
      card: {
        'number': '4000000000000002',
        'exp_month': 12,
        'exp_year': 2020,
        'cvc': '123'
      }
    }, function(err, stripeToken) {
      PaymentGenericService.sale({
        amount: 100,
        payment_details: {
          token: stripeToken.id
        }
      }, Stripe)
        .then(transaction => {
          assert.equal(transaction.error_code, 'card_declined')
          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })
})