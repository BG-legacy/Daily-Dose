const nodemailer = require('nodemailer');
const userDB = require('./../utils/dynamoDB');
const openAIService = require('./../utils/openAI');

const openAI = new openAIService();
const db = new userDB();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure:false, 
    auth: {
        user: "dailydose.bdjk@gmail.com",
        pass: "louu iwxq qmnk rwsy"
    }
})


const notifications = {
    emails: [], // just store the emails here
    uniqueEmails: [],

    async sendDaily() {
        this.emails = await db.getEmails();
        const seen = {};
        this.uniqueEmails = this.emails.filter(email => !seen[email] && (seen[email] = true));
    },


    async generateContent() {
        // call function from chat
        return await openAI.getDailyNotif();
    },

    async sendOut() {
        await this.sendDaily(); // make sure the emails are loaded before sending
        console.log(this.uniqueEmails);
        if(this.uniqueEmails.length == 0) {
            console.log("No emails to send to.");
            return;
        }

        const content = await this.generateContent();

        const info = await transporter.sendMail({
            from: ' "Daily Dose" <dailydose.bdjk@gmail.com',
            to: "dfujah@umich.edu",
            subject: "Your Daily Test",
            text: content, // Plain text version
            html: `<h2>Testing</h2><p>${content}</p>` // HTML version
        });

        console.log("emails sent: ", info.messageId);
    }

    //TODO: need to track if an email has been sent already

}

module.exports = notifications;





