const { CommandInteraction, ApplicationCommandOptionType, PermissionsBitField } = require("discord.js");
const { getRole } = require("../service/config");

/**
 * 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports.run = async (interaction) => {
    const modo = interaction.member;

    if (!modo.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        throw new Error("Vous n'avez pas les permissions pour faire ça !");
    }

    const member = interaction.options.getMember("membre");
    const role = getRole("grade-timeless");
    if (!role) return interaction.reply({ content: "Le rôle Timeless n'existe pas !", ephemeral: true });
    if (member.roles.cache.has(role.id)) return interaction.reply({ content: "Le membre a déjà le rôle Timeless !", ephemeral: true });

    await member.roles.add(role);
    interaction.reply("**" + member.toString() + "** a bien reçu le grade **timeless**.");
};

module.exports.info = {
    name: "ajouter-timeless",
    description: "permet d'ajouter le grade timeless à un membre.",
    category: "mod",
    options: [
        {
            name: "membre",
            description: "le membre à qui ajouter le grade.",
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ]
};