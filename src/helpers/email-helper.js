const nodemailer = require('nodemailer'),
    { EMAIL_USER, EMAIL_PASS } = require('../config'),

    transporter = nodemailer.createTransport({
        service: "gmail", auth: { user: EMAIL_USER, pass: EMAIL_PASS, },
    }),
    mail = async mailOptions => new Promise((resolve, reject) => transporter.sendMail(mailOptions, (error, result) => error ? reject(error) : resolve(result))),

    emailHelper = {
        forgotPassword: async ({ code, to }) => mail({
            to,
            subject: "LongLayOver Password Reset Verification Code",
            html: `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office">

  <head>
      <title></title>
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <!--<![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style type="text/css">
                      #outlook a {
                          padding: 0;
          }

                      .ReadMsgBody {
                          width: 100%;
          }

                      .ExternalClass {
                          width: 100%;
          }

                      .ExternalClass * {
                          line - height: 100%;
          }

                      body {
                          margin: 0;
                      padding: 0;
                      -webkit-text-size-adjust: 100%;
                      -ms-text-size-adjust: 100%;
          }

                      table,
                      td {
                          border - collapse: collapse;
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
          }

                      img {
                          border: 0;
                      height: auto;
                      line-height: 100%;
                      outline: none;
                      text-decoration: none;
                      -ms-interpolation-mode: bicubic;
          }

                      p {
                          display: block;
                      margin: 13px 0;
          }
                  </style>
                  <style type="text/css">
                      @media only screen and (max-width:480px) {
              @-ms-viewport {
                          width: 320px;
              }

                      @viewport {
                          width: 320px;
              }
          }
                  </style>
                  <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
                      <style type="text/css">
                          @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
                      </style>
                      <style type="text/css">
                          @media only screen and (min-width:480px) {
              .mj - column - per - 100 {
                              width: 100% !important;
              }
          }
                      </style>
                  </head><body style="background: #F5F5F5;">
                      <div>Your verification code :</div>
                      <h2>
                      ${code}
                      </h2>
                  </html>`
        }),

        emailLetter: async (data) =>
            Promise.allSettled(data.map(async v => mail({ to: v.to, subject: `Weekly recommendation`, html: `<p>Hey<br>code : ${v.code}<br> name : ${v.name}</p>` })))
    }

module.exports = emailHelper