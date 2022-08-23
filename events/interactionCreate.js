const { client } = require("..");

/**
 * 
 * @param {import("discord.js").Interaction} interaction 
 * @returns 
 */
module.exports = async function (interaction) {
    if (!interaction.isCommand()) return;

    var cmd = client.commands.get(interaction.commandName);
    try {
        if (cmd) await cmd.run(interaction);
    }
    catch (err) {
        console.error("COMMAND ERROR", "Commande name: ", interaction.commandName, "Arguments: ", interaction.options.data.map(a => `${a.name}: ${a.value}`).join(" - "), "Error: ", err);
        interaction.reply({ content: err.message || "Erreur inattendue.", ephemeral: true });
    }
};