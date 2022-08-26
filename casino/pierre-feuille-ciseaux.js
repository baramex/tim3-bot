const { ButtonStyle, Colors, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ThreadChannel, ComponentType } = require("discord.js");
const { COLORS, options } = require("../client");
const User = require("../models/user.model");
const { closeButton, closeButtonRow } = require("../modules/casino");
const { convertMonetary } = require("../service/utils");

module.exports = {
    name: "Pierre Feuille Ciseaux",
    rules: "Jouez contre vos amis ou contre le bot, au classic et fameux Chifoumi.",
    rewards: "Mise doublée",
    maxPlayers: 2,
    sameMise: true,
    image: "https://www.metacartes.cc/wp-content/uploads/2018/11/visuel_chifoumi_NB800_400.jpg",
    /**
     * 
     * @param {ThreadChannel} channel 
     * @param {*} players 
     * @param {*} mise 
     */
    run: async (channel, host, players, mise) => {
        let embed = new EmbedBuilder()
            .setColor(COLORS.casino)
            .setTitle(":hourglass_flowing_sand: | TIM€・Pierre Feuille Ciseaux")
            .setFooter(options.footer)
            .setDescription("Choississez votre signe." + (mise > 0 ? "\nMise: **" + convertMonetary(mise) + "** Limon Noir" : ""));

        const row = new ActionRowBuilder().setComponents([...[
            new ButtonBuilder().setCustomId("pierre").setEmoji("🪨").setLabel("Pierre").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("feuille").setEmoji("📄").setLabel("Feuille").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("ciseaux").setEmoji("✂️").setLabel("Ciseaux").setStyle(ButtonStyle.Primary)
        ].sort(() => Math.random() - 0.5), closeButton]);

        const message = await channel.send({ embeds: [embed], components: [row] });

        const signs = {};
        if (players.length === 1) signs.bot = ["pierre", "feuille", "ciseaux"][getRandomInt(0, 3)];

        while (Object.values(signs).length !== 2) {
            const response = await channel.awaitMessageComponent({ filter: m => m.member.id === host.id, componentType: ComponentType.Button, message, time: 1000 * 60 * 5 });
            if (!["pierre", "feuille", "ciseaux"].includes(response.customId)) return;

            signs[response.user.id] = response.customId;
            response.deferUpdate();
        }

        console.log(signs);
    }
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}