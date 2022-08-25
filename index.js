const fs = require("fs");
const { loadImage } = require("canvas");
require("dotenv").config();
const { client } = require("./client");

require("./service/database").init();
require("./service/schedule").init();

let images = {};
fs.readdir("./ressources/images/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(async file => {
        images[file.split(".")[0]] = await loadImage("./ressources/images/" + file);
    });
});

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = event.name;
        client.on(eventName, async (...args) => {
            try {
                await event.run(...args);
            } catch (error) {
                console.error("event error", eventName, error);
            }
        });
    });
});

module.exports = { images };