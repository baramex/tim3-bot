const { scheduleJob, RecurrenceRule, Range } = require("node-schedule");

function init() {
    const rule = new RecurrenceRule();
    rule.hour = new Range(8, 20, 4);

    scheduleJob(rule, () => {
        console.log("send message");
    });
}

module.exports = { init };