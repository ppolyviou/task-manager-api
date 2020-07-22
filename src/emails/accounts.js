const sgMail = require('@sendgrid/mail')

//const sendgridAPIkey = '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'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//sgMail.setApiKey(sendgridAPIkey)

// sgMail.send({
//     to: 'ppolyviou89@gmail.com',
//     from: 'ppolyviou89@gmail.com',
//     subject: 'My first sendgrid email',
//     Text: 'I hope you get it'
// })

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ppolyviou89@gmail.com',
        subject: 'thanks for joining',
        text: `Welcome to the spp, ${name}. Let me know how is the app`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ppolyviou89@gmail.com',
        subject: 'Sorry to see you go',
        text: `Goodbye ${name}. Let us feedback`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}