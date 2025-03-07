// to send out emails to users to journal
// the email could be like sending out journal prompts daily

// TODO: go through all the emails in the table
// how can emails be sent to a collection of them without iterating over them?
// need to store in a way here to make sure and track that the email was successfully sent 
// hashmap

// maybe also a feature that sends a welcome email after the user signs up, 
// officially introducing them to the app

// will be going through information in Dosers db (dynamoDB.js)
// setting a function to be run once a day 
// should i figure out a way to have this function called everyday?

// logic:
// to avoid iterating over emails manually: use dynamoDB scans with pagination

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

// in an object (such as notifications), you cant declare variables with let.
const notifications = {
    // aws ses sends emails in bulk
    // would i need to store the emails somewhere for the service to read from
    // or can ses read from the table directly?
    emails: [], // just store the emails here
    uniqueEmails: [],

    async sendDaily() {
        this.emails = await db.getEmails();
        // TODO: check for duplicates before sending, then update the array
        const seen = {};
        this.uniqueEmails = this.emails.filter(email => !seen[email] && (seen[email] = true));
        // console.log(this.uniqueEmails);
    },


    // TODO: function to get daily motivational quotes from chat
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





