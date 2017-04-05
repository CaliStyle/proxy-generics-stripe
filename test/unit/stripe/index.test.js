'use strict'
/* global describe, it */
const assert = require('assert')
describe('Payment Generic Stripe', () => {
  let PaymentGenericService
  let Stripe
  let token
  let token2
  let token3
  let token4
  let token5
  let authorization
  let authorization2
  let customerId
  let sourceId

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
      // console.log(stripeToken)
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

  it('create a customer', (done) => {
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
      token3 = stripeToken.id

      PaymentGenericService.createCustomer({
        description: 'Customer proxy-generics-stripe',
        source: token3 // obtained with
      }, Stripe)
        .then(customer => {
          // console.log('THIS Customer', customer)
          customerId = customer.foreign_id
          assert.equal(customer.gateway, 'stripe')
          assert.ok(customer.foreign_id)
          assert.ok(customer.foreign_key)
          assert.ok(customer.data)

          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })
  it('find a customer', (done) => {
    PaymentGenericService.findCustomer({
      foreign_id: customerId
    }, Stripe)
      .then(customer => {
        assert.equal(customer.gateway, 'stripe')
        assert.ok(customer.foreign_id)
        assert.ok(customer.foreign_key)
        assert.ok(customer.data)

        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('update a customer', (done) => {
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
      token4 = stripeToken.id
      PaymentGenericService.updateCustomer({
        foreign_id: customerId,
        email: 'example@example.com',
        description: 'Updated Customer proxy-generics-stripe',
        source: token4 // obtained with
      }, Stripe)
        .then(customer => {
          assert.equal(customer.gateway, 'stripe')
          assert.ok(customer.foreign_id)
          assert.ok(customer.foreign_key)
          assert.ok(customer.data)

          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })
  it('Create a customer source', (done) => {
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
      token5 = stripeToken.id
      PaymentGenericService.createCustomerSource({
        account_foreign_id: customerId,
        token: token5 // obtained with
      }, Stripe)
        .then(customer => {
          sourceId = customer.foreign_id
          assert.equal(customer.gateway, 'stripe')
          assert.ok(customer.foreign_id)
          assert.ok(customer.foreign_key)
          assert.ok(customer.data)

          done()
        })
        .catch(err => {
          done(err)
        })
    })
  })
  it('update a customer source', (done) => {
    PaymentGenericService.updateCustomerSource({
      account_foreign_id: customerId,
      foreign_id: sourceId, // obtained with
      exp_year: '2021'
    }, Stripe)
      .then(customer => {
        assert.equal(customer.gateway, 'stripe')
        assert.equal(customer.foreign_id, sourceId)
        assert.ok(customer.foreign_key)
        assert.ok(customer.data)

        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('find a customer source', (done) => {
    PaymentGenericService.findCustomerSource({
      account_foreign_id: customerId,
      foreign_id: sourceId, // obtained with
    }, Stripe)
      .then(customer => {
        // console.log(customer)
        assert.equal(customer.gateway, 'stripe')
        assert.equal(customer.foreign_id, sourceId)
        assert.ok(customer.foreign_key)
        assert.ok(customer.data)

        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
