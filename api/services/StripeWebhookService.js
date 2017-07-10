'use strict'

const Service = require('trails/service')
const _ = require('lodash')

/**
 * @module StripeWebhookService
 * @description
 */
module.exports = class StripeWebhookService extends Service {
  // TODO get stripe secret
  constructor(app, options) {
    super(app)
    this.options = options || {}
    this.stripe = require('stripe')(this.options.secret)
  }

  /**
   *
   * @param req
   * @returns {Promise.<T>}
   */
  webhook(req) {
    return Promise.resolve()
      .then(() => {
        const event = req.body

        // Add a postgres friendly date/time
        const eventDate = new Date(event.created * 1000)

        if (!event.data || !_.isObject(event.data)) {
          const err = new Error('E_VALIDATION')
          err.statusCode = 400
          err.message = 'Requires a data attribute as an object'
          throw err
        }
        if (!event.data.object || !_.isObject(event.data.object)) {
          const err = new Error('E_VALIDATION')
          err.statusCode = 400
          err.message = 'Requires a data.object attribute as an object'
          throw err
        }

        // Add the datetime to a new attribute
        event.data.object.last_stripe_event = eventDate

        const allowed = [
          'charge.captured',
          'charge.failed',
          'charge.succeeded',
          'charge.refunded',
          'charge.updated',
          // 'charge.dispute.created',
          // 'charge.dispute.updated',
          // 'charge.dispute.closed',
          'customer.created',
          'customer.updated',
          'customer.deleted',
          'customer.card.created',
          'customer.card.updated',
          'customer.card.deleted',
          'customer.source.created',
          'customer.source.updated',
          'customer.source.deleted'
        ]

        // If this is not processable request, add ignore attribute
        if (allowed.indexOf(event.type) === -1) {
          event.ignored = true
        }

        // Return modified event
        return event
      })
  }

  /**
   * Validate Stripe Event
   * @param {String} id
   */
  validateStripeEvent(id){
    return Promise.resolve()
      .then(() => {
        // TODO
        // if (!this.app.config.stripe.validate) {
        //   return Promise.resolve()
        // }
        return new Promise((resolve, reject) => {
          this.stripe.events.retrieve(id, function(err, event) {
            if (err) {
              return reject(err)
            }
            return resolve(event)
          })
        })
      })
  }

  /**
   * Handle a Stripe Event
   * @param type
   * @param data
   * @returns {Promise.<T>}
   */
  // TODO
  handleStripeEvent(type, data) {
    return Promise.resolve()
  }
}
