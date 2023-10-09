const cron = require('node-cron'),
    { letterModel, destinationModel } = require('./src/models'),
    { emailLetter } = require('./src/helpers'),

    mailLetterCron = () => {
        try {
            cron.schedule('0 0 * * 0', async (a) => {
            // cron.schedule('* * * * * *', async (a) => {
                const mails = await letterModel.find()
                data = mails.map(v => { return { to: v.email, code: v.airportCode, name: v.airportName } })
                await emailLetter(data)
            }
            )
        } catch (error) { return console.log({ cronErr: error }); }
    }

module.exports = { mailLetterCron }