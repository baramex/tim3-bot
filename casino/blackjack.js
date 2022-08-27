const { createCanvas } = require("canvas");
const { ButtonStyle, Colors, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ThreadChannel, ComponentType, AttachmentBuilder } = require("discord.js");
const { images } = require("..");
const { COLORS, options } = require("../client");
const User = require("../models/user.model");
const { closeButton, closeButtonRow } = require("../modules/casino");
const { convertMonetary, reduce } = require("../service/utils");

module.exports = {
    name: "Blackjack",
    rules: "Jouer au blackjack traditionnel illustré avec vos amis (ou tout seul), [règles du jeu](https://www.casinosbarriere.com/fr/nos-jeux/jeux-de-table/blackjack.html#:~:text=Il%20consiste%20%C3%A0%20battre%20la,remportez%201%20fois%20votre%20mise).",
    rewards: "Mise doublée/x2.5",
    maxPlayers: 5,
    sameMise: false,
    image: "https://upload.wikimedia.org/wikipedia/commons/3/33/Blackjack21.jpg",
    /**
     * 
     * @param {ThreadChannel} channel 
     * @param {*} players 
     * @param {*} mise 
     */
    run: async (channel, host, players, mise, message) => {
        const CARD_COLORS = {
            CLUBS: { image: images.clubs, color: "#212121" },
            DIAMONDS: { image: images.diamonds, color: "#E72F2F" },
            HEARTS: { image: images.hearts, color: "#E72F2F" },
            SPADES: { image: images.spades, color: "#212121" }
        };
        const cards = getAllCards(CARD_COLORS);
        const places = [{ type: "croupier", cards: pickupCards(cards, 2, CARD_COLORS) }];
        places.push(...[0, 1, 2, 3, 4].map(i => ({ type: "player", rot: (i + 1) * 30, id: players[i]?.member.id, pseudo: players[i]?.member.user.username, mise: players[i]?.mise, cards: pickupCards(cards, 2, CARD_COLORS) })));
        let croupier = places.find(a => a.type == "croupier");

        let turn = nextPlayer(places, places.filter(a => a.pseudo || a.type == "croupier").length);
        let splitturn = 0;

        if (totalVal(croupier.cards) != 21) {
            if (turn == 0) {
                var desc;
                bj = [...places.filter(a => a.pseudo && !a.lost && a.cards.length == 2 && totalVal(a.cards) == 21)];

                if (bj.length > 0) desc = `${bj.map(a => "**" + a.pseudo + "** (" + convertMonetary(a.mise) + ")").join(", ")} ont fait blackjack et ${bj.length > 1 ? "ont" : "a"} remporté ${bj.map(a => "**" + convertMonetary(a.mise) + "**").join(", ")} Limon Noir.`;

                if (mise) {
                    for (const place of bj) {
                        await User.addCoins(place.id, Math.round(place.mise * 2.5));
                    }
                }
            }

            croupier.cards[1].type = "reversed";
            await reply(places, message, turn, splitturn, desc, host);
            if (turn == 0) return;
        }
        else {
            const pushs = places.filter(a => a.type == "player" && totalVal(a.cards) == 21);
            for (const i in pushs) {
                await User.addCoins(pushs[i].id, mise);
            }
            return reply(places, message, 0, 0, pushs.length > 0 ? `Le croupier a fait blackjack mais ${pushs.map(a => `**${a.pseudo}** (${a.mise})`).join(", ")} ${pushs.length == 1 ? "a" : "ont"} récupéré ${pushs.length == 1 ? "sa" : "leur"} mise de ${pushs.map(a => convertMonetary(a.mise)).join(", ")} Limon Noir.` : "Le croupier vous a tous éclaté.", host);
        }

        const collector = message.createMessageComponentCollector({ filter: int => int.isButton() && players.some(a => a.member.id == int.user.id), time: 1000 * 60 * 10 });

        collector.on("collect", async collected => {
            const place = places[turn];
            if (collected.user.id != place.id) return collected.reply({ ephemeral: true, content: "Ce n'est pas votre tour !" });

            let action = collected.customId;
            if (action == "split" && (place.cards.length != 2 || place.cards[0].value != place.cards[1].value)) return collected.reply({ ephemeral: true, content: "Pour split, vos deux cartes doivent être de même valeur." });
            if (action == "double" && place.cards.length != 2) return collected.reply({ ephemeral: true, content: "Pour doubler, il vous faut 2 cartes." });

            if (totalVal(place.cards, splitturn) == 21) {
                action = "";
                turn = nextPlayer(places, turn);
            }
            if (action === "hit" || action === "double") {
                if (action === "double" && place.mise) {
                    if (await User.getMoney(place.id) < place.mise) return collected.reply({ ephemeral: true, content: "Vous n'avez pas assez d'argent pour doubler votre mise." });
                    await User.addCoins(place.id, -place.mise);
                    place.mise *= 2;
                }

                place.cards.push(pickupCard(cards, CARD_COLORS, isSplit(place.cards) ? "split-" + splitturn : action === "double" ? "double" : "normal"));
                if (totalVal(place.cards, splitturn) >= 21) isSplit(place.cards) ? splitturn++ : turn = nextPlayer(places, turn);

                if (splitturn > 1 || action === "double") {
                    splitturn = 0;
                    turn = nextPlayer(places, turn);
                }
            }
            else if (action === "stand") {
                if (isSplit(place.cards)) splitturn++;
                else turn = nextPlayer(places, turn);

                if (splitturn > 1) {
                    splitturn = 0;
                    turn = nextPlayer(places, turn);
                }
            }
            else if (action == "split") {
                place.cards[0].type = "split-0";
                place.cards[1].type = "split-1";
                place.mise /= 2;
            }

            collected.deferUpdate();

            if (turn == 0) {
                croupier.cards[1].type = "normal";
                while (totalVal(croupier.cards) < 17) {
                    croupier.cards.push(pickupCard(cards, CARD_COLORS));
                }

                let winners = [];
                let pushs = [];
                let bj = [];
                var desc = "";
                let val = totalVal(croupier.cards);
                if (val > 21) {
                    desc = "Le croupier a explosé.";
                    winners.push(...places.filter(a => a.pseudo && totalVal(a.cards, 0) <= 21));
                    winners.push(...places.filter(a => a.pseudo && totalVal(a.cards, 1) <= 21));
                }
                else {
                    desc = "Le croupier a fait " + val + ".";
                    winners.push(...places.filter(a => a.pseudo && totalVal(a.cards, 0) > val && totalVal(a.cards, 0) <= 21));
                    winners.push(...places.filter(a => a.pseudo && totalVal(a.cards, 1) > val && totalVal(a.cards, 1) <= 21));
                    pushs.push(...places.filter(a => a.pseudo && totalVal(a.cards, 0) == val));
                    pushs.push(...places.filter(a => a.pseudo && totalVal(a.cards, 1) == val));
                }

                bj.push(...places.filter(a => a.pseudo && a.cards.length == 2 && totalVal(a.cards, 0) == 21));
                bj.push(...places.filter(a => a.pseudo && a.cards.length == 2 && totalVal(a.cards, 1) == 21));
                bj.forEach(a => {
                    const i = winners.findIndex(b => b.id == a.id);
                    if (i !== -1) winners.splice(i, 1);
                });

                if (pushs.length > 0) desc += ` ${pushs.map(a => `**${a.pseudo}** (${convertMonetary(a.mise)})`).join(", ")} ${pushs.length == 1 ? "a" : "ont"} récupéré ${pushs.length == 1 ? "sa" : "leur"} mise de **${pushs.map(a => convertMonetary(a.mise)).join(", ")}** Limon Noir.`;
                if (winners.length > 0) desc += ` ${winners.map(a => `**${a.pseudo}** (${convertMonetary(a.mise)})`).join(", ")} ${winners.length == 1 ? "a" : "ont"} gagné et ${winners.length == 1 ? "a" : "ont"} remporté **${winners.map(a => convertMonetary(a.mise * 2)).join(", ")}** Limon Noir.`;
                if (bj.length > 0) desc += ` ${bj.map(a => `**${a.pseudo}** (${convertMonetary(a.mise)})`).join(", ")} ${bj.length == 1 ? "a" : "ont"} fait blackjack et ${bj.length == 1 ? "a" : "ont"} remporté **${bj.map(a => convertMonetary(Math.round(a.mise * 2.5))).join(", ")}** Limon Noir.`;

                for (const place of pushs) {
                    await User.addCoins(place.id, place.mise);
                }
                for (const place of winners) {
                    await User.addCoins(place.id, place.mise * 2);
                }
                for (const place of bj) {
                    await User.addCoins(place.id, Math.round(place.mise * 2.5));
                }

                collector.stop();
            }

            await reply(places, message, turn, splitturn, desc, host);
        }).on("end", (collected, reason) => {
            if (reason == "time") {
                bot.removeCommandeCooldown(interaction.member, interaction.commandName);
                message.edit({ content: "Interaction terminée, 5 minutes écoulées", components: [closeButton(host.id)] }).catch(console.error);
            }
        });
    }
};

