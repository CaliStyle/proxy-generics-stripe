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

    const sale = {
      amount: transaction.amount,
      currency: transaction.currency || 'usd',
      source: transaction.payment_details.token,
      description: transaction.description || 'Transaction Authorize',
      capture: false
    }

    if (transaction.payment_details.source) {
      sale.customer = transaction.payment_details.source.account_foreign_id
      sale.source = transaction.payment_details.source.foreign_id
    }
    else {
      sale.source = transaction.payment_details.token
    }

    // Stripe Doesn't Allow payments less than 50 cents
    if (transaction.amount <= 50) {
      transaction.authorization = null
      transaction.authorization_exp = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
      transaction.status = 'success'
      return Promise.resolve(transaction)
    }

    return new Promise((resolve, reject) => {
      this.stripe().charges.create(sale, (err, charge) => {
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

    // Stripe Doesn't Allow payments less than 50 cents
    if (transaction.amount <= 50) {
      transaction.status = 'success'
      return Promise.resolve(transaction)
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
    const sale = {
      amount: transaction.amount,
      currency: transaction.currency || 'usd',
      description: transaction.description || 'Transaction Sale',
      capture: true
    }

    if (transaction.payment_details.source) {
      sale.customer = transaction.payment_details.source.account_foreign_id
      sale.source = transaction.payment_details.source.foreign_id
    }
    else {
      sale.source = transaction.payment_details.token
    }

    // Stripe Doesn't Allow payments less than 50 cents
    if (transaction.amount <= 50) {
      transaction.authorization = null
      transaction.authorization_exp = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
      transaction.status = 'success'
      return Promise.resolve(transaction)
    }

    return new Promise((resolve, reject) => {
      this.stripe().charges.create(sale, (err, charge) => {
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
      if (customer.token) {
        create.source = customer.token
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
      this.stripe().customers.createSource(source.account_foreign_id, create, function(err, stripeCard) {
        if (err) {
          return reject(err)
        }
        const paymentDetails = {
          // The type of Source: credit_card, debit_card, prepaid_card, apple_pay, bitcoin
          type: `${stripeCard.funding }_card`,
          // the Gateway used
          gateway: 'stripe',
          // The Response code from AVS the address verification system. The code is a single letter; see this chart for the codes and their definitions.
          avs_result_code: 'Y',
          // The issuer identification number (IIN), formerly known as bank identification number (BIN) ] of the customer's credit card. This is made up of the first few digits of the credit card number.
          credit_card_iin: '',
          // The name of the company who issued the customer's credit card.
          credit_card_company: stripeCard.brand,
          // The customer's credit card number, with most of the leading digits redacted with Xs.
          credit_card_number: `**** **** **** ${ stripeCard.last4 }`,
          // the last 4 of the customer's credit card number
          credit_card_last4: stripeCard.last4,
          // the 2 digit month
          credit_card_exp_month: stripeCard.exp_month,
          // the 2-4 digit year
          credit_card_exp_year: stripeCard.exp_year,
          // The Response code from the credit card company indicating whether the customer entered the card security code, a.k.a. card verification value, correctly. The code is a single letter or empty string; see this chart http://www.emsecommerce.net/avs_cvv2_response_codes.htm for the codes and their definitions.
          cvv_result_code: 'S',
          // The card token from the Gateway
          token: stripeCard.id
        }
        const ret = {
          gateway: 'stripe',
          account_foreign_key: 'customer',
          account_foreign_id: stripeCard.customer,
          foreign_key: stripeCard.object,
          foreign_id: stripeCard.id,
          payment_details: paymentDetails
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

        const paymentDetails = {
          // The type of Source: credit_card, debit_card, prepaid_card, apple_pay, bitcoin
          type: `${stripeCard.funding }_card`,
          // the Gateway used
          gateway: 'stripe',
          // The Response code from AVS the address verification system. The code is a single letter; see this chart for the codes and their definitions.
          avs_result_code: 'Y',
          // The issuer identification number (IIN), formerly known as bank identification number (BIN) ] of the customer's credit card. This is made up of the first few digits of the credit card number.
          credit_card_iin: '',
          // The name of the company who issued the customer's credit card.
          credit_card_company: stripeCard.brand,
          // The customer's credit card number, with most of the leading digits redacted with Xs.
          credit_card_number: `**** **** **** ${ stripeCard.last4 }`,
          // the last 4 of the customer's credit card number
          credit_card_last4: stripeCard.last4,
          // the 2 digit month
          credit_card_exp_month: stripeCard.exp_month,
          // the 2-4 digit year
          credit_card_exp_year: stripeCard.exp_year,
          // The Response code from the credit card company indicating whether the customer entered the card security code, a.k.a. card verification value, correctly. The code is a single letter or empty string; see this chart http://www.emsecommerce.net/avs_cvv2_response_codes.htm for the codes and their definitions.
          cvv_result_code: 'S',
          // The card token from the Gateway
          token: stripeCard.id
        }

        const ret = {
          gateway: 'stripe',
          account_foreign_key: 'customer',
          account_foreign_id: stripeCard.customer,
          foreign_key: stripeCard.object,
          foreign_id: stripeCard.id,
          payment_details: paymentDetails
        }
        return resolve(ret)
      })
    })
  }

  getCustomerSources(customer) {
    return new Promise((resolve, reject) => {
      this.stripe().customers.listCards(customer.foreign_id, function(err, stripeCards) {
        if (err) {
          return reject(err)
        }
        const sources = stripeCards.data.map(stripeCard => {
          const paymentDetails = {
            // The type of Source: credit_card, debit_card, prepaid_card, apple_pay, bitcoin
            type: `${stripeCard.funding }_card`,
            // the Gateway used
            gateway: 'stripe',
            // The Response code from AVS the address verification system. The code is a single letter; see this chart for the codes and their definitions.
            avs_result_code: 'Y',
            // The issuer identification number (IIN), formerly known as bank identification number (BIN) ] of the customer's credit card. This is made up of the first few digits of the credit card number.
            credit_card_iin: '',
            // The name of the company who issued the customer's credit card.
            credit_card_company: stripeCard.brand,
            // The customer's credit card number, with most of the leading digits redacted with Xs.
            credit_card_number: `**** **** **** ${ stripeCard.last4 }`,
            // the last 4 of the customer's credit card number
            credit_card_last4: stripeCard.last4,
            // the 2 digit month
            credit_card_exp_month: stripeCard.exp_month,
            // the 2-4 digit year
            credit_card_exp_year: stripeCard.exp_year,
            // The Response code from the credit card company indicating whether the customer entered the card security code, a.k.a. card verification value, correctly. The code is a single letter or empty string; see this chart http://www.emsecommerce.net/avs_cvv2_response_codes.htm for the codes and their definitions.
            cvv_result_code: 'S',
            // The card token from the Gateway
            token: stripeCard.id
          }
          return {
            gateway: 'stripe',
            account_foreign_key: 'customer',
            account_foreign_id: stripeCard.customer,
            foreign_key: stripeCard.object,
            foreign_id: stripeCard.id,
            payment_details: paymentDetails
          }
        })
        const ret = {
          gateway: 'stripe',
          foreign_key: customer.foreign_key,
          foreign_id: customer.foreign_id,
          data: customer.data,
          sources: sources
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

      this.stripe().customers.updateCard(source.account_foreign_id, source.foreign_id, update, function(err, stripeCard) {
        if (err) {
          return reject(err)
        }
        const paymentDetails = {
          // The type of Source: credit_card, debit_card, prepaid_card, apple_pay, bitcoin
          type: `${stripeCard.funding }_card`,
          // the Gateway used
          gateway: 'stripe',
          // The Response code from AVS the address verification system. The code is a single letter; see this chart for the codes and their definitions.
          avs_result_code: 'Y',
          // The issuer identification number (IIN), formerly known as bank identification number (BIN) ] of the customer's credit card. This is made up of the first few digits of the credit card number.
          credit_card_iin: '',
          // The name of the company who issued the customer's credit card.
          credit_card_company: stripeCard.brand,
          // The customer's credit card number, with most of the leading digits redacted with Xs.
          credit_card_number: `**** **** **** ${ stripeCard.last4 }`,
          // the last 4 of the customer's credit card number
          credit_card_last4: stripeCard.last4,
          // the 2 digit month
          credit_card_exp_month: stripeCard.exp_month,
          // the 2-4 digit year
          credit_card_exp_year: stripeCard.exp_year,
          // The Response code from the credit card company indicating whether the customer entered the card security code, a.k.a. card verification value, correctly. The code is a single letter or empty string; see this chart http://www.emsecommerce.net/avs_cvv2_response_codes.htm for the codes and their definitions.
          cvv_result_code: 'S',
          // The card token from the Gateway
          token: stripeCard.id
        }
        const ret = {
          gateway: 'stripe',
          account_foreign_key: 'customer',
          account_foreign_id: stripeCard.customer,
          foreign_key: stripeCard.object,
          foreign_id: stripeCard.id,
          payment_details: paymentDetails
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
  removeCustomerSource(source) {
    return new Promise((resolve, reject) => {
      this.stripe().customers.deleteCard(source.account_foreign_id, source.foreign_id, function(err, stripeCard) {
        if (err) {
          return reject(err)
        }
        source.gateway = 'stripe'
        return resolve(source)
      })
    })
  }
}

