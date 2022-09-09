const { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ThreadChannel, ComponentType } = require("discord.js");
const { COLORS, options } = require("../client");
const User = require("../models/user.model");
const { closeButton, replayButton, games, replaySameBetButton } = require("../modules/casino");
const { convertMonetary } = require("../service/utils");

module.exports = {
    name: "Pile ou Face",
    rules: "Choisir une des deux faces et gagner ou perdre en fonction de comment la pièce est retombée.",
    rewards: "Mise doublée",
    maxPlayers: 1,
    sameMise: true,
    image: "https://media.istockphoto.com/vectors/flipping-a-coin-illustration-vector-id1124512915?k=20&m=1124512915&s=612x612&w=0&h=3rb-JSXdYXEnMhTYv0E-8cTEOG0gU3uQ3fzBWdVoqyc=",
    /**
     * 
     * @param {ThreadChannel} channel 
     * @param {*} players 
     * @param {*} mise 
     */
    run: async (channel, host, players, mise, m, game) => {
        const gameId = games.indexOf(game);
        let embed = new EmbedBuilder()
            .setColor(COLORS.casino)
            .setTitle(":hourglass_flowing_sand: | TIM€・Pile ou Face")
            .setFooter(options.footer)
            .setDescription("Misez sur une face." + (mise > 0 ? "\nMise: **" + convertMonetary(mise) + "** Limon Noir" : ""));

        const row = new ActionRowBuilder().setComponents([...[
            new ButtonBuilder().setCustomId("face").setLabel("Face").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("pile").setLabel("Pile").setStyle(ButtonStyle.Secondary)
        ].sort(() => Math.random() - 0.5), closeButton(host.id)]);

        const message = m ? await m.edit({ embeds: [embed], components: [row], files: [] }) : await channel.send({ embeds: [embed], components: [row] });

        const response = await message.awaitMessageComponent({ filter: m => m.member.id === host.id, componentType: ComponentType.Button, time: 1000 * 60 * 5 });
        if (!["pile", "face"].includes(response.customId)) return;

        response.deferUpdate();

        const wface = response.customId;
        var face = getRandomInt(0, 2) == 0 ? "pile" : "face";

        embed
            .setDescription("Lancement de la pièce... " + (mise ? ("**" + convertMonetary(mise) + "** Limon Noir sont en jeu !") : ""))
            .setImage("https://gifsdomi.files.wordpress.com/2012/02/pic3a8ces-de-monnaie-15.gif");

        message.edit({ embeds: [embed], components: [] });

        setTimeout(async () => {
            let won = face === wface;

            embed.setImage("attachment://coin_" + face + ".png");
            embed.setDescription("C'est tombé sur **" + face + "** !" + (won ? " Vous avez gagné" : " Vous avez perdu") + (mise ? (" **" + convertMonetary(won ? mise * 2 : mise) + "** Limon Noir") : "") + ".");

            embed.setColor(won ? COLORS.valid : COLORS.error);

            if (won && mise) await User.addCoins(host.id, mise * 2).catch(console.log);

            await message.edit({ embeds: [embed], files: ['./ressources/images/coin ' + face + '.png'], components: [new ActionRowBuilder().setComponents(replaySameBetButton(gameId, mise), replayButton(gameId), closeButton(host.id))] }).catch(console.log);
        }, 1000);
    }
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}