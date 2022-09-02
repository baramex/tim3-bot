const User = require("../models/user.model");
const { createReport } = require("../modules/ticket");
const { getRole } = require("../service/config");

module.exports = {
    name: "Loot Box Maître du Temps",
    price: 500_000_000,
    image: "./ressources/images/maitre-du-tps.png",
    rewards: [
        {
            name: "un Nitro Discord 1 An",
            image: "https://cdn1.epicgames.com/salesEvent/salesEvent/EGS_Discord_Nitro_2560x1440_withlogo_2560x1440-944994658df3b04d0c4940be832da19e",
            proba: 0.05,
            run: async (member) => {
                const cha = await createReport(member, "Achat Nitro Discord 1 An", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "un Grade Timeless",
            image: "https://images-ext-1.discordapp.net/external/vaHQfFeRtHct2a9WdsgnyxqC4mbWMULOX6ulv9LJIDU/https/cdn-0.emojis.wiki/emoji-pics/microsoft/hourglass-done-microsoft.png",
            proba: 0.20,
            run: (member) => {
                let role = getRole("grade-timeless");
                if (!role) return;

                return member.roles.add(role);
            }
        },
        {
            name: "Spotify 1 Mois",
            image: "https://www.scdn.co/i/_global/open-graph-default.png",
            proba: 0.25,
            run: async (member) => {
                const cha = await createReport(member, "Achat Spotify 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "450 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.5,
            run: (member) => User.addCoins(member.id, 450_000_000)
        },
    ].sort((a, b) => a.proba - b.proba)
}