const { createReport, deleteReport } = require("../modules/ticket");
const { config } = require("../service/config");

let collectedTickets = [];

module.exports = {
    name: "interactionCreate",
    run: async function (interaction) {
        if (interaction.isSelectMenu() && interaction.customId == "ticket_type") {
            let type = config.get("tickets").value()[interaction.values[0]?.replace("_", "")] || "Autre";
            let pro = collectedTickets.find(a => a.id == interaction.member.id);
            if (!pro) collectedTickets.push({ id: interaction.member.id, time: new Date().getTime(), expireIn: 60 * 5, type });
            else {
                pro.time = new Date().getTime();
                pro.type = type;
            }

            interaction.deferUpdate().catch(console.error);
        }

        else if (interaction.isButton() && interaction.customId == "ticket_open") {
            let pro = collectedTickets.find(a => a.id == interaction.member.id);
            if (!pro || !pro.type) return interaction.reply({ ephemeral: true, content: "Vous devez sélectionner un type !" });

            collectedTickets.splice(collectedTickets.indexOf(pro), 1);

            createReport(interaction.member, pro.type, interaction).catch(console.error);
        }

        else if (interaction.isButton() && interaction.customId == "archive_ticket") {
            deleteReport(interaction).catch(console.error);
        }

        else if (interaction.isButton() && interaction.customId == "delete_ticket") {
            deleteReport(interaction, true).catch(console.error);
        }
    }
}