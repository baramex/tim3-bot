const { VoiceState } = require("discord.js");
const { guild } = require("..");
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
        
        let channel = newState.channel;
        let afk = guild.afkChannelId;

        if ((!oldState.channel || oldState.channelId == afk) && channel && channel.id != afk) {
            if (!voice.find(a => a.id == newState.member.id)) voice.push({ id: newState.member.id, time: new Date().getTime() });
        }

        if ((!channel || channel.id == afk) && oldState.channel && oldState.channelId != afk) {
            await endVoice(newState.member.id);
        }
    }
}

async function endVoice(id) {
    var v = voice.find(a => a.id == id);
    if (v) {
        voice.splice(voice.indexOf(v), 1);

        var duration = new Date().getTime() - v.time;

        await User.addExp(id, Math.floor(duration / 1000 / 60 * 50));
        await User.addCoins(id, Math.floor(duration / 1000 / 60 * 100));
    }
}