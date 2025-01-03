const express = require('express')
const bodyParser = require('body-parser') //make sure this is installed properly
const Database = require('../utils/dynamoDB')
const userController = require('../controller/homeController') 

const router = express.Router()
const app = express()

// middleware 
router.use(bodyParser.json())


// home page routes
router.get('/', userController.displayDaily);
router.post('/add-user', userController.newUser);
router.get('/login', userController.loginUser);



module.exports = router;