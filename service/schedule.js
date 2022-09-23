const { scheduleJob, RecurrenceRule, Range } = require("node-schedule");
const { getChannel } = require("./config");
const { fastUpdate, update } = require("./update");

const messages = [
    "Vous pouvez Invitez vos Amis et Gagner 10'000 Limon Noirs pour votre engagement 🤝",
    "Vous pouvez consulter la catégorie : Nous Soutenir pour débloquer toutes les fonctionnalités du Serveur et accéder aux GiveAway Privés 💸",
    "Des GiveAway/Tournoi avec Récompenses , sont organisés tous les Jours ☄️", "Merci d'être sur le serveur Tim€ , Nous espérons que vous passerez un bon moment ⌛",
    "Pensez à appuyer sur le Bouton __Invest__ à La Banque  :chart_with_upwards_trend: toutes les **4h** pour récupérer votre investissement.( **30'000 Pièces** )",
    "Pour gagner des pièces , vous pouvez : **Envoyer des messages :incoming_envelope:** / **Rejoindre un Vocal :loud_sound: **/ **Inviter un Ami :heavy_plus_sign:1**",
    "Vous gagnez des **Limons Noir** :coin: à chaque **Niveaux** que vous passez :thunder_cloud_rain: !"
];
let current = Math.floor(Math.random() * messages.length);

function init() {
    const ruleMessage = new RecurrenceRule();
    ruleMessage.hour = new Range(7, 22, 2);
    ruleMessage.minute = 0;

    scheduleJob("send-message", ruleMessage, () => {
        let channel = getChannel("general");
        if (!channel) return;

        channel.send(messages[current]);
        current++;
        if (current >= messages.length) current = 0;
    });

    scheduleJob("fast-update", "*/5 * * * *", fastUpdate);
    scheduleJob("update", "* */3 * * *", update);
}

module.exports = { init };