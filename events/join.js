const { options } = require("../client");
const User = require("../models/user.model");
const { getChannel } = require("../service/config");
const { getInviter } = require("../service/inviter");

module.exports = {
    name: "guildMemberAdd",
    run: async function (member) {
        let exists = await User.exists(member.id);

        if (!exists) {
            let inviter = await getInviter();

            if (inviter) {
                const channel = getChannel("invite-tracker");
                if (channel) channel.send(`<@${inviter}> a invité <@${member.id}> et a gagné **10'000** Limon Noir !`);

                await User.addCoins(inviter, 10000);
            }
            await User.create(member.id);
        }
    }
}