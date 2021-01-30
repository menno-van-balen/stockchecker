const mongoose = require("mongoose");


const schema = mongoose.Schema;

// const likesSchema = new schema({
// ip: { type: String, required: true },
// stocks: [{ type: String, required: true }]
// });

const stockSchema = new schema({
  stock: { type: String, required: true },
  likes: { type: Number, default: 0 },
  ips: [{ type: String }]
})

const Stocks = mongoose.model("stocks", stockSchema);

module.exports = Stocks;