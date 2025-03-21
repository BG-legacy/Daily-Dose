const express = require('express')
const bodyParser = require('body-parser')

const { newUser, loginUser } = require('../utils/auth.js')



const app = express();
app.use(bodyParser.json());

// home page routes
// router.get('/', userController.displayDaily);
app.post('/newUser', newUser);
app.post('/loginUser', loginUser);
app.get('/', (req, res) => {
  res.send('Hello World!')
})


const PORT = 3011;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = app;

