const Discord = require("discord.js");
const fs = require("fs");
const Lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
require("dotenv").config();
require("./service/database").init();
require("./service/schedule").init();

const config = Lowdb(new FileSync(__dirname + "/config.json"));
config.defaults({
    channels: [
        { event: "general", description: "Salon public de discussion générale.", types: [Discord.ChannelType.GuildText] }
    ], roles: [
        { type: "member", description: "Rôle membre." }
    ]
}).write();

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
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates
    ]
});
/**
 * @type {{guild:Discord.Guild,footer:Object}}
 */
let options = { guild: undefined, footer: undefined };

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, async (...args) => {
            try {
                await event(...args);
            } catch (error) {
                console.error("event error", eventName, error);
            }
        });
    });
});

client.login(process.env.BOT_TOKEN);

module.exports = { client, options, config, COLORS };