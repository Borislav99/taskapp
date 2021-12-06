const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// slanje mejla
const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
    // kome se salje
    to:email,
    // ko salje mejl
    from: "badamovic@yandex.com",
    // subject
    subject:"Welcome mail",
    // tekst
    text:`Hello there ${name}, this is a welcome mail!`
    })
}
// cancel mail
const sendCancelEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: "badamovic@yandex.com",
        subject: "Cancel Email",
        text: `Hey ${name} sorry to lose you as a customer, here is promo code to get back!`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}