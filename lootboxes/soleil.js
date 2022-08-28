const User = require("../models/user.model");
const { getRole } = require("../service/config");

module.exports = {
    name: "Loot Box Soleil",
    price: 100_000_000,
    image: "./ressources/images/soleil.png",
    rewards: [
        {
            name: "un Grade Timelapse",
            image: "https://images-ext-2.discordapp.net/external/4NMWSyMkPSXdNjgoWvfW9gNldf3txTalLSV7X77BAv8/https/les-raccourcis-clavier.fr/wp-content/uploads/2019/03/Emoji-foudre.png",
            proba: 0.04,
            run: (member) => {
                let role = getRole("grade-timelapse");
                if (!role) return;

                return member.roles.add(role);
            }
        },
        {
            name: "200 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/bcf6dd06-7117-424f-9a6e-4bb795c8fb4d/preview.png",
            proba: 0.11,
            run: (member) => User.addCoins(member.id, 200_000_000)
        },
        {
            name: "125 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/729ddd0b-3e18-47ea-a6c4-b9d4ae641f73/preview.png",
            proba: 0.25,
            run: (member) => User.addCoins(member.id, 125_000_000)
        },
        {
            name: "50 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/27355340-a295-4c0f-88c1-8e45c92adad0/preview.png",
            proba: 0.6,
            run: (member) => User.addCoins(member.id, 50_000_000)
        },
    ].sort((a, b) => a.proba - b.proba)
}