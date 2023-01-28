const { VoiceState, VoiceChannel } = require("discord.js");
const { options } = require("../client");
const User = require("../models/user.model");

const voice = [];

module.exports = {
    name: "voiceStateUpdate",
    /**
     * 
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState 
     * @returns 
     */
    run: async function (oldState, newState) {
        if (oldState.member.bot) return;

        const channel = newState.channel;
        const afk = options.guild.afkChannelId;

        if ((!oldState.channel || oldState.channelId == afk) && channel && channel.id != afk) {
            if (!voice.find(a => a.id == newState.member.id)) voice.push({ id: newState.member.id, time: new Date().getTime() });
        }

        if ((!channel || channel.id == afk) && oldState.channel && oldState.channelId != afk) {
            await endVoice(newState.member, oldState.channel);
        }
    }
}

/**
 * 
 * @param {String} id 
 * @param {VoiceChannel} channel 
 */
async function endVoice(member, channel) {
    const id = member.id;
    const v = voice.find(a => a.id == id);
    if (v) {
        voice.splice(voice.indexOf(v), 1);

        const duration = new Date().getTime() - v.time;

        const levelup = await User.addExp(member, Math.floor(duration / 1000 / 60 * 300));
        if (levelup) {
            channel.send(levelup.passed == 1 ?
                `<@${id}>, :clap: Vous prenez le temps d'obtenir un niveau supérieur: **${levelup.lvl}** et vous obtenez **${convertMonetary(levelup.reward)}** Limon Noir :hourglass_flowing_sand: !` :
                `<@${id}>, :clap: Vous prenez le temps d'obtenir **${levelup.passed}** niveaux supérieurs: **${levelup.lvl}** et vous obtenez **${convertMonetary(levelup.reward)}** Limon Noir :hourglass_flowing_sand: !`);
        }

        await User.addCoins(id, Math.floor(duration / 1000 / 60 * 3000));
    }
}