const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const { COLORS, options } = require("../client");
const User = require("../models/user.model");
const { convertMonetary } = require("../service/utils");
const { createCanvas } = require("canvas");
const { getRole } = require("../service/config");
const { images } = require("..");

const items = [
    {
        icon: "https://cdn-icons-png.flaticon.com/512/567/567491.png",
        name: "Demande de Dossier Staff :card_box:",
        type: "divers",
        price: 100_000,
        description: "Le dossier staff permet de proposer sa candidature et d'avoir une chance d'intégrer l'équipe de modération du serveur TIM€.",
        available: async (member) => {
            let role = getRole("dossier-staff");
            if (!role) return false;
            if (member.roles.cache.has(role.id)) return false;

            return true;
        },
        reward: async (member) => {
            let role = getRole("dossier-staff");
            if (!role) return;

            member.roles.add(role);
        }
    },
    {
        icon: "https://www.e-monsite.com/medias/images/newsletter-02-1-.png",
        name: "Grade Perso Couleur :blue_circle:",
        type: "role",
        price: 500_000,
        description: "Le rôle personnalisé vous permet de changer la couleur de votre pseudo pour visuellement vous identifier.",
        available: async (member) => {
            return true;
        },
        reward: async (member) => {
            // modal -> color
        }
    },
    {
        icon: "https://cdn1.epicgames.com/salesEvent/salesEvent/EGS_Discord_Nitro_2560x1440_withlogo_2560x1440-944994658df3b04d0c4940be832da19e?h=270&resize=1&w=480",
        name: "Nitro discord 1 mois",
        type: "divers",
        price: 1_000_000,
        description: "Rien à dire de plus, un nitro discord d'une durée de 1 mois offert.",
        available: async (member) => {
            return true;
        },
        reward: async (member) => {
            // ticket
        }
    },
    {
        icon: "https://cdn1.epicgames.com/salesEvent/salesEvent/EGS_Discord_Nitro_2560x1440_withlogo_2560x1440-944994658df3b04d0c4940be832da19e?h=270&resize=1&w=480",
        name: "Grade TimeLapse",
        type: "role",
        price: 500_000_000,
        description: "Le grade TimeLapse vous est offert (voir salon nous-soutenir), sa valeur de base est 10€.",
        available: async (member) => {
            let role = getRole("grade-timelapse");
            if (!role) return false;
            if (member.roles.cache.has(role.id)) return false;

            return true;
        },
        reward: async (member) => {
            let role = getRole("grade-timelapse");
            if (!role) return;

            member.roles.add(role);
        }
    },
    {
        icon: "https://cdn1.epicgames.com/salesEvent/salesEvent/EGS_Discord_Nitro_2560x1440_withlogo_2560x1440-944994658df3b04d0c4940be832da19e?h=270&resize=1&w=480",
        name: "Grade TimeLess",
        type: "role",
        price: 1_000_000_000,
        description: "Le grade TimeLess vous est offert (voir salon nous-soutenir), sa valeur de base est 20€.",
        available: async (member) => {
            let role = getRole("grade-timeless");
            if (!role) return false;
            if (member.roles.cache.has(role.id)) return false;

            return true;
        },
        reward: async (member) => {
            let role = getRole("grade-timeless");
            if (!role) return;

            member.roles.add(role);
        }
    }
];

