const mongoose = require('mongoose'),
    { MONGO_URI } = require('../config')

mongoose.set('strictQuery', false)

const db = mongoose.connect(MONGO_URI)
    .then(data => console.log('Mongo Connected!'))
    .catch(err => console.log({err}))

module.exports = db

// (node:12392) [MONGOOSE] DeprecationWarning: Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7.
// Use `mongoose.set('strictQuery', false);` if you want to prepare for this change.
// Or use `mongoose.set('strictQuery', true);` to suppress this warning.