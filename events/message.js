const User = require("../models/user.model");

module.exports = {
    name: "messageCreate",
    run: async function (message) {
        if (message.author.bot) return;

        var exp = Math.round(Math.sqrt(Math.sqrt(message.content.length)) * 6);
        const levelup = await User.addExp(message.author.id, exp);

        if (levelup) {
            message.reply(`:clap: Vous prenez le temps d'obtenir un niveau supérieur: **${levelup}** :hourglass_flowing_sand: !`);
        }

        await User.addCoins(message.author.id, Math.min(Math.floor(Math.sqrt(Math.sqrt(message.content.length)) * 25), 70));
    }
}