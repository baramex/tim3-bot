const User = require("../models/user.model");

module.exports = async function (message) {
    if (message.author.bot) return;

    var exp = Math.round(Math.sqrt(Math.sqrt(message.content.length)) * 6);
    const levelup = await User.addExp(message.author.id, exp);

    if (levelup) {
        message.reply(`:clap: Vous avancez dans le temps et passez au niveau **${levelup}** :hourglass_flowing_sand: !`);
    }
}