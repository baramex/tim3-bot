const { MessageType } = require("discord.js");
const User = require("../models/user.model");

module.exports = {
    name: "messageCreate",
    run: async function (message) {
        if (message.author.bot || ![MessageType.Default, MessageType.Reply].includes(message.type)) return;

        console.log(message.type);

        const levelup = await User.addExp(message.member, 50);

        if (levelup) {
            message.reply(levelup.passed == 1 ?
                `:clap: Vous prenez le temps d'obtenir un niveau supérieur: **${levelup.lvl}** et vous obtenez **${levelup.reward}** Limon Noir :hourglass_flowing_sand: !` :
                `:clap: Vous prenez le temps d'obtenir **${levelup.passed}** niveaux supérieurs: **${levelup.lvl}** et vous obtenez **${levelup.reward}** Limon Noir :hourglass_flowing_sand: !`);
        }

        await User.addCoins(message.author.id, 50);
    }
}