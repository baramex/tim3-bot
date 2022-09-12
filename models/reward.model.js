const { Schema, model } = require("mongoose");
const { default: csv } = require("mongoose-csv-export");

const rewardSchema = new Schema({
    discordId: { type: String, required: true },
    orderId: { type: String, unique: true, required: true },
    produceId: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

rewardSchema.plugin(csv, {
    headers: 'DiscordID OrderID ProduceID Date',
    alias: {
        'OrderID': 'orderId',
        'ProduceID': 'produceId'
    },
    virtuals: {
        "DiscordID": (doc) => {
            return "=\"" + doc.discordId + "\"";
        },
        "Date": (doc) => {
            return doc.date.toLocaleDateString("fr-FR", { year: 'numeric', month: "numeric", day: 'numeric', hour: "2-digit", minute: "2-digit" });
        }
    }
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

    static async exportToCsv() {
        return RewardModel.csvReadStream(await RewardModel.find({}));
    }
}

module.exports = Reward;