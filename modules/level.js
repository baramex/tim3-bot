const { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { COLORS, options, client } = require("../client");
const User = require("../models/user.model");
const { getChannel } = require("../service/config");
const { reduce } = require("../service/utils");

async function updateLevel() {
    const channel = getChannel("niveau");
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor(COLORS.info)
        .setTitle(":hourglass_flowing_sand: | TIM€・Niveau")
        .setFooter(options.footer)
        .setDescription(
            `Il y a actuellement **${reduce(await User.totalExp())}** exp sur le serveur.\n\nLe niveau maximal est 1000, vous pouvez gagner de l'exp en envoyant des **messages** et en allant dans un **salon vocal**.\n\nClassement top 50:\n${(await User.top50Level()).map(({ id, lvl }, i) => `${[":first_place:", ":second_place:", ":third_place:", ":medal:", ":military_medal:"][i] || ""} \`${options.guild.members.cache.get(id).user.tag}\` | Niveau **${lvl}**`).join("\n")}`
        );

    const row = new ActionRowBuilder()
        .setComponents(
            new ButtonBuilder().setCustomId("level").setEmoji("📜").setLabel("Niveau").setStyle(ButtonStyle.Secondary),
        )

    const message = (await channel.messages.fetch({ limit: 5 })).find(m => m.author.id == client.user.id);
    if (message) message.edit({ embeds: [embed], components: [row] });
    else channel.send({ embeds: [embed], components: [row] });
}

module.exports = { updateLevel };