const { CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionsBitField } = require("discord.js");
const User = require("../models/user.model");

/**
 * 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports.run = async (interaction) => {
    let modo = interaction.member;

    if (!modo.permissions.has(PermissionsBitField.Flags.Administrator)) {
        throw new Error("Vous n'avez pas les permissions pour faire ça !");
    }

    const message = await interaction.reply({
        content: ":warning: Êtes-vous sûr de vouloir wipe le seveur, cela supprimera toute l'avancé de tous les membres ?", components: [
            new ActionRowBuilder().setComponents(
                new ButtonBuilder().setCustomId("yes").setEmoji("✔️").setLabel("Oui").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("no").setEmoji("✖️").setLabel("Non").setStyle(ButtonStyle.Success),
            )
        ]
    });

    const res = await message.awaitMessageComponent({ time: 1000 * 60, componentType: ComponentType.Button });

    await res.deferUpdate();
    if (res.customId === "no") return await interaction.editReply({ content: "Wipe annulé :white_check_mark:", components: [] });
    else if (res.customId === "yes") {
        await User.wipe();

        await interaction.editReply({ content: "Wipe effectué :white_check_mark:", components: [] });
    }
};

module.exports.info = {
    name: "wipe",
    description: "permet de supprimer TOUS les niveaux et TOUTES la monnaie du serveur.",
    category: "mod"
};