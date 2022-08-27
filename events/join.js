const { options } = require("../client");
const User = require("../models/user.model");
const { getInviter } = require("../service/inviter");

module.exports = {
    name: "guildMemberAdd",
    run: async function (member) {
        let exists = await User.exists(member.id);

        if (!exists) {
            let inviter = await getInviter();

            if (inviter) {
                const channel = options.guild.systemChannel;
                if (channel) channel.send(`<@${inviter}> a invité <@${member.id}> et a gagné **3000** Limon Noir !`);

                await User.addCoins(inviter, 3000);
            }
            await User.create(member.id);
        }
    }
}