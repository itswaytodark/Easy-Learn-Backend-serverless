import nodemailer from 'nodemailer'
import { PASSWORD, SENDER_EMAIL } from './envConfig.js'

const transpoter = nodemailer.createTransport(
    {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: SENDER_EMAIL,
            pass: PASSWORD
        }
    }
)

export const sendMail = async(to,subject,text,html) => {

    const mail = {
        form: SENDER_EMAIL,
        to:to,
        subject:subject,
        text:text,
        html:html
    }
    await transpoter.sendMail(mail)
}


