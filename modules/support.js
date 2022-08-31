const { ButtonStyle, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { options, client, COLORS } = require("../client");
const { getChannel } = require("../service/config");

async function updateSupport() {
    const channel = getChannel("support");
    if (!channel) return;

    const invitation = await getInvitation();

    const embed = new EmbedBuilder()
        .setColor(COLORS.casino)
        .setTitle(":hourglass_flowing_sand: | TIM€・Supporter le serveur")
        .setFooter(options.footer)
        .setDescription(`Pour nous soutenir et recevoir en échange recevoir des trucs, mettez \`/${invitation}\`, \`.gg/${invitation}\` ou \`discord.gg/${invitation}\` dans votre status`);

    const row = new ActionRowBuilder()
        .setComponents(
            new ButtonBuilder().setCustomId("check").setEmoji("❔").setLabel("Vérifier").setStyle(ButtonStyle.Success)
        );

    const message = (await channel.messages.fetch({ limit: 5 })).find(m => m.author.id == client.user.id);
    if (message) message.edit({ embeds: [embed], components: [row] });
    else channel.send({ embeds: [embed], components: [row] });
}

async function getInvitation() {
    const channel = getChannel("support");
    if (!channel) return;

    return options.guild.vanityURLCode || (await options.guild.invites.fetch()).find(a => a.inviterId === client.user.id)?.code || (await options.guild.invites.create(channel, { maxAge: 0, maxUses: 0 })).code;
}

module.exports = { updateSupport, getInvitation };