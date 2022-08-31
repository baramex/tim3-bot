const { options } = require("../client");
const User = require("../models/user.model");
const { updateBank } = require("../modules/bank");
const { updateCasino } = require("../modules/casino");
const { updateLevel } = require("../modules/level");
const { updateLootboxes } = require("../modules/lootbox");
const { updateSupport } = require("../modules/support");
const { updateTicket } = require("../modules/ticket");
const { config } = require("./config");

async function fastUpdate() {
    try {
        let roles = config.get("roles").map(a => { return { ...a, id: options.guild.roles.cache.get(a.id)?.id } });
        config.set("roles", roles.value()).write();

        let channels = config.get("channels").map(a => { return { ...a, id: options.guild.channels.cache.get(a.id)?.id } });
        config.set("channels", channels.value()).write();

        updateBank().catch(console.error);
        updateTicket().catch(console.error);
        updateLevel().catch(console.error);
        updateCasino().catch(console.error);
        updateLootboxes().catch(console.error);
        updateSupport().catch(console.error);
    } catch (error) {
        console.error(error);
    }
}

function update() {
    options.guild.members.cache.forEach(async m => {
        if (m.user.bot) return;

        let user = await User.exists(m.id).catch(console.error);
        if (!user) await User.create(m.id).catch(console.error);
    });
}

module.exports = { fastUpdate, update };