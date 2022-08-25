const { CommandInteraction, ApplicationCommandOptionType } = require("discord.js");
const User = require("../models/user.model");

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

    await User.addCoins(member.id, coins.value);

    interaction.reply("**" + member.user.tag + "** a bien reçu **" + coins.value + "** Limon Noir.");
};

module.exports.info = {
    name: "ajouter-coins",
    description: "permet d'ajouter des Limon Noir à un membre.",
    category: "mod",
    options: [
        {
            name: "membre",
            description: "le membre à qui ajouter les Limon Noir.",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "coins",
            description: "le nombre de Limon Noir à ajouter.",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ]
};