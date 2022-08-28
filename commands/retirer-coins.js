const { CommandInteraction, ApplicationCommandOptionType } = require("discord.js");
const User = require("../models/user.model");
const { convertMonetary } = require("../service/utils");

/**
 * 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports.run = async (interaction) => {
    let modo = interaction.member;

    if (!modo.permissions.has("ADMINISTRATOR")) {
        throw new Error("Vous n'avez pas les permissions pour faire ça !");
    }

    let member = interaction.options.getMember("membre");
    let coins = interaction.options.get("coins", true);

    if (coins.value <= 0) throw new Error("Nombre de Limon Noir invalide !");
    if (!member || member.user.bot) throw new Error("Membre invalide !");
    if (await User.getMoney(member.id) < coins.value) throw new Error("Le membre n'a pas assez de Limon Noir !");

    await User.addCoins(member.id, -coins.value);

    interaction.reply("**" + convertMonetary(coins.value) + "** Limon Noir ont été retirés à **" + member.toString() + "**.");
};

module.exports.info = {
    name: "retirer-coins",
    description: "permet de retirer des Limon Noir à un membre.",
    category: "mod",
    options: [
        {
            name: "membre",
            description: "le membre à qui retirer les Limon Noir.",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "coins",
            description: "le nombre de Limon Noir à retirer.",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ]
};