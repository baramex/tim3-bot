const { client } = require("../client");
const { getChannel } = require("../service/config");
const {  ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");

async function updateShop() {
    const channel = getChannel("shop");
    if (!channel) return;

    const row = new ActionRowBuilder()
        .setComponents(
            new ButtonBuilder().setCustomId("shop").setEmoji("🛒").setLabel("Magasin").setStyle(ButtonStyle.Secondary)
        );

    const attachment = new AttachmentBuilder().setFile("./ressources/images/shop.gif").setName("shop.gif");

    const message = (await channel.messages.fetch({ limit: 5 })).find(m => m.author.id == client.user.id);
    if (message) message.edit({ files: [attachment], components: [row] });
    else channel.send({ files: [attachment], components: [row] });
}

module.exports = { updateShop };