const { client, COLORS, options } = require("../client");
const { getChannel } = require("../service/config");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const { convertMonetary } = require("../service/utils");

const closeButton = (id) => new ButtonBuilder().setCustomId("lb-close-" + id).setEmoji("✖️").setLabel("Fermer").setStyle(ButtonStyle.Danger);
const closeButtonRow = (id) => new ActionRowBuilder().setComponents(closeButton(id));
const replayButton = (index) => new ButtonBuilder().setCustomId("open-" + index).setEmoji("🔁").setLabel("Réouvrir").setStyle(ButtonStyle.Primary);

const lootboxes = [];
fs.readdir("./lootboxes/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const lootbox = require(`../lootboxes/${file}`);
        lootboxes.push(lootbox);
    });
    lootboxes.sort((a, b) => a.price - b.price);
});

async function updateLootboxes() {
    const channel = getChannel("lootboxes");
    if (!channel) return;

    let messages = lootboxes.map((lootbox, i) => ({
        embeds: [new EmbedBuilder().setTitle(":hourglass_flowing_sand: | TIM€・" + lootbox.name).setColor(COLORS.casino).setFooter(options.footer).setImage("attachment://lb.png").setFields([
            { name: "Prix", value: convertMonetary(lootbox.price) + " Limon Noir", inline: true },
            { name: "Gains", value: lootbox.rewards.map(reward => `- ${reward.name}`).join("\n"), inline: true }
        ])],
        components: [new ActionRowBuilder().setComponents(new ButtonBuilder().setCustomId("open-" + i).setEmoji("🍀").setLabel("Ouvrir la boite").setStyle(ButtonStyle.Primary))],
        files: [new AttachmentBuilder().setFile(lootbox.image).setName("lb.png")]
    }));

    const fetchedMessages = (await channel.messages.fetch({ limit: 50 })).filter(m => m.author.id == client.user.id);
    messages.forEach(m => {
        const message = fetchedMessages.find(a => a.embeds[0]?.data.title === m.embeds[0].data.title);

        if (message) message.edit(m).catch(console.error);
        else channel.send(m).catch(console.error);
    });
}

function pickupReward(rewards) {
    let reward;
    const random = Math.random();
    for (const e of rewards) {
        if (random <= e.proba) {
            reward = e;
            break;
        }
    }
    if (!reward) reward = rewards.at(-1);

    return reward;
}

module.exports = { updateLootboxes, lootboxes, closeButton, closeButtonRow, replayButton, pickupReward };