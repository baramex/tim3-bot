const { scheduleJob, RecurrenceRule, Range } = require("node-schedule");
const { getChannel } = require("./config");
const { fastUpdate } = require("./update");

const messages = ["Amusez vous bien gnnggng", "Invitez vos Amis gngngng", "Hesitez pas à visiter la boutique", "GiveAway Tous les 2 jours"];

function init() {
    const ruleMessage = new RecurrenceRule();
    ruleMessage.hour = new Range(8, 21, 4);
    ruleMessage.minute = 0;

    scheduleJob("send-message", ruleMessage, () => {
        let channel = getChannel("general");
        if (!channel) return;

        channel.send(messages[Math.floor(Math.random() * messages.length)]);
    });

    scheduleJob("fast-update", "*/1 * * * *", fastUpdate);
}

module.exports = { init };