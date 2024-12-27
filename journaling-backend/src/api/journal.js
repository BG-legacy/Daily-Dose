const express = require('express')
const dotenv = require('dotenv')
const app = express()

// journaling page
app.get('/thoughts', (res, req) => {
    // use cookies to get the current session user id 
    // add user id, thought input, creation date
    // to journals table
})


// from the above function, retrieve the input and this below function 
// would call the openai api and get the quote, tips, and hacks generated to the user 
// and added to the database

