var express = require('express'),
    app = express(),
    router = express.Router({
        caseSensitive: true
    }),
    { webhookController } = require('../controllers')

router.post('/webhook', express.raw({ type: 'application/json' }), webhookController.update)

module.exports = router 