const { EmbedBuilder, CommandInteraction, ButtonBuilder, ActionRowBuilder, ChannelType, SelectMenuBuilder, ButtonStyle, Message, ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { COLORS, options } = require("../client");
const { updateBank } = require("../modules/bank");
const { updateLevel } = require("../modules/level");
const { updateTicket } = require("../modules/ticket");
const { config } = require("../service/config");

/**
 * 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports.run = async (interaction) => {
    let modo = interaction.member;
    let type = interaction.options.getSubcommand(true);
    let { footer, guild } = options;

    if (!modo.permissions.has("ADMINISTRATOR")) {
        throw new Error("Vous n'avez pas les permissions pour faire ça !");
    }

    if (type == "check") {
        let errors = [];

        let channels = config.get("channels").value();
        channels.forEach(channel => {
            if (!channel.id) errors.push({ key: "channels", event: channel.event, type: "Non paramétré" });
            else if (!guild.channels.cache.get(channel.id)) errors.push({ key: "channels", event: channel.event, type: "Invalide" });
        });

        let roles = config.get("roles").value();
        roles.forEach(role => {
            if (!role.id) errors.push({ key: "roles", event: role.type, type: "Non paramétré" });
            else if (!guild.roles.cache.get(role.id)) errors.push({ key: "roles", event: role.type, type: "Invalide" });
        });

        let embed = new EmbedBuilder()
            .setColor(errors.length > 0 ? COLORS.warning : COLORS.valid)
            .setTitle(":hourglass_flowing_sand: | TIM€・Configuration")
            .setFooter(footer)
            .setDescription(errors.length > 0 ? `:warning: ${errors.length} problèmes ont été trouvés !` : ":white_check_mark: aucun problème trouvé !");

        if (errors.length > 0) {
            let fields = [];
            new Set(errors.map(a => a.key)).forEach(key => {
                let errs = errors.filter(a => a.key == key);
                fields.push({ name: key, value: errs.map(a => `__${a.event}__: ${a.type}`).join("\n"), inline: true });
            });

            embed.setFields(fields);
        }

        return interaction.reply({ embeds: [embed] });
    }

    let desc = "...";
    if (type == "channels") desc = "Paramétrer les salons et les catégories d'évènement";
    else if (type == "roles") desc = "Paramétrer les rôles et les grades";
    else if (type == "tickets") desc = "Paramétrer les types de ticket (*/config channels* pour le salon)";

    let s = showAlls();
    await interaction.reply({ embeds: [s.embed], components: s.components });

    function showAlls() {
        let fields = [];
        let rows = [];
        if (type == "channels") {
            let channels = config.get("channels").value();
            fields = channels.map(a => { return { name: a.event, value: (guild.channels.cache.get(a.id)?.id ? ("**<#" + guild.channels.cache.get(a.id)?.id + ">**") : "**NON PARAMÉTRÉ**") + "\n" + a.description, inline: true }; });
            rows.push(new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId("event").setPlaceholder("Sélectionner un évènement").addOptions(channels.map(a => { return { label: a.event, value: a.event } }))));
        }
        else if (type == "roles") {
            let roles = config.get("roles").value();
            fields = roles.map(a => { return { name: a.type, value: (guild.roles.cache.get(a.id)?.id ? ("**<@&" + guild.roles.cache.get(a.id)?.id + ">**") : "**NON PARAMÉTRÉ**") + "\n" + a.description, inline: true }; });
            rows.push(new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId("event").setPlaceholder("Sélectionner un type").addOptions([...roles.map(a => { return { label: a.type, value: a.type } })])));
        }
        else if (type == "tickets") {
            fields.push({ name: "types", value: "Liste des types:" + config.get("tickets").value().map(a => "\n - " + a) });
            rows.push(new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("add").setStyle(ButtonStyle.Success).setLabel("Ajouter"), new ButtonBuilder().setCustomId("delete").setStyle(ButtonStyle.Danger).setLabel("Supprimer")))
        }

        let embed = new EmbedBuilder()
            .setColor(COLORS.info)
            .setTitle(":hourglass_flowing_sand: | TIM€・Configuration")
            .setFooter(footer)
            .setDescription(desc)
            .setFields(fields);

        return { embed, components: rows };
    }

    function showOne(event, type_ = 0) {
        let components = [];
        let field = [];

        let return_btn = new ButtonBuilder().setCustomId("back_" + type_).setEmoji("⬅").setStyle(ButtonStyle.Danger);

        if (type == "channels") {
            let channel = config.get("channels").find({ event }).value();
            if (channel) field = [channel.event, (guild.channels.cache.get(channel.id)?.id ? ("<#" + guild.channels.cache.get(channel.id)?.id + ">") : "**NON PARAMÉTRÉ**") + "\n" + channel.description + "\nType: **" + channel.types.map(type => ChannelType[type]).join(", ") + "**"];

            if (type_ == 0) {
                components.push(new ActionRowBuilder().addComponents(return_btn, new ButtonBuilder().setCustomId("edit").setLabel("Modifier").setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId("delete").setLabel("Supprimer").setStyle(ButtonStyle.Danger)));
            }
            else if (type_ == 1) {
                let channels = guild.channels.cache.filter(a => channel.types.includes(a.type)).map(a => { return { label: "#" + a.name.substring(0, 23), description: ChannelType[a.type], value: a.id }; });
                let list_options = [];
                while (channels.length > 0) {
                    list_options.push(channels.splice(0, 25));
                }
                list_options.forEach((options_, i) => {
                    components.push(new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId("value_" + i).setPlaceholder("Sélectionner un salon (n°" + i + ")").setOptions(options_).setMinValues(0)))
                });
                components.push(new ActionRowBuilder().addComponents(return_btn, new ButtonBuilder().setCustomId("valid").setLabel("Valider").setStyle(ButtonStyle.Success)));
            }
        }
        else if (type == "roles") {
            let role = config.get("roles").find({ type: event }).value();
            if (role) field = [role.type, (guild.roles.cache.get(role.id)?.id ? ("**<@&" + guild.roles.cache.get(role.id)?.id + ">**") : "**NON PARAMÉTRÉ**") + "\n" + role.description];

            if (type_ == 0) {
                components.push(new ActionRowBuilder().addComponents(return_btn, new ButtonBuilder().setCustomId("edit").setStyle(ButtonStyle.Primary).setLabel("Modifier"), new ButtonBuilder().setCustomId("delete").setStyle(ButtonStyle.Danger).setLabel("Supprimer")));
            }
            else if (type_ == 1 || type_ == 2) {
                let options = guild.roles.cache.sort((a, b) => b.position - a.position).map(a => { return { label: a.name, value: a.id }; });
                let list_options = [];
                while (options.length > 0) {
                    list_options.push(options.splice(0, 25));
                }
                list_options.forEach((options_, i) => {
                    components.push(new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId("value_" + i).setPlaceholder("Sélectionner un rôle (n°" + i + ")").setOptions(options_).setMinValues(0)))
                });
                components.push(new ActionRowBuilder().addComponents(return_btn, new ButtonBuilder().setCustomId("valid" + (type_ == 2 ? "_add" : "")).setLabel("Valider").setStyle(ButtonStyle.Success)));
            }
        }
        else if (type == "tickets") {
            components.push(new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId("event_delete").setPlaceholder("Sélectionner le type").setOptions(config.get("tickets").value().map((a, i) => { return { label: a.substring(0, 24), value: i + "_" } }))), new SelectMenuBuilder().addComponents(return_btn, new ButtonBuilder().setCustomId("delete").setStyle(ButtonStyle.Danger).setLabel("Supprimer")));
            field = ["types", "Liste des types:" + config.get("tickets").value().map(a => "\n - " + a)];
        }

        let embed = new EmbedBuilder()
            .setColor(COLORS.info)
            .setTitle(":hourglass_flowing_sand: | TIM€・Configuration")
            .setFooter(footer)
            .setDescription(desc)
            .addFields([{ name: field[0], value: field[1] }]);

        return { embed, components };
    }

    let backs = { 0: showAlls, 1: (event) => showOne(event, 0), 2: (event) => showOne(event, 0) };

    let replied = await interaction.fetchReply();
    if (!(replied instanceof Message)) return;
    let collector = replied.createMessageComponentCollector({ filter: int => (int.isSelectMenu() || int.isButton()) && int.user.id == modo.id, time: 1000 * 60 * 5 });

    let key = undefined;
    let value = undefined;
    let to_del = undefined;

    let collected_id = undefined;
    let collected_name = undefined;
    let collcted_time = undefined;

    collector.on("collect", async collected => {
        if (collected.customId.startsWith("back_")) {
            let identifier = collected.customId.replace("back_", "");
            if (backs[identifier]) {
                to_del = undefined;
                let e = backs[identifier](key);
                await collected.update({ embeds: [e.embed], components: e.components });
            }
        }
        else if (collected.customId == "event") {
            key = collected.values[0];

            if (type != "stats") {
                let e = showOne(key);
                await collected.update({ embeds: [e.embed], components: e.components });
            }
            else await collected.deferUpdate();
        }
        else if (collected.customId == "delete" && type == "tickets" && config.get("tickets").value().length == 0) return collected.reply({ ephemeral: true, content: "Il n'y a pas de type !" });
        else if (collected.customId == "add" && type == "tickets" && config.get("tickets").value().length >= 25) return collected.reply({ ephemeral: true, content: "Il y a trop de types !" });
        else if (collected.customId == "edit" && key) {
            let e = showOne(key, 1);

            await collected.update({ embeds: [e.embed], components: e.components });
        }
        else if (collected.customId == "event_delete") {
            to_del = collected.values[0].replace("_", "");

            await collected.deferUpdate();
        }
        else if (collected.customId == "delete") {
            if (type == "tickets" && !to_del) {
                let e = showOne(key);

                return await collected.update({ embeds: [e.embed], components: e.components });
            }

            if (type == "channels") config.get("channels").find({ event: key }).assign({ id: undefined }).write();
            else if (type == "roles") await config.get("roles").find({ type: key }).assign({ id: undefined }).write();
            else if (type == "tickets") {
                config.set("tickets", bot.config.get("tickets").filter((a, i) => i != to_del).value()).write();

                await updateTicket().catch(console.error);
            }

            let e = showAlls();

            await collected.update({ embeds: [e.embed], components: e.components });

            key = undefined;
            value = undefined;
            to_del = undefined;
        }
        else if (collected.customId.startsWith("value_")) {
            if (type == "channels") value = guild.channels.cache.get(collected.values[0]);
            else if (type == "roles") {
                value = guild.roles.cache.get(collected.values[0]);
            }
            collected.deferUpdate();
        }
        else if (collected.customId == "valid") {
            if (value && key) {
                if (type == "channels") config.get("channels").find({ event: key }).assign({ id: value.id }).write();
                else if (type == "roles") config.get("roles").find({ type: key }).assign({ id: value.id }).write();

                let e = showAlls();

                if (type == "channels") {
                    switch (key) {
                        case "banque": await updateBank().catch(console.error); break;
                        case "tickets": await updateTicket().catch(console.error); break;
                        case "niveau": await updateLevel().catch(console.error); break;
                    }
                }

                await collected.update({ embeds: [e.embed], components: e.components });

                key = undefined;
                value = undefined;
                to_del = undefined;
            }
            else await collected.reply({ content: "Vous devez sélectionner une valeur !", ephemeral: true });
        }
        else if (collected.customId == "add") {
            let modal = new ModalBuilder().setCustomId("add_type").setTitle("Ajouter un type").addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("val").setRequired(true).setStyle(TextInputStyle.Short).setMaxLength(100).setLabel("Type")))

            await collected.showModal(modal);
            if (!collected_id || collected_name != modal.customId || collcted_time + 1000 * 60 <= new Date().getTime()) {
                collected_id = collected.id;
                collected_name = modal.customId;
                collcted_time = new Date().getTime();

                collected.awaitModalSubmit({ time: 1000 * 60 }).then(async res => {
                    collected_id = undefined;

                    let val = res.fields.getField("val").value;

                    config.get("tickets").push(val).write();
                    updateTicket().catch(console.error);

                    let e = showAlls();

                    await res.update({ embeds: [e.embed], components: e.components }).catch(console.error);
                });
            }
        }
    });
};

module.exports.info = {
    name: "config",
    description: "permet de configurer les letiables.",
    category: "mod",
    options: [
        {
            name: "channels",
            description: "configurer les salons et catégories.",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "roles",
            description: "configurer les rôles et grades.",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "tickets",
            description: "configurer les types de tickets.",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "check",
            description: "permet de vérifier la validité des paramètres.",
            type: ApplicationCommandOptionType.Subcommand
        }
    ]
};