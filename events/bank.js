const { createCanvas } = require("canvas");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { images, COLORS, options } = require("..");
const User = require("../models/user.model");
const { convertMonetary, durationTime } = require("../service/utils");

let works = [];

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     * @returns 
     */
    run: async function (interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId == "bankrole") {
            const total = await User.totalMoney();
            const money = await User.getMoney(interaction.member.id) || 0;

            let width = images.hourglass1.width;
            let height = images.hourglass1.height;

            const canvas = createCanvas(width / (height / 500), 500);
            const ctx = canvas.getContext("2d");

            let pct = money / total;
            ctx.drawImage(images.hourglass1, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(images.hourglass2, 0, height * (1 - pct), width, height * pct, 0, canvas.height * (1 - pct), canvas.width, canvas.height * pct);

            ctx.fillStyle = "#FFAC33";
            ctx.textBaseline = "bottom";
            ctx.textAlign = "center";
            ctx.font = "30px OpenSans";
            ctx.fillText(`${convertMonetary(money)} TSand`, canvas.width / 2, canvas.height - 8);

            const embed = new EmbedBuilder()
                .setColor(COLORS.casino)
                .setTitle(":hourglass_flowing_sand: | TIM€・solde")
                .setFooter(options.footer)
                .setDescription("Vous avez **" + convertMonetary(money) + "** TSand.")
                .setImage("attachment://bank.png");

            await interaction.reply({ embeds: [embed], ephemeral: true, files: [new AttachmentBuilder(canvas.toBuffer("image/png"), { name: "bank.png" })] });
        }
        else if (interaction.customId == "work") {
            let work = works.find(w => w.id == interaction.member.id);
            if (!work) {
                works.push({ id: interaction.member.id, end: Date.now() + 4 * 60 * 60 * 1000 });

                await interaction.reply({ ephemeral: true, content: "Vous investissez dans le serveur, revenez dans **4 heures** pour récupérer vos gains." });
            }
            else if (work.end <= Date.now()) {
                work.end = Date.now() + (4 * 60 * 60 * 1000);

                User.addCoins(interaction.member.id, 3000);

                await interaction.reply({ ephemeral: true, content: "Vous avez récupéré **3000** TSand, revenez dans **4 heures** pour récupérer vos nouveaux gains." });
            }
            else {
                await interaction.reply({ ephemeral: true, content: "Vous devez encore attendre **" + durationTime(work.end - Date.now()) + "**" });
            }
        }
    }
};