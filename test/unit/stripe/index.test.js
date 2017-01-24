'use strict'
/* global describe, it */
const assert = require('assert')
describe('Payment Generic Stripe', () => {
  let PaymentGenericService
  let Stripe
  let token
  let token2
  let authorization
  let authorization2

  before((done) => {
    PaymentGenericService = global.app.services.PaymentGenericService
    Stripe = global.app.config.proxyGenerics.stripe

    require('stripe')(
      Stripe.options.secret
    ).tokens.create({
      card: {
        'number': '4242424242424242',
        'exp_month': 12,
        'exp_year': 2020,
        'cvc': '123'
      }
    }, function(err, stripeToken) {
      token = stripeToken.id
      done(err)
    })
  })

  it('should exist', () => {
    assert(PaymentGenericService)
    assert(Stripe)
  })

  it('should authorize', (done) => {
    PaymentGenericService.authorize({
      amount: 100,
      payment_details: {
        token: token
      }
    }, Stripe)
      .then(transaction => {
        authorization = transaction.authorization
        assert.ok(transaction.authorization)
        assert.equal(transaction.amount, 100)
        assert.equal(transaction.status, 'success')
        assert.equal(transaction.kind, 'authorize')
        assert.equal(transaction.payment_details.type, 'credit_card')
        assert.equal(transaction.payment_details.credit_card_company, 'Visa')
        assert.equal(transaction.payment_details.credit_card_number, '**** **** **** 4242')
        assert.equal(transaction.payment_details.credit_card_exp_month, 12)
        assert.equal(transaction.payment_details.credit_card_exp_year, 2020)
        assert.equal(transaction.payment_details.cvv_result_code, 'pass')
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should capture', (done) => {
    PaymentGenericService.capture({
      authorization: authorization
    }, Stripe)
      .then(transaction => {
        assert.equal(transaction.authorization, authorization)
        assert.equal(transaction.amount, 100)
        assert.equal(transaction.status, 'success')
        assert.equal(transaction.kind, 'capture')
        assert.equal(transaction.payment_details.type, 'credit_card')
        assert.equal(transaction.payment_details.credit_card_company, 'Visa')
        assert.equal(transaction.payment_details.credit_card_number, '**** **** **** 4242')
        assert.equal(transaction.payment_details.credit_card_exp_month, 12)
        assert.equal(transaction.payment_details.credit_card_exp_year, 2020)
        assert.equal(transaction.payment_details.cvv_result_code, 'pass')
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should sale', (done) => {
    require('stripe')(
      Stripe.options.secret
    ).tokens.create({
      card: {
        'number': '4242424242424242',
        'exp_month': 12,
        'exp_year': 2020,
        'cvc': '123'
      }
    }, function(err, stripeToken) {
      token2 = stripeToken.id
      PaymentGenericService.sale({
        amount: 100,
        payment_details: {
          token: token2
        }
      }, Stripe)
        .then(transaction => {
          assert.ok(transaction.authorization)
          authorization2 = transaction.authorization
          assert.equal(transaction.amount, 100)
          assert.equal(transaction.status, 'success')
          assert.equal(transaction.kind, 'sale')
          assert.equal(transaction.payment_details.type, 'credit_card')
          assert.equal(transaction.payment_details.credit_card_company, 'Visa')
          assert.equal(transaction.payment_details.credit_card_number, '**** **** **** 4242')
          assert.equal(transaction.payment_details.credit_card_exp_month, 12)
          assert.equal(transaction.payment_details.credit_card_exp_year, 2020)
          assert.equal(transaction.payment_details.cvv_result_code, 'pass')
          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })
  it('should void', (done) => {
    PaymentGenericService.void({
      authorization: authorization
    }, Stripe)
      .then(transaction => {
        assert.equal(transaction.amount, 100)
        assert.equal(transaction.status, 'success')
        assert.equal(transaction.kind, 'void')
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should refund', (done) => {
    PaymentGenericService.refund({
      authorization: authorization2
    }, Stripe)
      .then(transaction => {
        // console.log('THIS TRANSACTION', transaction)
        assert.equal(transaction.amount, 100)
        assert.equal(transaction.status, 'success')
        assert.equal(transaction.kind, 'refund')
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
