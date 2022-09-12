const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const Reward = require("../models/reward.model");
const User = require("../models/user.model");
const { produces, api, regexId } = require("../modules/sellix");
const { getRole } = require("../service/config");
const { convertMonetary } = require("../service/utils");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     */
    run: async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === "purchase") {
            const modalId = "purchase-" + Date.now();
            const modal = new ModalBuilder()
                .setComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("id").setLabel("L'id de la commande (par email)").setMinLength(24).setMaxLength(24).setRequired(true).setStyle(TextInputStyle.Short).setPlaceholder("123abc-12345abcde-123abc")))
                .setCustomId(modalId)
                .setTitle("Validation soutien");

            interaction.showModal(modal);

            const submit = await interaction.awaitModalSubmit({ time: 1000 * 60 * 10, filter: m => m.customId === modalId });

            try {
                const id = submit.fields.getField("id").value;
                if (!regexId.test(id)) throw new Error("L'id de la commande doit être sous la forme de `123abc-12345abcde-123abc`.");

                await api.getOrder(id).then(async invoice => {
                    if (!invoice || !invoice.product) throw new Error("La commande est introuvable, assurez-vous d'avoir bien copié l'id. (ex: `123abc-12345abcde-123abc`)");

                    if (invoice.status !== "COMPLETE") throw new Error("La commande n'est pas encore terminée, veuillez réessayer plus tard.");

                    const product = produces.find(a => a.id === invoice.product.uniqid);
                    if (!product) throw new Error("Produit introuvable.");

                    const reward = await Reward.getByOrderId(id);
                    if (reward) throw new Error("La commande a déjà été récompensée.");

                    const date = new Date(invoice.created_at + "000");
                    if (new Date().getTime() - date.getTime() > 1000 * 60 * 60 * 24 * 14) throw new Error("La commande est expirée, vous pouvez faire un ticket en cas de problème.");

                    if (product.type === "money") {
                        await User.addCoins(interaction.user.id, product.value);

                        submit.reply({ content: ":white_check_mark: Vous avez reçu **" + convertMonetary(product.value) + "** sur votre compte !\nMerci pour votre soutien ! :blush:", ephemeral: true });
                    }
                    else if (product.type === "grade") {
                        const role = getRole(product.value);
                        if (!role) throw new Error();

                        if (interaction.member.roles.cache.has(role.id)) throw new Error("Vous avez déjà ce grade.");

                        await interaction.member.roles.add(role);

                        submit.reply({ content: ":white_check_mark: Vous avez reçu le grade **" + product.value + "** !\nMerci pour votre soutien ! :blush:", ephemeral: true });
                    }
                    await Reward.create(interaction.user.id, id, product.id);
                });
            } catch (error) {
                console.error(error);
                submit.reply({ content: ":x: " + error.message, ephemeral: true });
            }
        }
    }
}