const { ChannelType, AttachmentBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { COLORS, options } = require("../client");
const User = require("../models/user.model");
const { lootboxes, replayButton, closeButton, pickupReward } = require("../modules/lootbox");
const { convertMonetary } = require("../service/utils");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     */
    run: async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith("open-")) {
            const lootbox = lootboxes[interaction.customId.replace("open-", "")];

            if (await User.getMoney(interaction.user.id) < lootbox.price) return await interaction.reply({ content: "Vous n'avez pas assez d'argent pour ouvrir cette boite", ephemeral: true });

            await User.addCoins(interaction.user.id, -lootbox.price);

            if (interaction.channel.type !== ChannelType.GuildPublicThread) {
                var thread = await interaction.channel.threads.create({
                    name: lootbox.name,
                    autoArchiveDuration: 60,
                    type: ChannelType.GuildPublicThread
                });

                await interaction.channel.lastMessage?.delete();
                await thread.members.add(interaction.member.id);
                await interaction.reply({ content: "Ouverture créée: " + thread.toString(), ephemeral: true });
            }
            else {
                var message = interaction.message;
                await interaction.deferUpdate();
            }

            const data = {
                embeds: [new EmbedBuilder()
                    .setTitle(":hourglass_flowing_sand: | TIM€・" + lootbox.name)
                    .setColor(COLORS.casino)
                    .setFooter(options.footer)
                    .setDescription("Ouverture en cours...")
                    .setImage("attachment://counter.gif")
                ],
                files: [new AttachmentBuilder("./ressources/images/counter.gif", { name: "counter.gif" })],
                components: []
            };

            message = message ? await message.edit(data) : await thread.send(data);

            setTimeout(async () => {
                const reward = pickupReward(lootbox.rewards);

                await message.edit({ embeds: [data.embeds[0].setFields({ name: "Prix", value: `${convertMonetary(lootbox.price)} Limon Noirs` }).setDescription(":tada: :gift: Vous remportez **" + reward.name + "** !").setImage("attachment://lb.png").setThumbnail("attachment://reward.png")], files: [new AttachmentBuilder(reward.image, { name: "reward.png" }), new AttachmentBuilder(lootbox.image, { name: "lb.png" })], components: [new ActionRowBuilder().setComponents(replayButton(lootboxes.indexOf(lootbox)), closeButton(interaction.member.id))] }).catch(console.error);
                await reward.run(interaction.member, interaction).catch(console.error);
            }, 3000);
        }
        else if (interaction.customId.startsWith("lb-close-")) {
            const id = interaction.customId.replace("lb-close-", "");
            if (interaction.user.id === id) await interaction.channel?.delete().catch(console.error);
        }
    }
};