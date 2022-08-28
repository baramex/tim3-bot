const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { COLORS, options } = require("../client");
const User = require("../models/user.model");
const { reduce } = require("../service/utils");
const { createCanvas } = require("canvas");
const { images } = require("../client");

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
            const level = await User.getLevel(interaction.member.id);

            let width = images.water.width;
            let height = images.water.height;

            const canvas = createCanvas(width / (height / 500), 500);
            const ctx = canvas.getContext("2d");

            let pct = Math.log2(level.lvl / 1000+1);
            let w = pct * (canvas.width - width / (height / 50)) + width / (height / 50);
            let h = pct * (canvas.height - 50) + 50;
            ctx.drawImage(images.water, 0, 0, width, height, canvas.width / 2 - w / 2, canvas.height / 2 - h / 2, w, h);

            const embed = new EmbedBuilder()
                .setColor(COLORS.info)
                .setTitle(":hourglass_flowing_sand: | TIM€・Niveau")
                .setFooter(options.footer)
                .setDescription("Vous êtes au niveau **" + level.lvl + "** avec **" + reduce(level.exp) + "**/1000 exp.")
                .setImage("attachment://bank.png");

            await interaction.reply({ embeds: [embed], ephemeral: true, files: [new AttachmentBuilder(canvas.toBuffer("image/png"), { name: "bank.png" })] });
        }
    }
};