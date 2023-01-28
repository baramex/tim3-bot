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

            const width = 950,
                height = 250;

            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = "#3b1036";
            ctx.strokeStyle = "#2d1033";
            ctx.lineWidth = 8;
            roundedRect(ctx, 4, 4, width - 8, height - 8, 10);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#1d122f";
            ctx.beginPath();
            ctx.arc(height * 0.45 + 15, height / 2, height * 0.45, 0, 2 * Math.PI, false);
            ctx.fill();

            var imgCanvas = createCanvas(height * 0.8, height * 0.8);
            var imgCtx = imgCanvas.getContext('2d');
            imgCtx.clearRect(0, 0, imgCtx.width, imgCtx.height);
            imgCtx.globalCompositeOperation = 'source-over';
            imgCtx.drawImage(await loadImage(member.user.avatarURL({ extension: "png", size: 128 })), 0, 0, height * 0.8, height * 0.8);
            imgCtx.fillStyle = '#fff';
            imgCtx.globalCompositeOperation = 'destination-in';
            imgCtx.beginPath();
            imgCtx.arc(height * 0.4, height * 0.4, height * 0.4, 0, 2 * Math.PI, true);
            imgCtx.closePath();
            imgCtx.fill();

            ctx.drawImage(imgCanvas, 15 + height * 0.05, height / 2 - height * 0.8 / 2, height * 0.8, height * 0.8);

            ctx.font = "60px arial";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ebc8db";
            ctx.fillText(member.user.username, height * 0.95 + 15 + 10 + 10, height / 4 * 3);

            ctx.fillStyle = "#ebc8db";
            ctx.font = "50px arial";
            ctx.fillText("Level " + lvl, height * 0.95 + 15 + 10, height / 2 - 50);

            var c = ["#FFD700", "#C0C0C0", "#b36700"];

            ctx.fillStyle = "rgba(50, 50, 50, 0.9)";
            ctx.beginPath();
            ctx.arc(height * 0.8, height * 0.75, height * 0.18, 0, 2 * Math.PI, false);
            ctx.fill();

            ctx.fillStyle = c[rank - 1] || "#ebc8db";
            ctx.font = (rank >= 10 ? (rank >= 100 ? "30" : "40") : "50") + "px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("#" + rank, height * 0.8, height * 0.75);

            ctx.fillStyle = "rgba(150, 150, 150, 0.6)";
            roundedRect(ctx, height * 0.95 + 15 + 10, height / 2 - 20, width - (height * 0.95 + 15 + 10) - 15, 30, 30);
            ctx.fill();

            ctx.fillStyle = "rgba(100, 19, 70, 0.9)";
            roundedRect(ctx, height * 0.95 + 15 + 10, height / 2 - 20, (width - (height * 0.95 + 15 + 10) - 15) * (exp / maxExp), 30, 30);
            ctx.fill();

            ctx.fillStyle = "#7b6e7e";
            ctx.font = "30px arial";
            ctx.textAlign = "right";
            var reducedME = reduce(maxExp);
            var l = ctx.measureText(reducedME + " XP");
            ctx.fillText(reducedME + " XP", width - 15, height / 2 - 47);
            ctx.fillText("/", width - 15 - l.width - 3, height / 2 - 47);

            ctx.fillStyle = "#ebc8db";
            ctx.textAlign = "right";
            ctx.font = "bold 30px arial";
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