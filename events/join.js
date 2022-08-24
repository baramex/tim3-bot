const User = require("../models/user.model");

module.exports = {
    name: "guildMemberAdd",
    run: async function (message) {
        let exists = User.exists(message.author.id);

        if (!exists) await User.create(message.author.id);
    }
}