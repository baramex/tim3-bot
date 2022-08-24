const Discord = require("discord.js");
const fs = require("fs");
const { loadImage } = require("canvas");

require("dotenv").config();
require("./service/database").init();
require("./service/schedule").init();

const COLORS = {
    error: "FF0000",
    info: "00F2FF",
    warning: "ffc107",
    valid: "00FF03",
    casino: "FFD700"
}

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates
    ]
});
/**
 * @type {{guild:Discord.Guild,footer:Object}}
 */
let options = { guild: undefined, footer: undefined };
let images = {};

fs.readdir("./images/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(async file => {
        images[file.split(".")[0]] = await loadImage("./images/" + file);
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

client.login(process.env.BOT_TOKEN);

module.exports = { client, options, COLORS, images };