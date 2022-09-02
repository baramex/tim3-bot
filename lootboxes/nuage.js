const User = require("../models/user.model");
const { createReport } = require("../modules/ticket");

module.exports = {
    name: "Loot Box Nuage",
    price: 50_000_000,
    image: "./ressources/images/nuage.png",
    rewards: [
        {
            name: "150 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/bcf6dd06-7117-424f-9a6e-4bb795c8fb4d/preview.png",
            proba: 0.05,
            run: (member) => User.addCoins(member.id, 150_000_000)
        },
        {
            name: "Crunchyroll 1 Mois",
            image: "http://store-images.s-microsoft.com/image/apps.44134.9007199266244356.8c8f8b98-231f-43f4-b251-7e5c4931b8a2.0a5801df-68bf-4fb5-888b-40f49a061c80",
            proba: 0.20,
            run: async (member) => {
                const cha = await createReport(member, "Achat Crunchyroll 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "Duolingo 1 Mois",
            image: "https://play-lh.googleusercontent.com/vdwiqPJOIgqtRTUsv0juyn7ulQjF-fiFPwV4A20vcC25ugC0wFMQAD9CIsTf2pmkwsxQ",
            proba: 0.25,
            run: (member) => {
                const cha = await createReport(member, "Achat Duolingo 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "51 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.50,
            run: (member) => User.addCoins(member.id, 51_000_000)
        },
    ].sort((a, b) => a.proba - b.proba)
}