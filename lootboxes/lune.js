const User = require("../models/user.model");
const { getRole } = require("../service/config");

module.exports = {
    name: "Loot Box Lune",
    price: 500_000_000,
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
            name: "750 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/bcf6dd06-7117-424f-9a6e-4bb795c8fb4d/preview.png",
            proba: 0.15,
            run: (member) => User.addCoins(member.id, 750_000_000)
        },
        {
            name: "550 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/729ddd0b-3e18-47ea-a6c4-b9d4ae641f73/preview.png",
            proba: 0.3,
            run: (member) => User.addCoins(member.id, 550_000_000)
        },
        {
            name: "250 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.5,
            run: (member) => User.addCoins(member.id, 250_000_000)
        },
    ].sort((a, b) => a.proba - b.proba)
}