function nextPlayer(places, turn) {
    do {
        turn--;
    }
    while (turn > 0 && ((places[turn].lost && places[turn].state && places[turn].statesplit) || totalVal(places[turn].cards) >= 21));

    turn = Math.max(turn, 0);

    return turn;
}

function isSplit(cards) {
    return cards.some(a => a.type.startsWith("split-0"));
}

function totalVal(cards, split = 0) {
    let val = cards.filter(a => (split || a.type.startsWith("split-")) ? a.type == "split-" + split : true).map(a => a.value == "A" ? 11 : Number(a.value) || 10).reduce((p, c) => p + c, 0);

    if (val > 21) {
        let nAce = cards.filter(a => a.value == "A" && a.type != "reversed" && ((split || a.type.startsWith("split-")) ? a.type == "split-" + split : true)).length;
        while (nAce > 0 && val > 21) {
            nAce--;
            val -= 10;
        }
    }

    return val;
}

async function reply(places, message, turn, splitturn, description, host) {
    const canvas = generateGame(places, turn, splitturn);

    if (turn !== 0) {
        var row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("hit").setEmoji("➕").setLabel("hit").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("stand").setEmoji("➖").setLabel("stand").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("double").setEmoji("⏩").setLabel("double").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("split").setEmoji("🔀").setLabel("split").setStyle(ButtonStyle.Primary),
            closeButton(host.id)
        );
    }
    const embed = new EmbedBuilder()
        .setColor(COLORS.casino)
        .setTitle(":hourglass_flowing_sand: | TIM€・Blackjack")
        .setFooter(options.footer)
        .setImage("attachment://bj.png");

    if (description) embed.setDescription(description);
    else if (turn) embed.setDescription("Au tour de **" + places[turn]?.pseudo + "**" + (isSplit(places[turn]?.cards) ? [", première", ", seconde"][splitturn] + " main" : "") + ".");

    const obj = { embeds: [embed], files: [new AttachmentBuilder(canvas.toBuffer(), { name: "bj.png" })], components: row ? [row] : [closeButtonRow(host.id)] };
    message.edit(obj);
}

