const { loadImage } = require("canvas");
const Discord = require("discord.js");
const fs = require("fs");

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
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildInvites
    ]
});
client.login(process.env.BOT_TOKEN);

let images = {};
fs.readdir("./ressources/images/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(async file => {
        images[file.split(".")[0]] = await loadImage("./ressources/images/" + file);
    });
});

/**
 * @type {{guild:Discord.Guild,footer:Object}}
 */
let options = { guild: undefined, footer: undefined };

module.exports = { COLORS, client, options, images };