const { STRIPE_KEY } = require("../config"),
  stripe = require("stripe")(STRIPE_KEY),
  stripeHandler = {
    listPrice: () => stripe.prices.list({ limit: 2 }).then((data) => data.data),

    createToken: (data) =>
      stripe.tokens
        .create({
          card: {
            name: data.name,
            address_line1: data.line1,
            // address_line2: data.line2,
            // address_city: data.city,
            // address_state: data.state,
            // address_zip: data.postal_code,
            address_country: data.country,
            number: data.number,
            exp_month: data.exp_month,
            exp_year: data.exp_year,
            cvc: data.cvc,
          },
        })
        .then((data) => [data.id, data.card.fingerprint]),

    createPayMethod: (token) =>
      stripe.paymentMethods
        .create({ type: "card", card: { token } })
        .then((data) => data),

    createCustomer: ({ email, name }) =>
      stripe.customers
        .create({ email, name, description: `Customer with email : ${email}` })
        .then((data) => data),

    updateCustomer: ({ customer, payId }) =>
      stripe.customers
        .update(customer, {
          invoice_settings: { default_payment_method: payId },
        })
        .then((data) => data),

    createSubscription: ({ customer, price }) =>
      stripe.subscriptions
        .create({
          customer,
          items: [{ price }],
          expand: ["latest_invoice.payment_intent"],
        })
        .then((data) => data),

    //  /./././

    retrieveCustomer: ({ customerId, cardId }) =>
      stripe.customers
        .retrieveSource(`${customerId}`, `${cardId}`)
        .then((data) => data),

    retrievePayMethod: (id) =>
      stripe.paymentMethods.retrieve(id).then((data) => data),

    attachPaymentMethod: ({ customer, payId }) =>
      stripe.paymentMethods.attach(payId, { customer }).then((data) => data),
    deleteSubscription: (subscriptionId) =>
      stripe.subscriptions.del(subscriptionId).then((data) => data),
    retrieveSubscription: (id) =>
      stripe.subscriptions.retrieve(id).then((data) => data),
    retrievePI: (id) => stripe.paymentIntents.retrieve(id).then((data) => data),
    retrieveIN: (id) => stripe.invoices.retrieve(id).then((data) => data),
  };

// exports.stripeHandler = stripeHandler;
module.exports = stripeHandler;
