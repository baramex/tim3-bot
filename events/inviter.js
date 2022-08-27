const { invites } = require("../service/inviter")

module.exports = {
    name: "inviteCreate",
    run: (invite) => {
        invites.push({ id: invite.inviter.id, uses: invite.uses || 0, code: invite.code });
    }
}