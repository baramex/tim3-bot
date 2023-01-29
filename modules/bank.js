const { client, COLORS, options } = require("../client");
const { getChannel } = require("../service/config");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const User = require("../models/user.model");
const { convertMonetary } = require("../service/utils");

async function updateBank() {
    const channel = getChannel("banque");
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor(COLORS.casino)
        .setTitle(":hourglass_flowing_sand: | TIM€・Banque")
        .setFooter(options.footer)
        .setDescription(
            `Il y a actuellement **${convertMonetary(await User.totalMoney())}** Limon Noir sur le serveur.\n\nVous pouvez gagnez de des Limon Noir en envoyant des **messages**, en allant dans un **salon vocal**, en cliquant sur le bouton **invest** ainsi qu'en jouant au **casino**. Si vous **invitez** 1 personne, vous gagnez 30'000 Limon Noir !\n\nClassement top 50:\n${(await User.top50Money()).map(({ id, coins }, i) => `${[":first_place:", ":second_place:", ":third_place:", ":medal:", ":military_medal:"][i] || ""} \`${options.guild.members.cache.get(id).user.tag}\` | **${convertMonetary(coins)}** Limon Noir`).join("\n")}
            `
        );

    const row = new ActionRowBuilder()
        .setComponents(
            new ButtonBuilder().setCustomId("bankrole").setEmoji("💰").setLabel("Solde").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("work").setEmoji("📈").setLabel("Invest").setStyle(ButtonStyle.Primary)
        );

    const attachment = new AttachmentBuilder().setFile("./ressources/images/bank.gif").setName("bank.gif");

    const messages = (await channel.messages.fetch({ limit: 5 })).filter(m => m.author.id == client.user.id);

    const secondMessage = messages.at(1);
    if (secondMessage) secondMessage.edit({ files: [attachment], components: [row], embeds: [] });
    else await channel.send({ files: [attachment], components: [row], embeds: [] });

    const firstMessage = messages.at(0);
    if (firstMessage) firstMessage.edit({ embeds: [embed], files: [], components: [] });
    else await channel.send({ embeds: [embed], files: [], components: [] });
}

module.exports = { updateBank };