let works = [];

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     * @returns 
     */
    run: async function (interaction) {
        if (!interaction.isButton()) return; if (!interaction.isButton()) return;

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
            ctx.fillText(`${convertMonetary(money)} Limon Noir`, canvas.width / 2, canvas.height - 8);

            const embed = new EmbedBuilder()
                .setColor(COLORS.casino)
                .setTitle(":hourglass_flowing_sand: | TIM€・solde")
                .setFooter(options.footer)
                .setDescription("Vous avez **" + convertMonetary(money) + "** Limon Noir.")
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

                await interaction.reply({ ephemeral: true, content: "Vous avez récupéré **3000** Limon Noir, revenez dans **4 heures** pour récupérer vos nouveaux gains." });
            }
            else {
                await interaction.reply({ ephemeral: true, content: "Vous devez encore attendre **" + durationTime(work.end - Date.now()) + "**" });
            }
        }
        else if (interaction.customId == "shop") {
            function generateEmbed(i) {
                var item = items[i];
                if (!item) throw new Error("Item non trouvé !");

                var embed = new EmbedBuilder()
                    .setColor(COLORS.casino)
                    .setTitle(":hourglass_flowing_sand: | TIM€・shop")
                    .setFooter(options.footer)
                    .setDescription(item.name)
                    .setFields([
                        {
                            name: "Type",
                            value: item.type,
                            inline: true
                        },
                        {
                            name: "Prix",
                            value: convertMonetary(item.price) + " :coin:",
                            inline: true
                        },
                        {
                            name: "Description",
                            value: item.description
                        }
                    ])
                    .setThumbnail(item.icon);

                return embed;
            }

            async function generateNav(i) {
                var item = items[i];
                var ifp = items[i - 1] ? true : false;
                var ifa = items[i + 1] ? true : false;

                if (!item) throw new Error("Item non trouvé !");

                var larrow = new ButtonBuilder()
                    .setCustomId("left")
                    .setDisabled(!ifp)
                    .setEmoji("⬅️")
                    .setLabel((i + 1) + "/" + items.length)
                    .setStyle(ButtonStyle.Primary);

                var buy = new ButtonBuilder()
                    .setCustomId("buy")
                    .setDisabled((await User.getMoney(interaction.member.id) >= item.price && await item.available(interaction.member)) ? false : true)
                    .setEmoji("🛒")
                    .setLabel("Acheter (" + convertMonetary(item.price) + ")")
                    .setStyle(ButtonStyle.Success);

                var rarrow = new ButtonBuilder()
                    .setCustomId("right")
                    .setDisabled(!ifa)
                    .setEmoji("➡️")
                    .setLabel((i + 1) + "/" + items.length)
                    .setStyle(ButtonStyle.Primary);

                return new ActionRowBuilder().setComponents(larrow, buy, rarrow);
            }

            var index = 0;
            await interaction.reply({ embeds: [generateEmbed(index)], components: [await generateNav(index)], ephemeral: true });

            var replied = await interaction.fetchReply();

            var collector = replied.createMessageComponentCollector({ filter: int => int.isButton() && int.user.id == interaction.member.id, time: 1000 * 60 * 5 });
            collector.on("collect", async collected => {
                if (collected.customId == "left") {
                    index--;
                    collected.deferUpdate();
                }
                else if (collected.customId == "right") {
                    index++;
                    collected.deferUpdate();
                }
                else {
                    var item = items[index];
                    if (item) {
                        if (!await item.available(interaction.member)) return collected.reply({ content: "Ce produit n'est pas disponible.", ephemeral: true })

                        var c = await User.getMoney(interaction.member.id);
                        if (item.price > c) return collected.reply({ content: "Vous n'avez pas assez d'argent (" + convertMonetary(c) + ").", ephemeral: true });

                        await User.addCoins(interaction.member.id, -item.price);
                        try {
                            await item.reward(interaction.member);
                            collected.reply({ content: "Item acheté avec succès !", ephemeral: true });
                        } catch (error) {
                            collected.reply({ content: "Une erreur inattendue s'est produite durant l'achat.", ephemeral: true });
                        }
                    }
                }

                await interaction.editReply({ embeds: [generateEmbed(index)], components: [await generateNav(index)], ephemeral: true });
            }).on("end", (collected, reason) => {
                if (reason == "time") interaction.editReply({ content: "Interaction terminée, 5 minutes écoulées", components: [] }).catch(console.error);
            });
        }
    }
};