const
    upload = require('./multer-helper'),
    stripeHelper = require('./stripe-helper'),
    { sign, verify } = require('./jwt-helper'),
    commonHelpers = require('./common-helpers'),
    { forgotPassword, emailLetter } = require('./email-helper'),
    { deleteFile, makeDir, moveDest } = require('./file-helper'),
    distanceMatrixHelper = require('./distanceMatrix-helper')

helpers = { distanceMatrixHelper, sign, verify, forgotPassword, emailLetter, stripeHelper, commonHelpers, upload, deleteFile, makeDir, moveDest }

module.exports = helpers