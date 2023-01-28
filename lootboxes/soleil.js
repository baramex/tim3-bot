const User = require("../models/user.model");
const { createReport } = require("../modules/ticket");

module.exports = {
    name: "Loot Box Soleil",
    price: 50_000_000,
    image: "./ressources/images/soleil.png",
    rewards: [
        {
            name: "3€ Paypal",
            image: "https://www.promo-parrain.com/membres/includes/uploads-img/800-718823053607c849b98ba59.65978129Logo-PayPal.png",
            proba: 0.05,
            run: async (member, interaction) => {
                const cha = await createReport(member, "3€ Paypal", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "1.5€ Paypal",
            image: "https://www.promo-parrain.com/membres/includes/uploads-img/800-718823053607c849b98ba59.65978129Logo-PayPal.png",
            proba: 0.15,
            run: async (member, interaction) => {
                const cha = await createReport(member, "1.5€ Paypal", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "Clé Steam Aléatoire Premium",
            image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTsK9H-p14NcaUN0qPIaTbWYKEZFX2WwI5LfMdt_BDqPkO0rpvE-jxR5l-1bZ1Aikvpez-dBrCxpQUzHMs93VPCbVvJ0p403CrbHpb0TtIpg7Pix0vPSKaJ-Q&usqp=CAE",
            proba: 0.20,
            run: async (member, interaction) => {
                const cha = await createReport(member, "Clé Steam Aléatoire Premium", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "200 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.60,
            run: (member) => User.addCoins(member.id, 200_000_000)
        },
    ].sort((a, b) => a.proba - b.proba)
}