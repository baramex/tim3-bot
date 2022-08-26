const Lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { ChannelType } = require("discord.js");
const { options } = require("../client");

const config = Lowdb(new FileSync("./config.json"));
config.defaults({
    channels: [
        { event: "general", description: "Salon public de discussion générale, où seront envoyés les messages automatiques.", types: [ChannelType.GuildText] },
        { event: "banque", description: "Salon de la banque.", types: [ChannelType.GuildText] },
        { event: "niveau", description: "Salon du niveau/exp.", types: [ChannelType.GuildText] },
        { event: "casino", description: "Salon du casino", types: [ChannelType.GuildText] },
        { event: "tickets", description: "Salon public pour ouvrir des tickets.", types: [ChannelType.GuildText] },
        { event: "tickets-parent", description: "Catégorie privée où seront disposées les tickets.", types: [ChannelType.GuildCategory] },
        { event: "archives-tickets-parent", description: "Catégorie privée où seront disposées les tickets archivés.", types: [ChannelType.GuildCategory] }
    ], roles: [
        { type: "membre", description: "Rôle membre." },
        { type: "dossier-staff", description: "Rôle attribué aux membres qui achètent l'article Demande de Dossier Staff." },
        { type: "grade-timelapse", description: "Grade TimeLapse." },
        { type: "grade-timeless", description: "Grade TimeLess." },
    ],
    tickets: []
}).write();

function getChannel(name) {
    return options.guild.channels.cache.get(config.get("channels").find({ event: name }).value()?.id);
}

function getRole(name) {
    return options.guild.roles.cache.get(config.get("roles").find({ type: name }).value()?.id);
}

module.exports = { config, getChannel, getRole };