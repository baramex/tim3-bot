const User = require("../models/user.model");
const { createReport } = require("../modules/ticket");
const { getRole } = require("../service/config");

module.exports = {
    name: "Loot Box Maître du Temps",
    price: 100_000_000,
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
            name: "2 Grades TimeLess: 1 pour vous, 1 pour votre +1",
            image: "https://images-ext-1.discordapp.net/external/vaHQfFeRtHct2a9WdsgnyxqC4mbWMULOX6ulv9LJIDU/https/cdn-0.emojis.wiki/emoji-pics/microsoft/hourglass-done-microsoft.png",
            proba: 0.17,
            run: async (member, interaction) => {
                let role = getRole("grade-timeless");
                if (!role) return;

                await member.roles.add(role);

                const cha = await createReport(member, "2 Grades TimeLess: 1 pour vous, 1 pour votre +1 (Grade déjà ajouté à " + interaction.user.tag + ")", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "Clé Steam Aléatoire Diamond",
            image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS7x0AO05O2aPxwAwZ0RddT4hrly4aGg3IBlxbPmdynAXrvp04linqHDOM0vdk7r2Z2zJ-XlIjLAl0HCsSgIvlvC3KkVJhhUWIP-MERhq8h&usqp=CAE",
            proba: 0.25,
            run: async (member, interaction) => {
                const cha = await createReport(member, "Clé Steam Aléatoire Diamond", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "51 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.55,
            run: (member) => User.addCoins(member.id, 51_000_000)
        }
    ].sort((a, b) => a.proba - b.proba)
}