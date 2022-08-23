const { Client, ActivityType } = require("discord.js");
const { client, setGuild } = require("..");

module.exports = function () {
    console.log("Ready !");

    client.user.setActivity({ name: "le Sablier s’écouler", type: ActivityType.Watching });
    let guild = client.guilds.cache.get(process.env.GUILD_ID);

    if(!guild) throw new Error("Unfound guild.");

    setGuild(guild);
}