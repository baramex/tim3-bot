const { client, COLORS, options } = require("..");
const { getChannel } = require("../service/config");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const User = require("../models/user.model");
const { convertMonetary } = require("../service/utils");

async function updateBank() {
    const channel = getChannel("banque");
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor(COLORS.casino)
        .setTitle(":hourglass_flowing_sand: | TIM€・banque")
        .setFooter(options.footer)
        .setDescription(
            `Il y a actuellement **${convertMonetary(await User.totalMoney())}** TSand sur le serveur.

            Classement top 5:
            ${(await User.top5()).map(({ id, coins }, i) => `${[":first_place:", ":second_place:", ":third_place:", ":medal:", ":military_medal:"][i]} \`${options.guild.members.cache.get(id).user.tag}\` | **${convertMonetary(coins)}** TSand`).join("\n")}
            `
        );

    const row = new ActionRowBuilder()
    .setComponents(
        new ButtonBuilder().setCustomId("bankrole").setEmoji("💰").setLabel("Solde").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("work").setEmoji("📈").setLabel("Invest").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("shop").setEmoji("🛒").setLabel("Magasin").setStyle(ButtonStyle.Secondary)
    )

    const message = (await channel.messages.fetch()).find(m => m.author.id == client.user.id);
    if (message) message.edit({ embeds: [embed], components: [row] });
    else channel.send({ embeds: [embed], components: [row] });
}

module.exports = { updateBank };