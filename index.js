const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");
require("dotenv").config();
require("./service/database").init();
require("./service/schedule").init();

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
 * @type {Discord.Guild}
 */
let guild;
function setGuild(guild_) {
    guild = guild_;
}

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

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
    });
});

client.login(process.env.BOT_TOKEN);

module.exports = { client, guild, setGuild };