const { options } = require("../client");

let invites = [];

async function getInviter() {
    const n = [];
    await options.guild.invites.fetch().then(invites => {
        invites.forEach(invite => {
            n.push({ id: invite.inviter.id, uses: invite.uses || 0, code: invite.code });
        });
    }).catch(console.error);
    const invite = invites.find(a => a.uses < n.find(b => b.id == a.id && b.code == a.code)?.uses);
    invites = n;
    return invite?.id;
}

module.exports = { invites, getInviter };