const { CommandInteraction, PermissionsBitField, AttachmentBuilder } = require("discord.js");
const Reward = require("../models/reward.model");

/**
 * 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports.run = async (interaction) => {
    const modo = interaction.member;

    if (!modo.permissions.has(PermissionsBitField.Flags.Administrator)) {
        throw new Error("Vous n'avez pas les permissions pour faire ça !");
    }

    const stream = await Reward.exportToCsv();
    const attachment = new AttachmentBuilder().setName("rewards.csv").setFile(stream);
    stream.on("finish", () => stream.end())

    interaction.reply({ content: "Voici votre fichier csv !", ephemeral: true, files: [attachment] });
};

module.exports.info = {
    name: "export-rewards",
    description: "permet d'exporter la liste des récompenses récoltés par les utilisateurs.",
    category: "mod",
    options: []
};