const User = require("../models/user.model");
const { createReport } = require("../modules/ticket");

module.exports = {
    name: "Loot Box Nuage",
    price: 60_000_000,
    image: "./ressources/images/nuage.png",
    rewards: [
        {
            name: "300 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/bcf6dd06-7117-424f-9a6e-4bb795c8fb4d/preview.png",
            proba: 0.03,
            run: (member) => User.addCoins(member.id, 300_000_000)
        },
        {
            name: "un Nitro Discord 1 Mois",
            image: "https://cdn1.epicgames.com/salesEvent/salesEvent/EGS_Discord_Nitro_2560x1440_withlogo_2560x1440-944994658df3b04d0c4940be832da19e",
            proba: 0.08,
            run: async (member) => {
                const cha = await createReport(member, "Achat Nitro Discord 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Gagné dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "75 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/729ddd0b-3e18-47ea-a6c4-b9d4ae641f73/preview.png",
            proba: 0.33,
            run: (member) => User.addCoins(member.id, 75_000_000)
        },
        {
            name: "25 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.56,
            run: (member) => User.addCoins(member.id, 25_000_000)
        },
    ].sort((a, b) => a.proba - b.proba)
}