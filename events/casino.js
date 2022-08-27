const { ActionRowBuilder } = require("@discordjs/builders");
const { ModalBuilder, TextInputBuilder, TextInputStyle, ThreadChannel, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } = require("discord.js");
const { options, COLORS } = require("../client");
const User = require("../models/user.model");
const { games, closeButton } = require("../modules/casino");
const { getRole } = require("../service/config");
const { convertMonetary, durationTime } = require("../service/utils");

let cooldown = [];

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     */
    run: async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("play-")) {
            const game = games[interaction.customId.replace("play-", "")];

            const mise = await chooseBet(game, interaction);

            if (mise > 0) addCooldown(interaction.member.id, game.name, getCooldown(interaction.member));

            const thread = await interaction.channel.threads.create({
                name: "Table " + game.name,
                autoArchiveDuration: 60,
                type: ChannelType.GuildPublicThread
            });

            await interaction.channel.lastMessage.delete();
            await thread.members.add(interaction.member.id);
            await interaction.followUp({ content: "Table créée: " + thread.toString(), ephemeral: true })

            if (game.maxPlayers > 1) var { message, players } = await lobby(thread, game.name, game, interaction.member, mise);

            if (!players) players = [interaction.member];

            if (mise) players.forEach(p => User.addCoins(p.id || p.member.id, -mise));
            await game.run(thread, interaction.member, players, mise, message);
        }
        else if (interaction.customId.startsWith("casino-close-")) {
            const id = interaction.customId.replace("casino-close-", "");
            if (interaction.user.id === id) await interaction.channel.delete().catch(console.error);
        }
    }
};

async function chooseBet(game, interaction) {
    let id = "play-" + Date.now();
    const modal = new ModalBuilder().setTitle(game.name).setCustomId(id).setComponents(
        new ActionRowBuilder().setComponents(new TextInputBuilder().setRequired(false).setCustomId("mise").setLabel("Mise").setPlaceholder("Entrez une mise (" + convertMonetary(getMinBet(interaction.member)) + "-" + convertMonetary(getMaxBet(interaction.member)) + ")...").setStyle(TextInputStyle.Short))
    );

    interaction.showModal(modal);
    let submit = await interaction.awaitModalSubmit({ time: 1000 * 60 * 5, filter: m => m.customId == id });
    let mise = Number(submit.fields.getField("mise").value);

    if (mise && (mise < getMinBet(interaction.member) || mise > getMaxBet(interaction.member))) {
        submit.reply({ content: "La mise est incorrecte.", ephemeral: true });
        throw new Error();
    }

    let d = isCooldowned(interaction.member.id, game.name);
    if (mise && d) {
        submit.reply({ content: "Vous devez encore attendre **" + durationTime(d.end - Date.now()) + "** pour miser.", ephemeral: true });
        throw new Error();
    }

    if (await User.getMoney(interaction.member.id) < mise) {
        submit.reply({ content: "Vous n'avez pas assez d'argent !", ephemeral: true });
        throw new Error();
    }

    submit.deferUpdate();

    return mise;
}

/**
 * 
 * @param {ThreadChannel} thread 
 * @param {String} name 
 * @param {number} [mise] 
 * @returns 
 */
function lobby(thread, name, game, member, mise) {
    return new Promise(async (res, rej) => {
        var accepts = [];
        if (game.sameMise) accepts.push(member);
        else accepts.push({ member, mise });

        var miseTxt = "\n" + (game.sameMise ? mise ? "Mise: **" + convertMonetary(mise) + "** Limon Noir" : "Aucune mise." : "Mise personnelle.");

        var embed = new EmbedBuilder()
            .setColor(COLORS.casino)
            .setTitle(":hourglass_flowing_sand: | TIM€・" + name)
            .setFooter(options.footer)
            .setDescription(accepts.map(a => "**" + (a.member || a).user.username + "**" + (a.mise || a.mise === 0 ? ` (${convertMonetary(a.mise)})` : "")).join(", ") + " " + (accepts.length > 1 ? "ont" : "a") + " rejoint." + miseTxt);

        const message = await thread.send({
            embeds: [embed], components: [
                new ActionRowBuilder().setComponents([
                    new ButtonBuilder().setCustomId("start").setEmoji("⏯️").setLabel("Lancer").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId("join").setEmoji("✔️").setLabel("Rejoindre").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId("leave").setEmoji("🚪").setLabel("Quitter").setStyle(ButtonStyle.Danger),
                    closeButton(member.id)
                ])
            ]
        });

        var collector = message.createMessageComponentCollector({ filter: int => int.isButton(), time: 1000 * 60 * 5 });
        collector.on("collect", async collected => {
            var action = collected.customId;

            if (game.sameMise || action !== "join") collected.deferUpdate();

            if (action.startsWith("casino-close-")) return;

            if (action === "start" && collected.member.id === member.id) {
                collector.stop();
                return res({ players: accepts, message });
            }

            if (action === "join") {
                if (accepts.some(a => (a.id || a.member.id) === collected.member.id)) return;

                if (!game.sameMise) var m = await chooseBet(game, collected).catch(() => { });

                if (!game.sameMise && !m && m !== 0) return;

                accepts.push(m ? { member: collected.member, mise: m } : collected.member);
            }
            else if (action === "leave") {
                if (collected.member.id === member.id || !accepts.some(a => (a.id || a.member.id) === collected.member.id)) return;
                accepts = accepts.filter(a => (a.id || a.member.id) !== collected.user.id);
            }

            if (accepts.length >= game.maxPlayers) {
                collector.stop();
                res({ players: accepts, message });
                return;
            }

            embed.setDescription(accepts.map(a => "**" + (a.member || a).user.username + "**" + (a.mise || a.mise === 0 ? ` (${convertMonetary(a.mise)})` : "")).join(", ") + " " + (accepts.length > 1 ? "ont" : "a") + " rejoint." + miseTxt);

            await message.edit({
                embeds: [embed]
            });
        }).on("end", (collected, reason) => {
            if (reason == "time") {
                removeCooldown(member.id, name);
                res({ players: accepts, message });
            }
        });
    });
}

function removeCooldown(id, name) {
    var i = cooldown[name]?.findIndex(a => a.id == id);
    if (i != -1 && typeof i == "number" && !isNaN(i)) cooldown[name].splice(i, 1);
}

function addCooldown(id, name, time) {
    if (time <= 0) return;
    if (!cooldown[name]) cooldown[name] = [];
    cooldown[name].push({ id: id, end: new Date().getTime() + time * 60 * 1000 });
}

function getMinBet(member) {
    return member.roles.cache.has(getRole("grade-timelapse")?.id) ? 50 : member.roles.cache.has(getRole("grade-timeless")?.id) ? 0 : 100;
}

function getMaxBet(member) {
    return member.roles.cache.has(getRole("grade-timelapse")?.id) ? 100_000 : member.roles.cache.has(getRole("grade-timeless")?.id) ? 1_000_000_000 : 10_000;
}

function getCooldown(member) {
    return member.roles.cache.has(getRole("grade-timelapse")?.id) ? 1 : member.roles.cache.has(getRole("grade-timeless")?.id) ? 0 : 2;
}

function isCooldowned(id, name) {
    if (!cooldown[name]) return false;
    cooldown[name] = cooldown[name].filter(a => a.end > new Date().getTime());
    return cooldown[name].find(a => a.id == id);
}