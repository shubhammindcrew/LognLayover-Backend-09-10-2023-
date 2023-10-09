const mongoose = require('mongoose'),

    airportModel = new mongoose.Schema({
        name: { type: String, required: false },
        code: { type: String, required: false },
    }, { strict: false })

module.exports = mongoose.model('airports', airportModel)