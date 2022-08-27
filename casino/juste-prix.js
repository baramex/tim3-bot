const { ButtonStyle, Colors, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ThreadChannel, ComponentType, GuildMember, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { COLORS, options } = require("../client");
const User = require("../models/user.model");
const { closeButton, closeButtonRow } = require("../modules/casino");
const { convertMonetary } = require("../service/utils");

module.exports = {
    name: "Juste Prix",
    rules: "Deviner un nombre généré aléatoirement entre 1 et 100 en seulement 5 essais, le bot vous dira plus ou moins.",
    rewards: "Mise quadruplée",
    maxPlayers: 1,
    sameMise: true,
    image: "https://upload.wikimedia.org/wikipedia/fr/0/0e/Logo_Juste_Prix_%282015%29.jpg",
    /**
     * 
     * @param {ThreadChannel} channel 
     * @param {GuildMember} players 
     * @param {GuildMember[]} players 
     * @param {number} mise 
     */
    run: async (channel, host, players, mise) => {
        let embed = new EmbedBuilder()
            .setColor(COLORS.casino)
            .setTitle(":hourglass_flowing_sand: | TIM€・Juste Prix")
            .setFooter(options.footer)

        const row = new ActionRowBuilder().setComponents([
            new ButtonBuilder().setCustomId("select").setEmoji("➕").setLabel("Sélectionner").setStyle(ButtonStyle.Primary),
            closeButton
        ]);

        const modal = new ModalBuilder()
            .setTitle("Juste Prix")
            .setComponents(new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId("price").setLabel("Prix").setStyle(TextInputStyle.Short).setRequired(true)));

        const message = await channel.send({ components: [row] });

        let price = getRandomInt(1, 101);
        let tries = 5;

        let tr;
        while (tries > 0 && tr !== price) {
            embed.setDescription(`Entrez un nombre en 1 et 100 inclus pour deviner le prix en **${tries}** essaies.\n${mise ? `Mise: **${convertMonetary(mise)}** Limon Noir` : ""}\n${tr ? `Dernier essai: prix ${price < tr ? "<" : ">"} ${tr}` : ""}`);
            message.edit({ embeds: [embed] });

            const id = "select-" + Date.now();
            modal.setCustomId(id);
            const response = await message.awaitMessageComponent({ filter: m => m.member.id === host.id, componentType: ComponentType.Button, time: 1000 * 60 * 5 });
            if (response.customId === "select") {
                response.showModal(modal);
                const submit = await response.awaitModalSubmit({ time: 1000 * 60 * 5, filter: m => m.customId === id });
                let btr = tr;
                tr = Number.parseInt(submit.fields.getField("price").value);
                if (!tr || tr < 1 || tr > 100 || Math.round(tr) != tr) {
                    submit.reply({ content: "L'estimation doit être comprise entre 1 et 100.", ephemeral: true });
                    tr = btr;
                    continue;
                }
                if (tr === price) {
                    submit.deferUpdate();
                    break;
                }
                submit.reply({ content: `Le prix est **${price > tr ? "supérieur" : "inférieur"}** à ${tr}`, ephemeral: true });
                tries--;
            }
        }

        if (tr === price) {
            await User.addCoins(host.id, mise * 4);
            embed.setDescription("Vous avez gagné " + (mise ? ("**" + convertMonetary(mise * 4) + "** Limon Noir (" + convertMonetary(await User.getMoney(host.id)) + ")") : "") + "!!! Le prix était: **" + price + "**.");
            embed.setColor(COLORS.valid);
        }
        else {
            embed.setDescription("Vous avez perdu" + (mise ? " **" + mise + "** Limon Noir" : "") + "... Le prix était: **" + price + "**.");
            embed.setColor(COLORS.error);
        }

        message.edit({ embeds: [embed], components: [closeButtonRow] });
    }
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}