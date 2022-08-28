const User = require("../models/user.model");
const { createReport } = require("../modules/ticket");
const { getRole } = require("../service/config");

module.exports = {
    name: "Loot Box Maître du Temps",
    price: 1_000_000_000,
    image: "./ressources/images/maitre-du-tps.png",
    rewards: [
        {
            name: "un Nitro Discord 1 An",
            image: "https://cdn1.epicgames.com/salesEvent/salesEvent/EGS_Discord_Nitro_2560x1440_withlogo_2560x1440-944994658df3b04d0c4940be832da19e",
            proba: 0.03,
            run: async (member) => {
                const cha = await createReport(member, "Achat Nitro Discord 1 An", interaction, true);
                await cha.send({ content: ":medal: Gagné dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "un Grade Timeless",
            image: "https://images-ext-1.discordapp.net/external/vaHQfFeRtHct2a9WdsgnyxqC4mbWMULOX6ulv9LJIDU/https/cdn-0.emojis.wiki/emoji-pics/microsoft/hourglass-done-microsoft.png",
            proba: 0.17,
            run: (member) => {
                let role = getRole("grade-timeless");
                if (!role) return;

                return member.roles.add(role);
            }
        },
        {
            name: "650 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/729ddd0b-3e18-47ea-a6c4-b9d4ae641f73/preview.png",
            proba: 0.3,
            run: (member) => User.addCoins(member.id, 650_000_000)
        },
        {
            name: "500 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.5,
            run: (member) => User.addCoins(member.id, 500_000_000)
        },
    ].sort((a, b) => a.proba - b.proba)
}