const User = require("../models/user.model");
const { createReport } = require("../modules/ticket");
const { getRole } = require("../service/config");

module.exports = {
    name: "Loot Box Lune",
    price: 250_000_000,
    image: "./ressources/images/lune.png",
    rewards: [
        {
            name: "un Grade Timeless",
            image: "https://images-ext-1.discordapp.net/external/vaHQfFeRtHct2a9WdsgnyxqC4mbWMULOX6ulv9LJIDU/https/cdn-0.emojis.wiki/emoji-pics/microsoft/hourglass-done-microsoft.png",
            proba: 0.05,
            run: (member) => {
                let role = getRole("grade-timeless");
                if (!role) return;

                return member.roles.add(role);
            }
        },
        {
            name: "Netflix 1 Mois",
            image: "https://cdn.futura-sciences.com/buildsv6/images/wide1920/0/3/0/030dc01da7_50145928_netflix-logo.jpg",
            proba: 0.20,
            run: async (member, interaction) => {
                const cha = await createReport(member, "Achat Netflix 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "Deezer 1 Mois",
            image: "https://www.journaldugeek.com/content/uploads/2021/12/deezer.jpg",
            proba: 0.25,
            run: async (member, interaction) => {
                const cha = await createReport(member, "Achat Deezer 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "Adn 1 Mois",
            image: "https://upload.wikimedia.org/wikipedia/commons/c/c7/ADN_Logo_2016.png",
            proba: 0.5,
            run: async (member, interaction) => {
                const cha = await createReport(member, "Achat Adn 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
    ].sort((a, b) => a.proba - b.proba)
}