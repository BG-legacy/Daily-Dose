// route to get mood history that'll be represented as some type of graph or chart
const express = require('express');
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.json());



app.post('/inputMood')
app.get('/view-mood-chart')