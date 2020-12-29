const mongoose = require("mongoose");
const AirlineSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  addedOn: {
    type: String,
  },
});

const Airline = mongoose.model("Airline", AirlineSchema);
module.exports = Airline;
