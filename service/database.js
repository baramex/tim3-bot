const mongoose = require('mongoose');

function init() {
    mongoose.connect(process.env.DB).then(() => {
        console.log("Connected to mongodb !")
    }, console.error);
}

module.exports = { init };