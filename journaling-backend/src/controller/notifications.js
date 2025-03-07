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


const userDB = require('./../utils/dynamoDB');
const openAIService = require('./../utils/openAI');

const openAI = new openAIService();
const db = new userDB();


const notifications = {
    // aws ses sends emails in bulk
    // would i need to store the emails somewhere for the service to read from
    // or can ses read from the table directly?

    // TODO: get all the emails and print to console
    async sendDaily() {
        db.getEmails();
    },


    // TODO: function to get daily motivational quotes from chat
    async generateContent() {
        // call function from chat
        openAI.getDailyNotif();
    }

}

module.exports = notifications;





