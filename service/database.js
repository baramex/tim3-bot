const mongoose = require('mongoose');

function init() {
    mongoose.connect(process.env.DB, { dbName: process.env.DB_NAME }).then(() => {
        console.log("Connected to mongodb !")
    }, console.error);
}

module.exports = { init };