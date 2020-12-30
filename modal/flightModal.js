const mongoose = require("mongoose");
const FlightSchema = new mongoose.Schema({
  departure: {
    type: String,
  },
  arrival: {
    type: String,
  },
  airline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Airline",
  },
  price: {
    type: Number,
  },
  departure_date: {
    type: Date,
  },
  arrival_date: {
    type: Date,
  },
  available_seats: {
    type: Number,
  },
  addedOn: {
    type: String,
  },
});

const Flight = mongoose.model("Flight", FlightSchema);
module.exports = Flight;
