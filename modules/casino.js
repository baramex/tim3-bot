const { client, COLORS, options } = require("../client");
const { getChannel } = require("../service/config");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");

const closeButton = (id) => new ButtonBuilder().setCustomId("casino-close-" + id).setEmoji("✖️").setLabel("Fermer").setStyle(ButtonStyle.Danger);
const closeButtonRow = (id) => new ActionRowBuilder().setComponents(closeButton(id));
const replayButton = (index) => new ButtonBuilder().setCustomId("play-" + index).setEmoji("🔁").setLabel("Rejouer").setStyle(ButtonStyle.Primary);
const replaySameBetButton = (index, bet) => new ButtonBuilder().setCustomId("play-" + index + "-" + bet).setEmoji("🔁").setLabel("Rejouer avec la même mise").setStyle(ButtonStyle.Primary);

const games = [];
fs.readdir("./casino/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const game = require(`../casino/${file}`);
        games.push(game);
    });
});

async function updateCasino() {
    const channel = getChannel("casino");
    if (!channel) return;

    let messages = games.map((game, i) => ({
        embeds: [new EmbedBuilder().setTitle(":hourglass_flowing_sand: | TIM€・" + game.name).setColor(COLORS.casino).setFooter(options.footer).setThumbnail(game.image).setFields([
            { name: "Règles", value: game.rules, inline: true },
            { name: "Gains", value: game.rewards, inline: true },
            { name: "Nombre de joueur max", value: game.maxPlayers + " Joueur" + (game.maxPlayers > 1 ? "s" : ""), inline: true },
            { name: "Mise", value: game.sameMise ? "Collective" : "Individuelle", inline: true },
        ])],
        components: [new ActionRowBuilder().setComponents(new ButtonBuilder().setCustomId("play-" + i).setEmoji("🎫").setLabel("Ouvrir une table").setStyle(ButtonStyle.Primary))]
    }));

    const fetchedMessages = (await channel.messages.fetch({ limit: 50 })).filter(m => m.author.id == client.user.id);
    messages.forEach(m => {
        const message = fetchedMessages.find(a => a.embeds[0]?.data.title === m.embeds[0].data.title);

        if (message) message.edit(m).catch(console.error);
        else channel.send(m).catch(console.error);
    });
}

module.exports = { updateCasino, games, closeButton, closeButtonRow, replayButton, replaySameBetButton };