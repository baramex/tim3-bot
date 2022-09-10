const { default: axios } = require('axios');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { COLORS, options, client } = require('../client');
const { getChannel } = require('../service/config');

const produces = [
    {
        id: "6307b7f4574a3",
        type: "money",
        value: 1_000_000_000,
    },
    {
        id: "6307b9ad45ebb",
        type: "money",
        value: 500_000_000,
    },
    {
        id: "6307b9b0008af",
        type: "money",
        value: 250_000_000,
    },
    {
        id: "6307b9b1e580a",
        type: "money",
        value: 100_000_000,
    },
    {
        id: "62fe889099f61",
        type: "grade",
        value: "grade-timeless",
    },
    {
        id: "62fe866f1dc90",
        type: "grade",
        value: "grade-timelapse",
    }
];
const regexId = /^[0-9a-z]{6}-[0-9a-z]{10}-[0-9a-z]{6}$/;

class SellixApi {
    constructor(token) {
        this.token = token;
    }

    async getOrder(id) {
        return (await this.#fetch(`/orders/${id}`))?.order;
    }

    async getProduce(id) {
        return (await this.#fetch(`/products/${id}`))?.product;
    }

    async getAllOrders() {
        return (await this.#fetch("/orders")).orders;
    }

    async getAllProduces() {
        return (await this.#fetch("/products")).products;
    }

    #fetch(end, method = "GET") {
        return new Promise((res, rej) => {
            axios({
                method,
                url: "https://dev.sellix.io/v1" + end,
                headers: { authorization: "Bearer " + this.token }
            }).then(({ data }) => res(data.data)).catch(({ response }) => rej(response?.data || response));
        });
    }
}

const api = new SellixApi(process.env.SELLIX_API_KEY);

async function updateSellix() {
    const channel = getChannel("sellix");
    if (!channel) return;

    const produces = (await api.getAllProduces()).map(a => api.getProduce(a.uniqid));
    for (const i in produces) {
        produces[i] = await produces[i];
    }

    const embed = new EmbedBuilder()
        .setColor(COLORS.info)
        .setTitle("Magasin Sellix")
        .setURL("https://tim3.sellix.io/")
        .setFooter(options.footer)
        .setDescription("**" + (await api.getAllOrders()).length + "** commandes totalisées !\n\nFaites votre commande puis revenez ici pour recevoir votre récompense !")
        .setFields(produces.map(p => ({ name: p.title + " | " + (p.average_score || 0).toFixed(1) + " :star: (" + p.feedback.total + ")", value: p.sold_count + " achats | € " + p.price_display + "", inline: true })));

    const row = new ActionRowBuilder()
        .setComponents(
            new ButtonBuilder().setCustomId("purchase").setEmoji("🛍️").setLabel("Valider un achat").setStyle(ButtonStyle.Success),
        );

    const message = (await channel.messages.fetch({ limit: 5 })).find(m => m.author.id == client.user.id);
    if (message) message.edit({ embeds: [embed], components: [row] });
    else channel.send({ embeds: [embed], components: [row] });
}

module.exports = { api, regexId, produces, updateSellix };