const { Schema, model } = require("mongoose");
const { options } = require("../client");

const userSchema = new Schema({
    id: { type: String, unique: true, required: true },
    lvl: { type: Number, default: 1, min: 1 },
    exp: { type: Number, default: 0, min: 0 },
    coins: { type: Number, default: 1000, min: 0 },
    date: { type: Date, default: new Date() }
});

userSchema.pre("save", async function (next) {
    var doc = await UserModel.findOne({ id: this.id }).catch(console.error);
    if (!doc) return next();

    if (doc.exp == this.exp) return next();

    doc.exp = this.exp;
    var lvl = doc.lvl;
    var exp = doc.exp;

    var newLvl = User.getLevelFromExp(exp, lvl);

    if (newLvl <= 0) return next("Niveau négatif");

    if (newLvl > 1000) {
        this.exp = User.getMaxExp() - 1;
        return next();
    }

    if (newLvl != lvl) {
        // level up
        this.exp = User.getExp(exp);
        this.lvl = newLvl;
        this.coins += User.getReward(lvl, newLvl);
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

    static getMaxExp() {
        return 1000;
    }

    /**
     * 
     * @param {Number} exp
     * @returns 
     */
    static getExp(exp) {
        return exp % 1000;
    }

    /**
     * 
     * @param {Number} exp 
     * @param {Number} level 
     * @returns 
     */
    static getLevelFromExp(exp, level) {
        return Math.floor(exp / 1000) + level;
    }

    static getReward(oldLevel, newLevel) {
        let r = 0
        for (let i = oldLevel + 1; i <= newLevel; i++) {
            r += i % 10 == 0 ? 10000 : 1000;
        }
        return r;
    }

    /**
     * 
     * @param {String} id 
     * @param {Number} exp 
     * @returns 
     */
    static async addExp(id, exp) {
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

    static getTotalExpFromLvl(lvl) {
        return (lvl - 1) * User.getMaxExp();
    }

    static async totalExp() {
        const users = await UserModel.find({}, { lvl: 1, exp: 1 });

        return users.reduce((acc, user) => {
            return acc + user.exp + User.getTotalExpFromLvl(user.lvl);
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
}

module.exports = User;