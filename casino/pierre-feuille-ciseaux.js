const { createCanvas } = require("canvas");
const { ButtonStyle, Colors, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ThreadChannel, ComponentType, AttachmentBuilder } = require("discord.js");
const { images } = require("..");
const { COLORS, options } = require("../client");
const User = require("../models/user.model");
const { closeButton, closeButtonRow, replayButton, games } = require("../modules/casino");
const { convertMonetary } = require("../service/utils");

module.exports = {
    name: "Pierre Feuille Ciseaux",
    rules: "Jouez contre vos amis ou contre le bot, au classic et fameux Chifoumi.",
    rewards: "Mise doublée",
    maxPlayers: 2,
    sameMise: true,
    image: "https://www.metacartes.cc/wp-content/uploads/2018/11/visuel_chifoumi_NB800_400.jpg",
    /**
     * 
     * @param {ThreadChannel} channel 
     * @param {*} players 
     * @param {*} mise 
     */
    run: async (channel, host, players, mise, message, game) => {
        let embed = new EmbedBuilder()
            .setColor(COLORS.casino)
            .setTitle(":hourglass_flowing_sand: | TIM€・Pierre Feuille Ciseaux")
            .setFooter(options.footer);

        const row = new ActionRowBuilder().setComponents([...[
            new ButtonBuilder().setCustomId("pierre").setEmoji("🪨").setLabel("Pierre").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("feuille").setEmoji("📄").setLabel("Feuille").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("ciseaux").setEmoji("✂️").setLabel("Ciseaux").setStyle(ButtonStyle.Primary)
        ].sort(() => Math.random() - 0.5), closeButton(host.id)]);

        if (!message) message = await channel.send({ components: [row] });
        else message.edit({ components: [row] });

        const signs = {};
        if (players.length === 1) signs.bot = ["pierre", "feuille", "ciseaux"][getRandomInt(0, 3)];

        while (Object.values(signs).length !== 2) {
            embed.setDescription("Choississez votre signe, en attente de **" + players.filter(a => !Object.keys(signs).includes(a.id)).map(a => a.user.username).join(", ") + "**." + (mise > 0 ? "\nMise: **" + convertMonetary(mise) + "** Limon Noir" : ""));
            await message.edit({ embeds: [embed] });

            const response = await message.awaitMessageComponent({ filter: m => players.some(a => a.id === m.user.id), componentType: ComponentType.Button, time: 1000 * 60 * 5 });
            if (!["pierre", "feuille", "ciseaux"].includes(response.customId)) return;

            signs[response.user.id] = response.customId;
            await response.deferUpdate();
        }

        const winner = checkWinner(signs[host.id], signs.bot || signs[players[1].id]);
        const winnerText = [host.user.username, players[1]?.user.username || "bot"][winner];

        if (mise) {
            if (players[winner]) await User.addCoins(players[winner]?.id, mise * 2);
            else if (winner === -1) players.forEach(p => User.addCoins(p.id, mise));
        }

        embed.setDescription("**" + signs[host.id] + "** (" + host.user.username + ") VS **" + (signs.bot || signs[players[1].id]) + "** (" + (players[1]?.user.username || "bot") + ")\n" + (winnerText ? "**" + winnerText + "** " : "personne n'") + "a gagné" + (mise && winnerText ? (players[1] || winner == 0 ? " **" + convertMonetary(mise * 2) + "** Limon Noir" : ", vous avez perdu **" + convertMonetary(mise) + "** Limon Noir") + (players[1] || winner === 0 ? " (" + convertMonetary(await User.getMoney(players[winner].id)) + ")" : "") : "") + ".");
        if (!players[1] && winner !== -1) embed.setColor(winner === 0 ? COLORS.valid : COLORS.error);
        embed.setImage("attachment://pfc.png");

        const attach = new AttachmentBuilder(generateCanvas(players, host, winner, signs).toBuffer(), { name: "pfc.png" });
        await message.edit({ embeds: [embed], components: [new ActionRowBuilder().setComponents(replayButton(games.indexOf(game)), closeButton(host.id))], files: [attach] });
    }
};

function generateCanvas(players, host, winner, signs) {
    const width = 500,
        height = 250;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = winner === 0 ? "#FFA500" : "#212121";
    roundedRect(ctx, 15, height / 2 - 80, 160, 160, 80);
    ctx.fill();
    ctx.fillStyle = winner === 1 ? "#FFA500" : "#212121";
    roundedRect(ctx, width - 15 - 160, height / 2 - 80, 160, 160, 80);
    ctx.fill();

    ctx.fillStyle = "#F3F3F3";
    roundedRect(ctx, 20, height / 2 - 75, 150, 150, 75);
    ctx.fill();
    roundedRect(ctx, width - 20 - 150, height / 2 - 75, 150, 150, 75);
    ctx.fill();

    ctx.font = "20px serif";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
    ctx.fillStyle = winner === 0 ? "#FFD700" : "#F3F3F3";
    ctx.fillText(host.user.username, 20 + 80, height / 2 - 85);
    ctx.fillStyle = winner === 1 ? "#FFD700" : "#F3F3F3";
    ctx.fillText(players[1]?.user.username || "bot", width - 20 - 80, height / 2 - 85);

    ctx.drawImage(images[signs[host.id]], 20 + 15, height / 2 - 60, 120, 120);
    ctx.drawImage(images[signs.bot || signs[players[1].id]], width - 20 - 120 - 15, height / 2 - 60, 120, 120);

    ctx.drawImage(images.versus, width / 2 - 52.5, height / 2 - 45, 105, 90);
    return canvas;
}

/**
 * 
 * @param {"pierre"|"feuille"|"ciseaux"} c1 
 * @param {"pierre"|"feuille"|"ciseaux"} c2 
 */
function checkWinner(c1, c2) {
    if (c1 == c2) return -1;

    if (c1 == "pierre") {
        if (c2 == "feuille") return 1;
        else return 0;
    }
    else if (c1 == "ciseaux") {
        if (c2 == "pierre") return 1;
        else return 0;
    }
    else {
        if (c2 == "ciseaux") return 1;
        else return 0;
    }
}

function roundedRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}