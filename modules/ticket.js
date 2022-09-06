const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SelectMenuBuilder, ChannelType, TextChannel, GuildMember, Interaction, Message, MessageType } = require("discord.js");
const { options, COLORS, client } = require("../client");
const { getChannel, config } = require("../service/config");

/**
 * 
 * @param {Discord.ButtonInteraction} interaction 
 * @returns 
 */
async function deleteReport(interaction, definitely = false) {
    if (interaction.channel.name.split("-").length != 2) return;
    var parent = getChannel("archives-tickets-parent");
    if (parent && !definitely) {
        await interaction.update({});
        await interaction.message.edit({ components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("delete_ticket").setStyle(ButtonStyle.Danger).setEmoji("🗑️").setLabel("Supprimer définitivement"))] }).catch(console.error);
        var index = (Number(options.guild.channels.cache.filter(a => a.parentId == parent.id).sort((a, b) => Number(b.name.split("-")[0]) - Number(a.name.split("-")[0])).at(0)?.name?.split("-")[0]) + 1) || 1;
        await interaction.channel.setParent(parent);
        await interaction.channel.setName(String(index).padStart(3, "0") + "-" + interaction.channel.name.split("-")[1]);
    }
    else if (parent && interaction.member.permissions.has("ADMINISTRATOR")) {
        await interaction.channel.delete().catch(console.error);
    }
    else interaction.reply({ content: "Vous n'avez pas les permissions !", ephemeral: true }).catch(console.error);
}

/**
 * 
 * @param {GuildMember} member 
 * @param {string} type 
 * @param {Interaction} interaction 
 * @returns {Promise<TextChannel>}
 */
async function createReport(member, type, interaction, forceSize = false) {
    var c = getChannel("tickets-parent");
    if (!c) return;

    var n = 1;
    var channels = options.guild.channels.cache.filter(a => a.parentId == c.id);
    if (channels.size > 0) {
        var memberChannels = channels.filter(a => a.name.split("-")[1] == member.id);
        if (memberChannels.size >= 2 && !forceSize) {
            return interaction.replied ? interaction.followUp({ content: ":x: Vous ne pouvez pas créer plus de 2 tickets !", ephemeral: true }) : interaction.reply({ content: ":x: Vous ne pouvez pas créer plus de 2 tickets !", ephemeral: true });
        }

        n = Number(channels.sort((a, b) => Number(b.name.split("-")[0]) - Number(a.name.split("-")[0])).first().name.split("-")[0]) + 1;
    }

    const cha = await options.guild.channels.create({ name: n.toString().padStart(3, "0") + "-" + member.id, type: ChannelType.GuildText, parent: c })
    await cha.lockPermissions().catch(console.error);
    await cha.permissionOverwrites.create(member, { ViewChannel: true });
    await cha.send({
        embeds: [new EmbedBuilder().setColor(COLORS.info)
            .setTitle(":hourglass_flowing_sand: | TIM€・Ticket")
            .setFooter(options.footer)
            .addFields([{ name: "Index", value: n.toString().padStart(3, "0") || "erreur", inline: true },
            { name: "Membre", value: "<@" + member.id + ">", inline: true },
            { name: "Type", value: type || "sans type", inline: true }
            ])
            .setThumbnail(member.user.displayAvatarURL())
        ],
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('archive_ticket')
            .setLabel('Archiver le ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🕒"))]
    });

    
    (interaction.replied || interaction.deferred) ? await interaction.followUp({ content: ":white_check_mark: Ticket créé <#" + cha.id + "> !", ephemeral: true }).catch(console.error) : await interaction.reply({ content: ":white_check_mark: Ticket créé <#" + cha.id + "> !", ephemeral: true }).catch(console.error);
    if (interaction.message && interaction.message.type === MessageType.Default) await interaction.message.edit({}).catch(console.error);

    return cha;
}

async function updateTicket() {
    const channel = getChannel("tickets");
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor(COLORS.info)
        .setTitle(":hourglass_flowing_sand: | TIM€・Ouvrir Un Ticket")
        .setFooter(options.footer)
        .setDescription(":warning: Avez-vous un problème ? Ou voulez-vous nous demander quelque chose ?\nTout abus sera sanctionné.");

    const selectorOptions = config.get("tickets").value()?.map((a, i) => { return { label: a, value: i + "_" }; }) || [];
    selectorOptions.push({ label: "Autre", value: -1 + "_" });

    const menu = new SelectMenuBuilder()
        .setCustomId("ticket_type")
        .setPlaceholder("Sélectionnez le type de ticket")
        .addOptions(selectorOptions);
    const button = new ButtonBuilder()
        .setCustomId('ticket_open')
        .setLabel('Ouvrir un ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji("📩");

    const msg = (await channel.messages.fetch({ limit: 5 })).find(m => m.author.id == client.user.id);
    if (!msg) await channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu), new ActionRowBuilder().addComponents(button)] }).catch(console.error);
    else await msg.edit({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu), new ActionRowBuilder().addComponents(button)] }).catch(console.error);
}

module.exports = { createReport, deleteReport, updateTicket };