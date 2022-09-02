const { ButtonStyle, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { options, client, COLORS } = require("../client");
const { getChannel, getRole } = require("../service/config");

async function updateSupport() {
    const channel = getChannel("support");
    if (channel) {

        const invitation = await getInvitation();

        const embed = new EmbedBuilder()
            .setColor(COLORS.casino)
            .setTitle(":hourglass_flowing_sand: | TIM€・Portez nos Couleurs !")
            .setFooter(options.footer)
            .setDescription(`Vous pouvez encore plus montrer votre Soutien à notre Serveur en ajoutant à votre profil le statut :\n\n/${invitation}\n.gg/${invitation}\ndiscord.gg/${invitation}\n\nCe geste vous accorderas un Grade Exclusif !`);

        const row = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder().setCustomId("check").setEmoji("❔").setLabel("Vérifier").setStyle(ButtonStyle.Success)
            );

        const message = (await channel.messages.fetch({ limit: 5 })).find(m => m.author.id == client.user.id);
        if (message) message.edit({ embeds: [embed], components: [row] });
        else channel.send({ embeds: [embed], components: [row] });
    }

    const role = getRole("support");
    if (role) {
        options.guild.members.cache.filter(a => a.roles.cache.has(role.id)).forEach(async member => {
            if (!await isSupport(member)) member.roles.remove(role);
        });
    }
}

async function isSupport(member) {
    const invitation = await getInvitation().catch(console.error);
    if(invitation) return;
    const prefix = ["/", ".gg/", "discord.gg/"].map(a => a + invitation);

    return member.presence.activities.some(a => prefix.some(b => a.state.includes(b)));
}

async function getInvitation() {
    const channel = getChannel("support");
    if (!channel) return;

    return options.guild.vanityURLCode || (await options.guild.invites.fetch()).find(a => a.inviterId === client.user.id)?.code || (await options.guild.invites.create(channel, { maxAge: 0, maxUses: 0 })).code;
}

module.exports = { updateSupport, getInvitation, isSupport };