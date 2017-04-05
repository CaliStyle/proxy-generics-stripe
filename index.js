/* eslint no-console: [0] */
'use strict'

module.exports = class ProxyGenericsStripe {
  constructor(options) {
    this.options = options
  }

  /**
   * Create Stripe Instance
   * @returns {*} Stripe Instance
   */
  stripe() {
    return require('stripe')(
      this.options.secret
    )
  }

  /**
   * resolves error code to proxy-cart error_code
   * @param {Object} err
   * @returns {String}
   */
  resolveStripeCardError(err) {
    let errorCode
    switch (err.code) {
    case 'card_declined':
      errorCode = 'card_declined'
      break
    case 'incorrect_cvc':
      errorCode = 'incorrect_cvc'
      break
    case 'expired_card':
      errorCode = 'expired_card'
      break
    case 'processing_error':
      errorCode = 'processing_error'
      break
    case 'incorrect_number':
      errorCode = 'incorrect_number'
      break
    case 'invalid_expiry_month':
      errorCode = 'invalid_expiry_date'
      break
    case 'invalid_expiry_year':
      errorCode = 'invalid_expiry_date'
      break
    case 'invalid_cvc':
      errorCode = 'invalid_cvc'
      break
    default:
      errorCode = 'processing_error'
    }
    return errorCode
  }

  /**
   *
   * @param transaction
   * @returns {Promise}
   */
  authorize(transaction) {
    // Set the kind immediately
    transaction.kind = 'authorize'
    if (!transaction.payment_details) {
      transaction.payment_details = {
        gateway: 'stripe'
      }
    }

    return new Promise((resolve, reject) => {
      this.stripe().charges.create({
        amount: transaction.amount,
        currency: transaction.currency || 'usd',
        source: transaction.payment_details.token,
        description: transaction.description || 'Transaction Authorize',
        capture: false
      }, (err, charge) => {
        if (err) {
          transaction.error_code = this.resolveStripeCardError(err)
          transaction.status = 'failure'
          return resolve(transaction)
        }
        transaction.amount = charge.amount
        transaction.status = 'success'
        transaction.authorization = charge.id
        transaction.authorization_exp = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
        transaction.payment_details.type = `${charge.source.funding}_${charge.source.object}`
        if (charge.source.object == 'card') {
          transaction.payment_details.avs_result_code = 'Y'
          transaction.payment_details.credit_card_iin = null
          transaction.payment_details.credit_card_company = charge.source.brand
          transaction.payment_details.credit_card_number = `**** **** **** ${charge.source.last4}`
          transaction.payment_details.credit_card_exp_month = charge.source.exp_month
          transaction.payment_details.credit_card_exp_year = charge.source.exp_year
          transaction.payment_details.cvv_result_code = charge.source.cvc_check
        }
        return resolve(transaction)
      })
    })
  }

  /**
   *
   * @param transaction
   * @returns {Promise}
   */
  capture(transaction) {
    transaction.kind = 'capture'
    if (!transaction.payment_details) {
      transaction.payment_details = {
        gateway: 'stripe'
      }
    }
    return new Promise((resolve, reject) => {
      this.stripe().charges.capture(
        transaction.authorization
      , (err, charge) => {
        if (err) {
          transaction.error_code = this.resolveStripeCardError(err)
          transaction.status = 'failure'
          return resolve(transaction)
        }
        transaction.amount = charge.amount
        transaction.status = 'success'
        transaction.authorization = charge.id
        transaction.payment_details.type = `${charge.source.funding}_${charge.source.object}`
        if (charge.source.object == 'card') {
          transaction.payment_details.avs_result_code = 'Y'
          transaction.payment_details.credit_card_iin = null
          transaction.payment_details.credit_card_company = charge.source.brand
          transaction.payment_details.credit_card_number = `**** **** **** ${charge.source.last4}`
          transaction.payment_details.credit_card_exp_month = charge.source.exp_month
          transaction.payment_details.credit_card_exp_year = charge.source.exp_year
          transaction.payment_details.cvv_result_code = charge.source.cvc_check
        }
        return resolve(transaction)
      })
    })
  }

  /**
   *
   * @param transaction
   * @returns {Promise}
   */
  sale(transaction) {
    // Set the kind immediately
    transaction.kind = 'sale'
    if (!transaction.payment_details) {
      transaction.payment_details = {
        gateway: 'stripe'
      }
    }

    return new Promise((resolve, reject) => {
      this.stripe().charges.create({
        amount: transaction.amount,
        currency: transaction.currency || 'usd',
        source: transaction.payment_details.token,
        description: transaction.description || 'Transaction Sale',
        capture: true
      }, (err, charge) => {
        if (err) {
          transaction.error_code = this.resolveStripeCardError(err)
          transaction.status = 'failure'
          return resolve(transaction)
        }
        transaction.amount = charge.amount
        transaction.status = 'success'
        transaction.authorization = charge.id
        transaction.payment_details.type = `${charge.source.funding}_${charge.source.object}`
        if (charge.source.object == 'card') {
          transaction.payment_details.avs_result_code = 'Y'
          transaction.payment_details.credit_card_iin = null
          transaction.payment_details.credit_card_company = charge.source.brand
          transaction.payment_details.credit_card_number = `**** **** **** ${charge.source.last4}`
          transaction.payment_details.credit_card_exp_month = charge.source.exp_month
          transaction.payment_details.credit_card_exp_year = charge.source.exp_year
          transaction.payment_details.cvv_result_code = charge.source.cvc_check
        }
        return resolve(transaction)
      })
    })
  }

  /**
   *
   * @param transaction
   * @returns {Promise}
   */
  void(transaction) {
    transaction.kind = 'void'
    if (!transaction.payment_details) {
      transaction.payment_details = {
        gateway: 'stripe'
      }
    }
    const refund = {
      charge: transaction.authorization
    }
    if (transaction.amount) {
      refund.amount = transaction.amount
    }
    return new Promise((resolve, reject) => {
      this.stripe().refunds.create(refund, (err, refund) => {
        if (err) {
          transaction.error_code = this.resolveStripeCardError(err)
          transaction.status = 'failure'
          return resolve(transaction)
        }
        transaction.amount = refund.amount
        transaction.status = 'success'
        return resolve(transaction)
      })
    })
  }

  /**
   *
   * @param transaction
   * @returns {Promise}
   */
  refund(transaction) {
    transaction.kind = 'refund'
    if (!transaction.payment_details) {
      transaction.payment_details = {
        gateway: 'stripe'
      }
    }
    const refund = {
      charge: transaction.authorization
    }
    if (transaction.amount) {
      refund.amount = transaction.amount
    }
    return new Promise((resolve, reject) => {
      this.stripe().refunds.create(refund, (err, refund) => {
        if (err) {
          transaction.error_code = this.resolveStripeCardError(err)
          transaction.status = 'failure'
          return resolve(transaction)
        }
        transaction.amount = refund.amount
        transaction.status = 'success'
        return resolve(transaction)
      })
    })
  }

  /**
   *
   * @param customer
   * @returns {Promise.<T>}
   */
  createCustomer(customer) {
    return new Promise((resolve, reject) => {
      const create = {
        email: customer.email,
        description: customer.description || 'Customer Account'
      }
      if (customer.source) {
        create.source = customer.source
      }

      this.stripe().customers.create(create, function(err, stripeCustomer) {
        if (err) {
          return reject(err)
        }
        const ret = {
          gateway: 'stripe',
          foreign_key: stripeCustomer.object,
          foreign_id: stripeCustomer.id,
          data: stripeCustomer
        }
        return resolve(ret)
      })
    })
  }

  /**
   *
   * @param source
   * @returns {Promise.<T>}
   */
  createCustomerSource(source) {
    return new Promise((resolve, reject) => {
      const create = {
        source: source.token
      }
      this.stripe().customers.createSource(source.account_foreign_id, create, function(err, stripeCustomer) {
        if (err) {
          return reject(err)
        }
        const ret = {
          gateway: 'stripe',
          foreign_key: stripeCustomer.object,
          foreign_id: stripeCustomer.id,
          data: stripeCustomer
        }
        return resolve(ret)
      })
    })
  }
  /**
   *
   * @param customer
   * @returns {Promise.<T>}
   */
  findCustomer(customer) {
    return new Promise((resolve, reject) => {
      this.stripe().customers.retrieve(customer.foreign_id, function(err, stripeCustomer) {
        if (err) {
          return reject(err)
        }
        const ret = {
          gateway: 'stripe',
          foreign_key: stripeCustomer.object,
          foreign_id: stripeCustomer.id,
          data: stripeCustomer
        }
        return resolve(ret)
      })
    })
  }
  /**
   *
   * @param customer
   * @returns {Promise.<T>}
   */
  findCustomerSource(source) {
    return new Promise((resolve, reject) => {
      this.stripe().customers.retrieveCard(source.account_foreign_id, source.foreign_id, function(err, stripeCard) {
        if (err) {
          return reject(err)
        }
        const ret = {
          gateway: 'stripe',
          foreign_key: stripeCard.object,
          foreign_id: stripeCard.id,
          data: stripeCard
        }
        return resolve(ret)
      })
    })
  }
  /**
   *
   * @param customer
   * @returns {Promise.<T>}
   */
  updateCustomer(customer) {
    return new Promise((resolve, reject) => {
      const update = {}
      if (customer.source) {
        update.source = customer.source
      }
      if (customer.email) {
        update.email = customer.email
      }
      if (customer.description) {
        update.description = customer.description
      }
      this.stripe().customers.update(customer.foreign_id, update, function(err, stripeCustomer) {
        if (err) {
          return reject(err)
        }
        const ret = {
          gateway: 'stripe',
          foreign_key: stripeCustomer.object,
          foreign_id: stripeCustomer.id,
          data: stripeCustomer
        }
        return resolve(ret)
      })
    })
  }

  /**
   *
   * @param source
   * @returns {Promise.<T>}
   */
  updateCustomerSource(source) {
    return new Promise((resolve, reject) => {
      const update = {}
      if (source.name){
        update.name = source.name
      }
      if (source.address_city){
        update.address_city = source.address_city
      }
      if (source.address_country){
        update.address_country = source.address_country
      }
      if (source.address_line1){
        update.address_line1 = source.address_line1
      }
      if (source.address_line2){
        update.address_line2 = source.address_line2
      }
      if (source.address_state){
        update.address_state = source.address_state
      }
      if (source.address_zip){
        update.address_zip = source.address_zip
      }
      if (source.exp_month){
        update.exp_month = source.exp_month
      }
      if (source.exp_year){
        update.exp_year = source.exp_year
      }
      if (source.metadata){
        update.metadata = source.metadata
      }

      this.stripe().customers.updateCard(source.account_foreign_id, source.foreign_id, update, function(err, stripeCustomer) {
        if (err) {
          return reject(err)
        }
        const ret = {
          gateway: 'stripe',
          foreign_key: stripeCustomer.object,
          foreign_id: stripeCustomer.id,
          data: stripeCustomer
        }
        return resolve(ret)
      })
    })
  }
}