const VALUES = {
    ACE: "A",
    TWO: "2",
    THREE: "3",
    FOUR: "4",
    FIVE: "5",
    SIX: "6",
    SEVEN: "7",
    EIGHT: "8",
    NINE: "9",
    TEN: "10",
    JACK: "J",
    QUEEN: "Q",
    KING: "K",
};

function getAllCards(COLORS) {
    const list = [];
    Object.values(VALUES).forEach(val => {
        Object.keys(COLORS).forEach(col => {
            list.push({ value: val, color: col });
        });
    });
    return list;
}

function pickupCards(cards, number, COLORS) {
    const c = [];
    for (let i = 0; i < number; i++) {
        c.push(pickupCard(cards, COLORS));
    }
    return c;
}

function pickupCard(cards, COLORS, type = "normal") {
    const i = Math.floor(Math.random() * cards.length);
    const card = cards[i];
    cards.splice(i, 1);
    return { ...card, type, color: COLORS[card.color] };
}

function generateGame(places, turn, splitturn) {
    const canvas = createCanvas(600, 305);
    const ctx = canvas.getContext("2d");

    // plateau
    ctx.fillStyle = "green";
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, ctx.lineWidth, canvas.width / 2 - ctx.lineWidth / 2, 0, Math.PI);
    ctx.moveTo(0, ctx.lineWidth / 2);
    ctx.lineTo(canvas.width, ctx.lineWidth / 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = "brown";
    ctx.font = "bold italic 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TIM€", canvas.width / 2, canvas.width / 4);

    // cartes
    places.forEach((place, placei) => {
        ctx.save();
        if (place.type != "croupier") {
            var x = Math.cos(degToRad(place.rot)) * canvas.width / 2;
            var y = Math.sqrt((canvas.width / 2) ** 2 - x ** 2);
            ctx.translate(canvas.width / 2 - x, y);
            ctx.rotate(degToRad(90 - place.rot));

            if (!place.pseudo) {
                ctx.beginPath();
                ctx.strokeStyle = "#212121";
                ctx.lineWidth = 1;
                ctx.arc(0, -30, 12, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
                return;
            }

            ctx.translate(0, -80);
        }
        else ctx.translate(canvas.width / 2 - 57 / 2, 20);

        let val = 0;
        let valsplit = 0;
        let valtxt = "";
        let valtxtsplit = "";
        place.cards.forEach((c, i, l) => {
            if (c.type != "reversed") {
                let tval = c.value != "A" ? Number(c.value) || 10 : 11;
                if (c.type.startsWith("split-") && c.type == "split-1") valsplit += tval;
                else val += tval;
            }

            if (!c.type.startsWith("split-")) {
                if (c.type == "double") ctx.translate(-57 / 2 + 1, 0);

                card(ctx, place.type == "croupier" ? 0 : -57 / 2 * .5, place.type == "croupier" ? 0 : -88 / 2 * .5, c.value, c.color, c.type == "reversed");

                if (place.type == "croupier") {
                    if (l[1].type == "reversed" && i == 0) ctx.translate(57 / 2, 0);
                    else ctx.translate(57 / 4, 0);
                }
                else ctx.translate(28, 0);
            }
        });

        if (valsplit) {
            const s0 = place.cards.filter(a => a.type == "split-0");
            const s1 = place.cards.filter(a => a.type == "split-1");

            ctx.save();
            ctx.translate(57 / 2 - 10, 0);
            s0.forEach(c => {
                card(ctx, - 57 / 2 * .5, -88 / 2 * .5, c.value, c.color);
                ctx.translate(57 / 4, 0);
            });
            ctx.restore();

            ctx.translate(-57 / 2 + 10, 0);
            s1.forEach(c => {
                card(ctx, - 57 / 2 * .5, -88 / 2 * .5, c.value, c.color);
                ctx.translate(57 / 4, 0);
            });
        }

        let aceSplit = val < 21 && place.cards.filter(a => a.type.startsWith("split-") ? a.type == "split-0" : true).some(a => a.value == "A" && a.type != "reversed");
        if (val > 21) {
            let nAce = place.cards.filter(a => a.value == "A" && a.type != "reversed" && (a.type.startsWith("split-") ? a.type == "split-0" : true)).length;
            while (nAce > 0 && val > 21) {
                nAce--;
                val -= 10;
            }
            aceSplit = nAce > 0 && val < 21;
        }

        if (aceSplit) valtxt = (val - 10) + "|" + val;
        else if (val > 21) {
            place.state = "bust";
            if (!valsplit) place.lost = true;
            valtxt = "💥";
        }
        else if (val == 21 && place.cards.length == 2) {
            place.type = "blackjack";
            valtxt = "Bj";
        }
        else valtxt = val;
        place.val = val;

        if (valsplit) {
            let aceSplitSplit = val < 21 && place.cards.filter(a => a.type === "split-1").some(a => a.value == "A" && a.type != "reversed");
            if (valsplit > 21) {
                let nAce = place.cards.filter(a => a.value == "A" && a.type == "split-1" && a.type != "reversed").length;
                while (nAce > 0 && valsplit > 21) {
                    nAce--;
                    valsplit -= 10;
                }
                aceSplitSplit = nAce > 0 && val < 21;
            }

            if (aceSplitSplit) valtxtsplit = (valsplit - 10) + "|" + valsplit;
            else if (valsplit > 21) {
                place.statesplit = "bust";
                if (!val > 21) place.lost = true;
                valtxtsplit = "💥";
            }
            else if (valsplit == 21 && place.cards.length == 2) {
                place.statesplit = "blackjack";
                valtxtsplit = "Bj";
            }
            else valtxtsplit = valsplit;

            place.valsplit = valsplit;
        }

        ctx.restore();

        ctx.save();
        ctx.translate(canvas.width / 2 - x, y);
        ctx.rotate(degToRad(90 - place.rot));

        // jetons
        if (place.type != "croupier") {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(0, -40, 12, 0, Math.PI * 4);
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = "#19BBDD";
            ctx.beginPath();
            for (let i = 0; i < 18; i += 1.5) {
                const end = i % 4.5 == 0 ? degToRad(360 / 18 * (i + (i % 4.5 == 0 ? 0.3 : 0)) + 6) : degToRad(360 / 18 * (i + 1));
                ctx.arc(0, -40, 12, degToRad(360 / 18 * (i + (i % 4.5 == 0 ? 0.3 : 0))), end);
                ctx.lineTo(0, -40);
            }
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = "#1882D7";
            ctx.beginPath();
            ctx.fillStyle = "";
            ctx.arc(0, -40, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            let miseStr = reduce(place.mise || 0, 0, "");
            ctx.font = (miseStr && miseStr.length > 1 ? miseStr.length > 2 ? 9 : 11 : 12) + "px Arial";
            ctx.fillText(miseStr, 0, -40);
        }

        ctx.font = "14px Arial";
        const valueSize = Math.max(ctx.measureText(valtxtsplit || valtxt).width + 10, 25);

        if (place.pseudo) {
            ctx.font = "15px Arial";
            var pseudoSize = ctx.measureText(place.pseudo);

            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(place.pseudo, valsplit ? 0 : -10, -10);
        }

        if (valsplit) ctx.translate(-valueSize - 15, -55);
        else if (!place.pseudo) ctx.translate(canvas.width / 2 - valueSize / 2, 70);

        ctx.fillStyle = (turn == placei && (valsplit ? splitturn == 1 : true)) ? "rgba(255, 255, 0, .9)" : "rgba(33, 33, 33, .7)";
        const xbadge = place.pseudo ? -57 / 2 + pseudoSize.width / 2 + 20 + 2 : 0;
        const ybadge = place.pseudo ? -60 + 88 / 4 + pseudoSize.actualBoundingBoxAscent : 0;
        roundedRect(ctx, valsplit ? 0 : xbadge, valsplit ? 0 : ybadge, valueSize, 23, 10);
        ctx.fill();

        if ((valtxtsplit || valtxt) != "💥") {
            ctx.fillStyle = (turn == placei && (valsplit ? splitturn == 1 : true)) ? "#212121" : "yellow";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "14px Arial";
            ctx.fillText(valtxtsplit || valtxt, valueSize / 2 + (valsplit ? 0 : xbadge), 23 / 2 + (valsplit ? 0 : ybadge));
        }
        else {
            ctx.drawImage(images.bust, xbadge + valueSize / 2 - 20 / 2, ybadge + 23 / 2 - 20 / 2, 20, 20);
        }

        if (valsplit) {
            const valueSizesplit = Math.max(ctx.measureText(valtxt).width + 10, 25);
            ctx.translate(valueSize + 30, 0);

            ctx.fillStyle = (turn == placei && (valsplit ? splitturn == 0 : true)) ? "rgba(255, 255, 0, .9)" : "rgba(33, 33, 33, .7)";
            roundedRect(ctx, 0, 0, valueSizesplit, 23, 10);
            ctx.fill();

            if (valtxt != "💥") {
                ctx.fillStyle = (turn == placei && (valsplit ? splitturn == 0 : true)) ? "#212121" : "yellow";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "14px Arial";
                ctx.fillText(valtxt, valueSizesplit / 2, 23 / 2);
            }
            else {
                ctx.drawImage(images.bust, valueSizesplit / 2 - 20 / 2, 23 / 2 - 20 / 2, 20, 20);
            }
        }
        ctx.restore();
    });

    return canvas;
}

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Stirng} value 
 * @param {{image:HTMLImageElement,color:string}} color 
 */
