const { getInvitation } = require("../modules/support");
const { getRole } = require("../service/config");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     */
    run: async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === "check") {
            const role = getRole("supporter");
            if (!role) return interaction.reply({ content: "Erreur inattendue.", ephemeral: true });

            if (interaction.member.roles.cache.has(role.id)) return interaction.reply({ content: "Vous êtes déjà supporteur !", ephemeral: true });

            const invitation = await getInvitation();
            const prefix = ["/", ".gg/", "discord.gg/"].map(a => a + invitation);

            const status = interaction.member.presence;
            if (status.activities.some(a => prefix.some(b => a.state.includes(b)))) {
                if (role) await interaction.member.roles.add(role);

                return interaction.reply({ content: "Merci pour votre soutiens ! Vous avez reçu le rôle " + role.toString() + ".", ephemeral: true });
            }
            else {
                return interaction.reply({ content: "Vous devez suivre les instructions pour devenir supporteur.", ephemeral: true });
            }
        }
    }
}