const { commonHelpers } = require('../helpers'),
    { destinationModel, letterModel, blogModel } = require('../models'),

    webhhookController = {
        update: async (req, res) => {
            try {
                const endpointSecret = "whsec_82667973ac17219d5567ad1a8c83ade7dd6fc223352e9a7f772327a9b909baf7";
                const sig = request.headers['stripe-signature'];

                let event;
                event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);

                switch (event.type) {
                    // case 'customer.subscription.updated': {
                    //     const customerSubscriptionUpdated = event.data.object;
                    // }
                    //     break;
                    // case 'invoice.finalization_failed':
                    //     const invoiceFinalizationFailed = event.data.object;
                    //     break;
                    // case 'invoice.finalized':
                    //     const invoiceFinalized = event.data.object;
                    //     break;
                    // case 'invoice.marked_uncollectible':
                    //     const invoiceMarkedUncollectible = event.data.object;
                    //     break;
                    // case 'invoice.paid':
                    //     const invoicePaid = event.data.object;
                    //     break;
                    // case 'invoice.payment_action_required':
                    //     const invoicePaymentActionRequired = event.data.object;
                    //     break;
                    // case 'invoice.payment_failed':
                    //     const invoicePaymentFailed = event.data.object;
                    //     break;
                    case 'invoice.payment_succeeded':
                        const invoicePaymentSucceeded = event.data.object;
                        res.json({ a: event.data.object })
                        break;
                    // case 'invoice.upcoming':
                    //     const invoiceUpcoming = event.data.object;
                    //     break;
                    // case 'invoice.updated':
                    //     const invoiceUpdated = event.data.object;
                    //     break;
                    // case 'invoice.voided':
                    //     const invoiceVoided = event.data.object;
                    //     break;
                    // case 'payment_intent.canceled':
                    //     const paymentIntentCanceled = event.data.object;
                    //     break;
                    // case 'payment_intent.created':
                    //     const paymentIntentCreated = event.data.object;
                    //     break;
                    // case 'payment_intent.partially_funded':
                    //     const paymentIntentPartiallyFunded = event.data.object;
                    //     break;
                    // case 'payment_intent.payment_failed':
                    //     const paymentIntentPaymentFailed = event.data.object;
                    //     break;
                    // case 'payment_intent.processing':
                    //     const paymentIntentProcessing = event.data.object;
                    //     break;
                    // case 'payment_intent.requires_action':
                    //     const paymentIntentRequiresAction = event.data.object;
                    //     break;
                    case 'payment_intent.succeeded':
                        const paymentIntentSucceeded = event.data.object;
                        res.json({ b: event.data.object })
                            break;
                    default:
                        console.log(`Unhandled event type ${event.type}`);
                }
            } catch (error) { return commonHelpers.somethingWentWrong(error, res) }
        },

    }

module.exports = webhhookController