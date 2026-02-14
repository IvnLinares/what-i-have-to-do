const nodemailer = require('nodemailer');

// Create a transporter using Ethereal Email (test service)
const createTransporter = async () => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return transporter;
};

let transporter;

const sendEmail = async (to, subject, text, html) => {
  if (!transporter) {
    transporter = await createTransporter();
  }

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Task Manager" <foo@example.com>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: html, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  return info;
};

module.exports = {
  sendEmail
};
