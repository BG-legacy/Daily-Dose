const UserManager = require('../utils/userManager');
const db = new UserManager();
//TODO: import openai stuff


const userControl = {
    // create new user
    async displayDaily(req, res) {
        // TODO: use output from the openai api 

        res.send('Hey friend');

    },

    async newUser(req, res) {
        try {
            const { userID, name, email } = req.body;

            if(!userID || !name || !email) {
                return res.status(400).json({ error: 'Missing required fields'});
            }

            // check if the user already exists
            const existingUser = await db.getUser(userID);
            if(existingUser) {
                return res.status(409).json({error: 'User ID already exists'});
            }

            // add user to database
            await db.addUser({
                UserID: userID,  // Match the case used in Database class
                Name: name,      // Match the case used in Database class
                Email: email,    // Match the case used in Database class
                CreationDate: new Date().toISOString()
            });

            return res.status(200).json({message: 'User added successfully!'});

        } catch(error) {
            console.error('Error creating user:', error);
            return res.status(500).json({error: 'Error adding user.'});
        }
    },


    async loginUser(req, res) {
        try {
            const { userID } = req.body;

            if(!userID) {
                return res.status(400).json({error: 'Missing required field'});
            }

            return res.status(200).json({message: 'User logged in successfully'});


        } catch(error) {
            console.error('Error logging in user:', error);
            return res.status(500).json({error: 'Internal server error'});  
        }
    }
}



module.exports = userControl;