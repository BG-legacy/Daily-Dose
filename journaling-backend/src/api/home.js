const express = require('express')
const bodyParser = require('body-parser') //make sure this is installed properly

const {newUser, loginUser} = require('../utils/auth')



const app = express();
app.use(bodyParser.json());

// home page routes
// router.get('/', userController.displayDaily);
app.post('/api/newUser', newUser);
app.post('/api/loginUser', loginUser);
app.get('/', (req,res) => {
    res.send('Hello World!')
})


const PORT = 3010;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = app;

