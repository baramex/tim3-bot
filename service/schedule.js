const { scheduleJob, RecurrenceRule, Range } = require("node-schedule");
const { getChannel } = require("./config");
const { fastUpdate, update } = require("./update");

const messages = ["Vous pouvez Invitez vos Amis et Gagner 3000 Limon Noirs pour votre engagement 🤝", "Vous pouvez consulter la catégorie : Nous Soutenir pour débloquer toutes les fonctionnalités du Serveur et accéder aux GiveAway Privés 💸", "Des GiveAway/Tournoi avec Récompenses , sont organisés tout les 2/3 Jours ☄️", "Merci d'être sur le serveur Tim€ , Nous espérons que vous passerez un bon moment ⌛"];

function init() {
    const ruleMessage = new RecurrenceRule();
    ruleMessage.hour = new Range(7, 20, 3);
    ruleMessage.minute = 0;

    scheduleJob("send-message", ruleMessage, () => {
        let channel = getChannel("general");
        if (!channel) return;

        channel.send(messages[Math.floor(Math.random() * messages.length)]);
    });

    scheduleJob("fast-update", "*/5 * * * *", fastUpdate);
    scheduleJob("fast-update", "* */3 * * *", update);
}

module.exports = { init };