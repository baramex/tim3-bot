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

    if (coins.value <= 0) throw new Error("Nombre de TSand invalide !");
    if (!member || member.user.bot) throw new Error("Membre invalide !");

    await User.addCoins(member.id, coins.value);

    interaction.reply("**" + member.user.tag + "** a bien reçu **" + coins.value + "** TSand.");
};

module.exports.info = {
    name: "ajotuer-coins",
    description: "permet d'ajouter des TSand à un membre.",
    category: "mod",
    options: [
        {
            name: "membre",
            description: "le membre à qui ajouter les TSand.",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "coins",
            description: "le nombre de TSand à ajouter.",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ]
};