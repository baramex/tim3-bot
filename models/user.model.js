const { GuildMember } = require("discord.js");
const { Schema, model } = require("mongoose");
const { options } = require("../client");
const { getRole } = require("../service/config");

const userSchema = new Schema({
    id: { type: String, unique: true, required: true },
    lvl: { type: Number, default: 1, min: 1 },
    exp: { type: Number, default: 0, min: 0 },
    coins: { type: Number, default: 1000, min: 0 },
    invites: { type: Number, default: 0, min: 0 },
    date: { type: Date, default: new Date() }
});

const levelRewards = [100_000, 200_000, 300_000, 400_000, 500_000, 750_000, 1_000_000, 5_000_000, 10_000_000, 25_000_000];
const levelRoles = ["1017481276619489370", "1017481452016902246", "1017481768628129842", "1017481832222167100", "1017481921237897336", "1017482001734959246", "1017482064653713509", "1017482127379533875", "1017482190025658539", "1017482288809902180"];

const invitRewards = [100_000, 200_000, 300_000, 400_000, 500_000, 750_000, 1_000_000];
const invitRoles = ["1017467416181219338", "1017468062137581608", "1017468802050564097", "1017468975602479124", "1017469105869160479", "1017469293471989760", "1017469459306397777"];

userSchema.pre("save", async function (next) {
    const doc = await UserModel.findOne({ id: this.id }).catch(console.error);
    if (!doc) return next();

    if (doc.exp != this.exp) {
        doc.exp = this.exp;
        const lvl = doc.lvl;
        const exp = doc.exp;

        const newLvl = User.getLevelFromExp(exp);

        if (newLvl.level <= 0) return next("Niveau négatif");

        if (newLvl.level > 100) {
            this.exp = User.getMaxExpFromLevel(newLvl) - 1;
            return next();
        }

        if (newLvl.level != lvl) {
            // level up
            this.exp = newLvl.exp;
            this.lvl = newLvl.level;
            this.coins += User.getReward(lvl, newLvl);

            // palier up
            const member = options.guild.members.cache.get(this.id);
            if (member && newLvl % 10 === 0) {
                const role = options.guild.roles.cache.get(levelRoles[newLvl / 10 - 1]);
                if (role) {
                    member.roles.add(role);
                }
            }
        }
    }
    if (doc.invites != this.invites) {
        const member = options.guild.members.cache.get(this.id);
        if (member && this.invites % 10 === 0) {
            const role = options.guild.roles.cache.get(invitRoles[this.invites / 10 - 1]);
            if (role) {
                member.roles.add(role);
            }
            const reward = invitRewards[this.invites / 10 - 1];
            this.coins += reward;
        }
    }

    next();
});

const UserModel = model('User', userSchema, "users");

class User {
    /**
     * 
     * @param {String} id 
     */
    static create(id) {
        var user = new UserModel({ id });
        return user.save();
    }

    static addInvite(id) {
        return UserModel.updateOne({ id }, { $inc: { invites: 1 } });
    }

    /**
     * 
     * @param {Number} exp
     * @returns 
     */
    static getLevelFromExp(exp, level) {
        while (exp >= User.getMaxExpFromLevel(level)) {
            exp -= User.getMaxExpFromLevel(level);
            level++;
        }
        return { level, exp };
    }

    static getMaxExpFromLevel(level) {
        return 1000 * 1.0576 ** level - 40;
    }

    static getTotalExp(level, exp) {
        new Array(level).fill(0).map((_, i) => User.getMaxExpFromLevel(i + 1)).reduce((a, b) => a + b, 0) + exp;
    }

    static getReward(oldLevel, newLevel) {
        let r = 0;
        for (let i = oldLevel + 1; i <= newLevel; i++) {
            r += i % 10 == 0 ? levelRewards[i / 10 - 1] : 1000;
        }
        return r;
    }

    /**
     * 
     * @param {GuildMember} member 
     * @param {Number} exp 
     * @returns 
     */
    static async addExp(member, exp) {
        const id = member.id;
        let bonus = 1;
        const roletla = getRole("grade-timelapse");
        const roletle = getRole("grade-timeless");

        if (roletla && member.roles.cache.has(roletla.id)) bonus = 1.1;
        if (roletle && member.roles.cache.has(roletle.id)) bonus = 1.3;

        exp *= bonus;

        let user = await UserModel.findOne({ id });
        if (!user) {
            user = await User.create(id);
        }
        let level = user.lvl;
        user.exp += exp;
        user = await user.save();

        return level != user.lvl ? { lvl: user.lvl, passed: user.lvl - level, reward: User.getReward(level, user.lvl) } : false;
    }

    static async totalMoney() {
        const users = await UserModel.find({}, { coins: 1 });

        return users.reduce((acc, user) => {
            return acc + user.coins;
        }, 0);
    }

    static async totalExp() {
        const users = await UserModel.find({}, { lvl: 1, exp: 1 });

        return users.reduce((acc, user) => {
            return acc + User.getTotalExp(user.lvl, user.exp);
        }, 0);
    }

    static async top50Money() {
        const users = await UserModel.find({}, { id: 1, coins: 1 }, { sort: { coins: -1 } });

        return users.filter(({ id }) => options.guild.members.cache.has(id)).splice(0, 50);
    }

    static async top50Level() {
        const users = await UserModel.find({}, { id: 1, lvl: 1, exp: 1 }, { sort: { lvl: -1, exp: -1 } });

        return users.filter(({ id }) => options.guild.members.cache.has(id)).splice(0, 50);
    }

    static async getMoney(id) {
        return (await UserModel.findOne({ id }, { coins: 1 })).coins;
    }

    static getLevel(id) {
        return UserModel.findOne({ id }, { lvl: 1, exp: 1 });
    }

    static async getRank(id) {
        const users = await UserModel.find({}, { id: 1, lvl: 1, exp: 1 }, { sort: { lvl: -1, exp: -1 } });

        return users.filter(({ id: i }) => options.guild.members.cache.has(i)).findIndex(a => a.id == id) + 1;
    }

    static exists(id) {
        return UserModel.exists({ id });
    }

    static async addCoins(id, coins) {
        let user = await UserModel.findOne({ id });
        if (!user) {
            user = await User.create(id);
        }
        user.coins += coins;
        await user.save();

        return coins;
    }

    static async wipe() {
        await UserModel.updateMany({}, { $set: { coins: 1000, lvl: 1, exp: 0 } });
    }
}

module.exports = User;