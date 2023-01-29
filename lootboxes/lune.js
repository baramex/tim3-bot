const User = require("../models/user.model");
const { createReport } = require("../modules/ticket");
const { getRole } = require("../service/config");

module.exports = {
    name: "Loot Box Lune",
    price: 75_000_000,
    image: "./ressources/images/lune.png",
    rewards: [
        {
            name: "15€ Paypal",
            image: "https://www.promo-parrain.com/membres/includes/uploads-img/800-718823053607c849b98ba59.65978129Logo-PayPal.png",
            proba: 0.02,
            run: async (member, interaction) => {
                const cha = await createReport(member, "15€ Paypal", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "11€ Paypal",
            image: "https://www.promo-parrain.com/membres/includes/uploads-img/800-718823053607c849b98ba59.65978129Logo-PayPal.png",
            proba: 0.13,
            run: async (member, interaction) => {
                const cha = await createReport(member, "11€ Paypal", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "Clé Steam Aléatoire Legendary",
            image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTsK9H-p14NcaUN0qPIaTbWYKEZFX2WwI5LfMdt_BDqPkO0rpvE-jxR5l-1bZ1Aikvpez-dBrCxpQUzHMs93VPCbVvJ0p403CrbHpb0TtIpg7Pix0vPSKaJ-Q&usqp=CAE",
            proba: 0.40,
            run: async (member, interaction) => {
                const cha = await createReport(member, "Clé Steam Aléatoire Legendary", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "61 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.45,
            run: (member) => User.addCoins(member.id, 61_000_000)
        }
    ].sort((a, b) => a.proba - b.proba)
}