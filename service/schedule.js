const { scheduleJob, RecurrenceRule, Range } = require("node-schedule");
const { fastUpdate } = require("./update");

function init() {
    const ruleMessage = new RecurrenceRule();
    ruleMessage.hour = new Range(8, 20, 4);

    scheduleJob("send-message", ruleMessage, () => {
        console.log("send message");
    });

    const ruleFastUpdate = new RecurrenceRule();
    ruleFastUpdate.minute = "*/15";

    scheduleJob("fast-update", ruleFastUpdate, fastUpdate);
}

module.exports = { init };