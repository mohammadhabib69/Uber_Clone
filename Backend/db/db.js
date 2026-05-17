const mongoose = require('mongoose');


function connectToDb() {
    if (!process.env.DB_CONNECT) {
        console.error("==========================================================================");
        console.error("FATAL ERROR: DB_CONNECT is not defined in the environment variables!");
        console.error("Please add DB_CONNECT in your Render / deployment Environment Variables.");
        console.error("==========================================================================");
        return;
    }
    mongoose.connect(process.env.DB_CONNECT
    ).then(() => {
        console.log('Connected to DB');
    }).catch(err => {
        console.error('Failed to connect to MongoDB:', err.message);
    });
}


module.exports = connectToDb;