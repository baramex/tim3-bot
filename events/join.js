const User = require("../models/user.model");

module.exports = {
    name: "guildMemberAdd",
    run: async function (member) {
        let exists = User.exists(member.id);

        if (!exists) await User.create(member.id);
    }
}