const { Schema, model } = require("mongoose");

const rewardSchema = new Schema({
    discordId: { type: String, required: true },
    orderId: { type: String, unique: true, required: true },
    produceId: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

const RewardModel = model('Reward', rewardSchema, "rewards");

class Reward {
    /**
     * 
     * @param {String} id 
     */
    static create(discordId, orderId, produceId) {
        return new RewardModel({ discordId, orderId, produceId }).save();
    }

    static getByOrderId(orderId) {
        return RewardModel.findOne({ orderId });
    }
}

module.exports = Reward;