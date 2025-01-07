const express = require('express');
const cors = require('cors');
const { configDotenv } = require('dotenv');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 3000;

// const crypto = require('crypto');
// const secretKey = crypto.randomBytes(64).toString('hex');


app.use(cors());
app.use(express.json());
app.use(cors({
    origin:'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

// parse url-encoded bodies 
app.use(express.urlencoded({ extended: true }));

//http request logger
app.use(morgan('dev'));

// import routes
const userRoutes = require('./journaling-backend/src/api/home');
const journalRoutes = require('./journaling-backend/src/api/journal');


// database connection
const database = require('./journaling-backend/src/utils/dynamoDB');
const db = new database();
app.use('/api', userRoutes);
app.use('/api/journal', journalRoutes);


// health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'okay!', message: 'Server is running'});
});


// start server
const startServer = async() => {
    try {

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        
        });
    } catch(error) {
        console.error('Failed to start server: ', error);
        process.exit(1);
    }
};

startServer();

module.exports = app; // TODO: for testing
const express = require('express');
const cors = require('cors');
const { configDotenv } = require('dotenv');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(cors({
    origin:'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

// parse url-encoded bodies 
app.use(express.urlencoded({ extended: true }));

//http request logger
app.use(morgan('dev'));

// import routes
const userRoutes = require('./journaling-backend/src/api/home');
const journalRoutes = require('./journaling-backend/src/api/journal');


// database connection
const database = require('./journaling-backend/src/utils/dynamoDB');
const db = new database();
app.use('/api', userRoutes);
app.use('/api/journal', journalRoutes);


// health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'okay!', message: 'Server is running'});
});


// start server
const startServer = async() => {
    try {

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        
        });
    } catch(error) {
        console.error('Failed to start server: ', error);
        process.exit(1);
    }
};

startServer();

module.exports = app; // TODO: for testing