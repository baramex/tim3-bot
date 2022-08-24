const Lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { ChannelType } = require("discord.js");
const { options } = require("..");

const config = Lowdb(new FileSync("./config.json"));
config.defaults({
    channels: [
        { event: "general", description: "Salon public de discussion générale.", types: [ChannelType.GuildText] },
        { event: "banque", description: "Salon de banque.", types: [ChannelType.GuildText] }
    ], roles: [
        { type: "member", description: "Rôle membre." }
    ]
}).write();

function getChannel(name) {
    return options.guild.channels.cache.get(config.get("channels").find({ event: name }).value()?.id);
}

module.exports = { config, getChannel };