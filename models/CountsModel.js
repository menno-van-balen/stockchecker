const mongoose = require("mongoose");


const schema = mongoose.Schema;

// we need a schema with original_url and short_url
const countsSchema = new schema({likes: {}}, { minimize: false });

const Counts = mongoose.model("counts", countsSchema);

module.exports = Counts;