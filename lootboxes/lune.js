const User = require("../models/user.model");
const { createReport } = require("../modules/ticket");
const { getRole } = require("../service/config");

module.exports = {
    name: "Loot Box Lune",
    price: 75_000_000,
    image: "./ressources/images/lune.png",
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
            name: "un Grade Timeless",
            image: "https://images-ext-1.discordapp.net/external/vaHQfFeRtHct2a9WdsgnyxqC4mbWMULOX6ulv9LJIDU/https/cdn-0.emojis.wiki/emoji-pics/microsoft/hourglass-done-microsoft.png",
            proba: 0.13,
            run: (member) => {
                let role = getRole("grade-timeless");
                if (!role) return;

                return member.roles.add(role);
            }
        },
        {
            name: "Deezer 1 Mois",
            image: "https://www.journaldugeek.com/content/uploads/2021/12/deezer.jpg",
            proba: 0.40,
            run: async (member, interaction) => {
                const cha = await createReport(member, "Deezer 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "Clé Steam Aléatoire Legendary",
            image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRbMYrtsOE6tRIsVL3D0GnUHo5F2Pn8MkTucN-6GrCoWePNi-OANP-1i8dRWllfuyIDGrxvzJtB7iJu4pTlXkZXeY3YnKITkWsdiWO_qLvm&usqp=CAE",
            proba: 0.45,
            run: async (member, interaction) => {
                const cha = await createReport(member, "Clé Steam Aléatoire Legendary", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
    ].sort((a, b) => a.proba - b.proba)
}