function card(ctx, x, y, value, color, reversed = false) {
    const size = .5;
    const width = 57 * size;
    const height = 88 * size;

    ctx.translate(x, y);
    ctx.fillStyle = reversed ? "#FFF0F1" : "white";
    ctx.strokeStyle = color.color;
    ctx.lineWidth = .5;
    roundedRect(ctx, 0, 0, width, height, size * 4);
    ctx.fill();
    ctx.stroke();

    if (reversed) {
        ctx.save();
        ctx.globalAlpha = .8;
        ctx.drawImage(images.logo, width / 2 - images.logo.width * size / 3 / 2, height / 2 - images.logo.width * size / 3 / 2, images.logo.width * size / 3, images.logo.height * size / 3);
        ctx.restore();
    }
    else {
        const symbols = createCanvas(width, size * 23);
        const sCtx = symbols.getContext('2d');
        sCtx.drawImage(color.image, width - size * 20 - size * 4, 0, size * 20, size * 20);
        sCtx.fillStyle = color.color;
        sCtx.font = "bold " + size * 22 + "px Arial";
        sCtx.textBaseline = "top";
        sCtx.textAlign = "left";
        sCtx.fillText(value, size * 4, 0);

        ctx.save();
        ctx.globalAlpha = .6;
        ctx.drawImage(images.logo, width / 2 - images.logo.width * size / 6 / 2, height / 2 - images.logo.width * size / 6 / 2, images.logo.width * size / 6, images.logo.height * size / 6);
        ctx.restore();

        ctx.drawImage(symbols, 0, size * 4);
        ctx.save();
        ctx.translate(width, height - size * 4);
        ctx.rotate(-Math.PI);
        ctx.drawImage(symbols, 0, 0);
        ctx.restore();
    }
}

function roundedRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}