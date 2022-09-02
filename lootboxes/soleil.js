const User = require("../models/user.model");
const { getRole } = require("../service/config");

module.exports = {
    name: "Loot Box Soleil",
    price: 100_000_000,
    image: "./ressources/images/soleil.png",
    rewards: [
        {
            name: "200 Millions de Limon Noir",
            image: "https://assets.materialup.com/uploads/bcf6dd06-7117-424f-9a6e-4bb795c8fb4d/preview.png",
            proba: 0.5,
            run: (member) => User.addCoins(member.id, 200_000_000)
        },
        {
            name: "NordVpn 1 Mois",
            image: "https://media.wired.co.uk/photos/606d9bc4307b8f0b37c724bb/4:3/w_2664,h_1998,c_limit/wired-nordvpn-2.jpg",
            proba: 0.20,
            run: async (member) => {
                const cha = await createReport(member, "Achat NordVpn 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "Disney+ 1 Mois",
            image: "https://lumiere-a.akamaihd.net/v1/images/disneyplus-introducing_mob_m_7d834c16.jpeg?region=0,0,800,600&width=768",
            proba: 0.25,
            run: async (member) => {
                const cha = await createReport(member, "Achat Disney+ 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
        {
            name: "Salto 1 Mois",
            image: "https://c0.lestechnophiles.com/www.numerama.com/wp-content/uploads/2020/10/salto-une-ok.jpg?resize=1024,551",
            proba: 0.5,
            run: async (member) => {
                const cha = await createReport(member, "Achat Salto 1 Mois", interaction, true);
                await cha.send({ content: ":medal: Reçu dans une lootbox :white_check_mark:" });
            }
        },
    ].sort((a, b) => a.proba - b.proba)
}