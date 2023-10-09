let { contactUsModel } = require("../models/index");
const { somethingWentWrong } = require("../helpers/common-helpers");
let nodemailer = require("nodemailer");
let { EMAIL_USER, EMAIL_PASS } = require("../config/index");
let { contactUsValidation } = require("../JoiValidations/contactUs");

let contactUs = async (req, res) => {
  try {
    const { error } = contactUsValidation.validate(req.body, {
      errors: {
        label: "key",
        wrap: { label: false },
      },
      abortEarly: false,
    });

    if (error) {
      return res.json({
        status: Boolean(false),
        message: error.details[0].message,
      });
    }

    let { name, email, comment } = req.body;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
    const mailOptions = {
      from: JSON.stringify(email),
      to: EMAIL_USER,
      subject: "Mail regarding contact us",
      text: "Hello there",
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
                  line-height: 100%;
              }
      
              body {
                  margin: 0;
                  padding: 0;
                  -webkit-text-size-adjust: 100%;
                  -ms-text-size-adjust: 100%;
              }

            
      
              table,
              td {
                  border-collapse: collapse;
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
      
              a {
                  text-decoration: none;
                  color: black;
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
                  .mj-column-per-100 {
                      width: 100% !important;
                  }
              }
          </style>
      </head><b ody style="background: #F5F5F5;">
          <div class="mj-container" style="background-color:#F5F5F5;">
              <div style="margin:0px auto;max-width:600px;background:#FFFFFF;">
                  <table role="presentation" cellpadding="0" cellspacing="0"
                      style="font-size:0px;width:100%;background:#FFFFFF;  border-style: solid;border-color: grey;"
                      align="left" border="0">
                      <tbody></tbody>
                  </table>
              </div>
              <div style="margin:0px auto;max-width:600px;background:#FFFFFF;">
                  <table role="presentation" cellpadding="0" cellspacing="0"
                      style="font-size:0px;width:100%;background:#FFFFFF;" align="center" border="0">
                      <tbody>
                          <tr>
                              <td
                                  style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;border: 1px solid black;
                                  padding:25px;">
                                  <div style="margin:0px auto;max-width:600px;background:##FFFFFF;">
                                      <table role="presentation" cellpadding="0" cellspacing="0"
                                          style="font-size:0px;width:100%;background:##FFFFFF;" align="center" border="0">
                                          <tbody>
                                              <tr>
                                                  <td
                                                      style="vertical-align:top;direction:ltr;font-size:0px;padding:7px 0px 7px 0px; background-color:white">
                                                      <div class="mj-column-per-100 outlook-group-fix"
                                                          style="vertical-align:top;display:flex;flex-direction:row;font-size:13px;width:100%;">
                                                          <table role="presentation" cellpadding="0" cellspacing="0"
                                                              width="100%" border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td style="word-wrap:break-word;font-size:0px;padding:0px 20px 0px 20px;">
                                                                          <div style="color:#44698d;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:22px; display:flex; flex-direction:row; justify-content:center;">
                                                                          <div>
                                                                          
                                                                              <img src="http://54.160.193.122/public/images/longlayover.png"
                                                                                  width="30%" height="10%; style="border-radius:50%;">
                                                                              </div>
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </div>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </div>
                                  <hr>
                                  <div style="margin:0px auto;max-width:600px;background:white;">
                                      <table role="presentation" cellpadding="0" cellspacing="0"
                                          style="font-size:0px;width:100%;background:white;" align="center" border="0">
                                          <tbody style="background:#ffffff;">
                                              <tr>
                                                  <td
                                                      style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:9px 0px 9px 0px;">
                                                      <div class="mj-column-per-100 outlook-group-fix"
                                                          style="vertical-align:top;display:flex;flex-direction:row;font-size:13px;width:100%;">
                                                          <table role="presentation" cellpadding="0" cellspacing="0"
                                                              width="100%" border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td style="word-wrap:break-word;font-size:0px;padding:0px 20px 0px 20px;"
                                                                          align="left">
                                                                          <div
                                                                              style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:10px;">
                                                                              <p style="color:#000000;">Name: ${name}</p>
                                                                              <p style="color:#000000";">Email: ${email}</p>
                                                                              <p style="color: #000000;
                                                                              font-size: 12px;
                                                                              font-weight: 400;
                                                                              word-spacing: 5px;
                                                                              line-height: 15px;">Comment: ${comment}</p>
                                                                        </td>
                                                                  </tr>
                                                              </tbody>
                                                          </table>
                                                      </div>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </div>
                                  <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;"
                                      border="0">
                                      <tbody>
                                          <tr>
                                              <td>
                                                  <div style="background-color:#44698d; margin:0px auto;max-width:600px;">
                                                      <table role="presentation" cellpadding="0" cellspacing="0"
                                                          style="font-size:0px;width:100%;" align="center" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td
                                                                      style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:9px 0px 9px 0px;">
                                                                      <div class="mj-column-per-100 outlook-group-fix"
                                                                          style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                                                                          <table role="presentation" cellpadding="0"
                                                                              cellspacing="0" width="100%" border="0">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td style="word-wrap:break-word;font-size:0px;padding:0px 20px 0px 20px;"
                                                                                          align="center">
                                                                                          <div
                                                                                              style="cursor:auto;color:#FFFFFF; font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:22px;text-align:center;">
                                                                                             <p> Copyright 2023 LONGLAYOVER.NET </p>
                                                                                              
                                                                                          </div>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                      </div>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </div>
                                              </td>
                                          </tr>
                                      </tbody>
                                      </div>
                                  </div>
                                  </body>
                              </html>`,
    };
    let emailData = await transporter.sendMail(mailOptions);
    if (emailData) {
      let data = new contactUsModel({
        name,
        email,
        comment,
        adminEmail: EMAIL_USER,
      });
      let commentDetails = await data.save();
      return res.json({
        status: Boolean(true),
        message: "Email send successfully",
        data: commentDetails,
      });
      // res.send(htmlResponse);
    } else {
      return res.json({
        status: Boolean(false),
        message: "Error in sending email",
      });
    }
  } catch (error) {
    return somethingWentWrong(error, res);
  }
};

module.exports = contactUs;
