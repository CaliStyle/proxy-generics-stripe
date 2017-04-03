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
      this.stripe().customers.create(create, function(err, stripeCustomer) {
        if (err) {
          return reject(err)
        }
        const ret = {
          gateway: 'stripe',
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
    return Promise.resolve(source)
  }

  /**
   *
   * @param customer
   * @returns {Promise.<T>}
   */
  updateCustomer(customer) {
    return Promise.resolve(customer)
    // return new Promise((resolve, reject) => {
    //   const update = {
    //     email: customer.email,
    //     description: 'Customer'
    //   }
    //   this.stripe().customers.create(update, function(err, stripeCustomer) {
    //     if (err) {
    //       return reject(err)
    //     }
    //     return resolve(stripeCustomer)
    //   })
    // })
  }

  /**
   *
   * @param source
   * @returns {Promise.<T>}
   */
  updateCustomerSource(source) {
    return Promise.resolve(source)
  }
}

