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
            proba: 0.03,
            run: async (member, interaction) => {
                const cha = await createReport(member, "Nitro Discord 1 An", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "Clé Steam Aléatoire Diamond",
            image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS7x0AO05O2aPxwAwZ0RddT4hrly4aGg3IBlxbPmdynAXrvp04linqHDOM0vdk7r2Z2zJ-XlIjLAl0HCsSgIvlvC3KkVJhhUWIP-MERhq8h&usqp=CAE",
            proba: 0.3,
            run: async (member, interaction) => {
                const cha = await createReport(member, "Clé Steam Aléatoire Diamond", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "un Grade Timeless",
            image: "https://images-ext-1.discordapp.net/external/vaHQfFeRtHct2a9WdsgnyxqC4mbWMULOX6ulv9LJIDU/https/cdn-0.emojis.wiki/emoji-pics/microsoft/hourglass-done-microsoft.png",
            proba: 0.19,
            run: (member) => {
                let role = getRole("grade-timeless");
                if (!role) return;

                return member.roles.add(role);
            }
        },
        {
            name: "450 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.75,
            run: (member) => User.addCoins(member.id, 450_000_000)
        },
    ].sort((a, b) => a.proba - b.proba)
}