const { AttachmentBuilder } = require("discord.js");
const User = require("../models/user.model");
const { reduce } = require("../service/utils");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     * @returns 
     */
    run: async function (interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId == "level") {
            const member = interaction.member;

            const { exp, lvl } = await User.getLevel(member.id);
            const maxExp = User.getMaxExpFromLevel(lvl);
            const rank = await User.getRank(member.id);

            const background = await loadImage("./ressources/images/level.png");

            const width = 772,
                height = 228;

            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(background, 0, 0, width, height);

            ctx.strokeStyle = "rgba(23, 19, 70, .6)";
            ctx.lineWidth = 8;
            ctx.strokeRect(4, 4, width - 8, height - 8);

            /*ctx.fillStyle = "#1d122f";
            ctx.beginPath();
            ctx.arc(height * 0.45 + 15, height / 2, height * 0.45, 0, 2 * Math.PI, false);
            ctx.fill();*/

            var imgCanvas = createCanvas(height * 0.75, height * 0.75);
            var imgCtx = imgCanvas.getContext('2d');
            imgCtx.clearRect(0, 0, imgCtx.width, imgCtx.height);
            imgCtx.globalCompositeOperation = 'source-over';
            imgCtx.drawImage(await loadImage(member.user.avatarURL({ extension: "png", size: 128 })), 0, 0, height * 0.75, height * 0.75);
            imgCtx.fillStyle = '#fff';
            imgCtx.globalCompositeOperation = 'destination-in';
            imgCtx.beginPath();
            imgCtx.arc(height * 0.4, height * 0.4, height * 0.4, 0, 2 * Math.PI, true);
            imgCtx.closePath();
            imgCtx.fill();

            ctx.drawImage(imgCanvas, 130 - height * 0.75 / 2, 115 - height * 0.75 / 2);

            ctx.font = "54px arial";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ebc8db";
            ctx.fillText(member.user.username, 260, height / 4 * 3);

            ctx.fillStyle = "#ebc8db";
            ctx.font = "42px arial";
            ctx.fillText("Level " + lvl, 260, height / 2 - 50);

            var c = ["#FFD700", "#C0C0C0", "#b36700"];

            ctx.fillStyle = "rgba(45, 50, 140, 0.9)";
            ctx.beginPath();
            ctx.arc(height * 0.82, height * 0.77, 38, 0, 2 * Math.PI, false);
            ctx.fill();

            ctx.fillStyle = c[rank - 1] || "#ebc8db";
            ctx.font = (rank >= 10 ? (rank >= 100 ? "22" : "32") : "42") + "px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("#" + rank, height * 0.82, height * 0.77);

            ctx.fillStyle = "rgba(150, 150, 150, 0.6)";
            roundedRect(ctx, 260, height / 2 - 20, width - (260) - 15, 30, 30);
            ctx.fill();

            ctx.fillStyle = "rgba(100, 19, 70, 0.9)";
            roundedRect(ctx, 260, height / 2 - 20, (width - (260) - 15) * (exp / maxExp), 30, 30);
            ctx.fill();

            ctx.fillStyle = "#7b6e7e";
            ctx.font = "22px arial";
            ctx.textAlign = "right";
            var reducedME = reduce(maxExp);
            var l = ctx.measureText(reducedME + " XP");
            ctx.fillText(reducedME + " XP", width - 15, height / 2 - 47);
            ctx.fillText("/", width - 15 - l.width - 3, height / 2 - 47);

            ctx.fillStyle = "#ebc8db";
            ctx.textAlign = "right";
            ctx.font = "bold 22px arial";
            ctx.fillText(exp, width - 15 - l.width - 20, height / 2 - 47);

            const attach = new AttachmentBuilder(canvas.toBuffer(), "level.png");
            await interaction.reply({ files: [attach], ephemeral: true });
        }
    }
};

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