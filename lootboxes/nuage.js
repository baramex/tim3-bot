const User = require("../models/user.model");
const { createReport } = require("../modules/ticket");

module.exports = {
    name: "Loot Box Nuage",
    price: 25_000_000,
    image: "./ressources/images/nuage.png",
    rewards: [
        {
            name: "10€ Paypal",
            image: "https://www.promo-parrain.com/membres/includes/uploads-img/800-718823053607c849b98ba59.65978129Logo-PayPal.png",
            proba: 0.02,
            run: async (member, interaction) => {
                const cha = await createReport(member, "10€ Paypal", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "1€ Paypal",
            image: "https://www.promo-parrain.com/membres/includes/uploads-img/800-718823053607c849b98ba59.65978129Logo-PayPal.png",
            proba: 0.20,
            run: async (member, interaction) => {
                const cha = await createReport(member, "1€ Paypal", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "21 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/bcf6dd06-7117-424f-9a6e-4bb795c8fb4d/preview.png",
            proba: 0.28,
            run: (member) => User.addCoins(member.id, 21_000_000)
        },
        {
            name: "11 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.50,
            run: (member) => User.addCoins(member.id, 11_000_000)
        },
    ].sort((a, b) => a.proba - b.proba)
}